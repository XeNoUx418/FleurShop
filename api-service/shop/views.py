from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
import uuid
from .permissions import IsAdminRole
import random
import string

from .models import (
    Category, Product,
    Cart, CartItem,
    Coupon, CouponUsage, GiftCard,
    Order, OrderItem, Payment
)
from .serializers import (
    CategorySerializer, ProductSerializer,
    CartSerializer, CartItemSerializer,
    CouponValidateSerializer, CouponResponseSerializer,
    GiftCardValidateSerializer, GiftCardResponseSerializer,
    OrderSerializer, PlaceOrderSerializer, PaymentSerializer
)
from .rabbitmq import publish_order_event, publish_status_event, publish_inventory_alert


# ─── CATEGORY ─────────────────────────────────────────────────

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = CategorySerializer(Category.objects.all(), many=True)
        return Response(serializer.data)


# ─── PRODUCT ──────────────────────────────────────────────────

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category_id = request.query_params.get('category')
        products = Product.objects.all()
        if category_id:
            products = products.filter(category_id=category_id)
        return Response(ProductSerializer(products, many=True).data)

    def post(self, request):
        # Check admin permission manually for write operations
        if not request.user.is_authenticated or getattr(request.user, 'role', '') != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        return Response(ProductSerializer(product).data)

    def put(self, request, pk):
        if not request.user.is_authenticated or getattr(request.user, 'role', '') != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        product    = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.is_authenticated or getattr(request.user, 'role', '') != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        get_object_or_404(Product, pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── CART ─────────────────────────────────────────────────────

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_or_create_cart(self, username):
        cart, _ = Cart.objects.get_or_create(customer_username=username)
        return cart

    def get(self, request):
        """Get the current user's cart"""
        cart = self._get_or_create_cart(request.user.username)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        """Add a product to cart"""
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))
        product    = get_object_or_404(Product, pk=product_id)

        if product.stock < quantity:
            return Response({'error': 'Not enough stock'}, status=status.HTTP_400_BAD_REQUEST)

        cart = self._get_or_create_cart(request.user.username)

        # If item already exists in cart, update quantity
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={
                'quantity':   quantity,
                'expires_at': timezone.now() + timezone.timedelta(hours=24)
            }
        )
        if not created:
            item.quantity  += quantity
            item.expires_at = timezone.now() + timezone.timedelta(hours=24)  # reset timer
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Remove an item from cart"""
        item_id = request.data.get('item_id')
        item    = get_object_or_404(CartItem, pk=item_id, cart__customer_username=request.user.username)
        item.delete()
        return Response({'message': 'Item removed'})


class CartItemSaveView(APIView):
    """Move item between active cart and saved for later"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        item = get_object_or_404(CartItem, pk=item_id, cart__customer_username=request.user.username)
        item.saved_for_later = not item.saved_for_later  # toggle
        item.expires_at      = timezone.now() + timezone.timedelta(hours=24)
        item.save()
        action = 'saved for later' if item.saved_for_later else 'moved to cart'
        return Response({'message': f'Item {action}'})


# ─── COUPON ───────────────────────────────────────────────────

class CouponValidateView(APIView):
    """Validate a coupon code before applying it at checkout"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code        = serializer.validated_data['code']
        order_total = serializer.validated_data['order_total']

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=status.HTTP_404_NOT_FOUND)

        if not coupon.is_valid():
            return Response({'error': 'Coupon is expired or has reached its usage limit'}, status=status.HTTP_400_BAD_REQUEST)

        if order_total < coupon.min_order_value:
            return Response(
                {'error': f'Minimum order value for this coupon is {coupon.min_order_value} DZD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already used this coupon
        if CouponUsage.objects.filter(coupon=coupon, customer_username=request.user.username).exists():
            return Response({'error': 'You have already used this coupon'}, status=status.HTTP_400_BAD_REQUEST)

        discounted_total = coupon.apply_discount(order_total)
        return Response({
            'coupon':           CouponResponseSerializer(coupon).data,
            'original_total':   order_total,
            'discounted_total': discounted_total,
            'you_save':         order_total - discounted_total,
        })


# ─── GIFT CARD ────────────────────────────────────────────────

class GiftCardValidateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GiftCardValidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            gift_card = GiftCard.objects.get(code=serializer.validated_data['code'])
        except GiftCard.DoesNotExist:
            return Response({'error': 'Invalid gift card code'}, status=status.HTTP_404_NOT_FOUND)

        if not gift_card.is_valid():
            return Response({'error': 'Gift card is expired or has no remaining balance'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(GiftCardResponseSerializer(gift_card).data)


# ─── ORDER ────────────────────────────────────────────────────

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer_username=request.user.username)
        return Response(OrderSerializer(orders, many=True).data)

    @transaction.atomic  # ← ALL or NOTHING
    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data           = serializer.validated_data
        items_data     = data['items']
        coupon_code    = data.get('coupon_code', '')
        gift_card_code = data.get('gift_card_code', '')
        payment_method = data.get('payment_method', 'cash')

        # ── 1. Validate products & calculate original total ──
        original_total = 0
        order_items    = []

        for item in items_data:
            product = get_object_or_404(Product, pk=item['product_id'])
            qty     = item['quantity']
            if product.stock < qty:
                return Response(
                    {'error': f'Not enough stock for {product.name}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            original_total += product.price * qty
            order_items.append({'product': product, 'quantity': qty, 'price': product.price})

        final_total     = original_total
        discount_amount = 0
        gift_card_amount = 0
        coupon_obj      = None
        gift_card_obj   = None

        # ── 2. Apply coupon if provided ──
        if coupon_code:
            try:
                coupon_obj = Coupon.objects.get(code=coupon_code)
                if not coupon_obj.is_valid():
                    return Response({'error': 'Coupon is no longer valid'}, status=status.HTTP_400_BAD_REQUEST)
                if CouponUsage.objects.filter(coupon=coupon_obj, customer_username=request.user.username).exists():
                    return Response({'error': 'You already used this coupon'}, status=status.HTTP_400_BAD_REQUEST)
                discounted = coupon_obj.apply_discount(final_total)
                discount_amount = final_total - discounted
                final_total     = discounted
            except Coupon.DoesNotExist:
                return Response({'error': 'Invalid coupon code'}, status=status.HTTP_400_BAD_REQUEST)

        # ── 3. Apply gift card if provided ──
        if gift_card_code:
            try:
                gift_card_obj = GiftCard.objects.get(code=gift_card_code)
                if not gift_card_obj.is_valid():
                    return Response({'error': 'Gift card is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)
                # Use as much of the gift card balance as needed
                gift_card_amount        = min(gift_card_obj.remaining_balance, final_total)
                final_total            -= gift_card_amount
                gift_card_obj.remaining_balance -= gift_card_amount
                gift_card_obj.save()
            except GiftCard.DoesNotExist:
                return Response({'error': 'Invalid gift card code'}, status=status.HTTP_400_BAD_REQUEST)

        # ── 4. Create the order ──
        order = Order.objects.create(
            customer_email   = request.user.email,
            customer_username= request.user.username,
            original_total   = original_total,
            discount_amount  = discount_amount,
            gift_card_amount = gift_card_amount,
            final_total      = final_total,
            coupon           = coupon_obj,
            gift_card        = gift_card_obj,
        )

        # ── 5. Create order items & deduct stock ──
        for item in order_items:
            OrderItem.objects.create(
                order    = order,
                product  = item['product'],
                quantity = item['quantity'],
                price    = item['price'],
            )
            item['product'].stock -= item['quantity']
            item['product'].save()
        
        # ── Inventory alert check ──────────────────
        if item['product'].stock <= 5:
            publish_inventory_alert(
                product_id    = item['product'].id,
                product_name  = item['product'].name,
                current_stock = item['product'].stock,
                order_id      = order.id,
            )

        # ── 6. Mark coupon as used ──
        if coupon_obj:
            CouponUsage.objects.create(coupon=coupon_obj, customer_username=request.user.username)
            coupon_obj.times_used += 1
            coupon_obj.save()

        # ── 7. Create payment record ──
        Payment.objects.create(
            order          = order,
            method         = payment_method,
            amount         = final_total,
            status         = 'paid' if payment_method == 'cash' else 'pending',
            transaction_id = str(uuid.uuid4()),
            paid_at        = timezone.now() if payment_method == 'cash' else None,
        )

        # ── 8. Clear user's cart ──
        Cart.objects.filter(customer_username=request.user.username).delete()

        # ── 9. Publish to RabbitMQ ──
        # Build items list for email
        email_items = [
            {
                'name':     item['product'].name,
                'quantity': item['quantity'],
                'subtotal': str(item['price'] * item['quantity']),
            }
            for item in order_items
        ]

        # Publish to RabbitMQ
        publish_order_event(
            order_id      = order.id,
            customer_email= order.customer_email,
            total         = str(final_total),
            customer_name = request.user.username,
            items         = email_items,
        )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk, customer_username=request.user.username)
        return Response(OrderSerializer(order).data)

    def patch(self, request, pk):
        order        = get_object_or_404(Order, pk=pk)
        order.status = request.data.get('status', order.status)
        order.save()
        return Response(OrderSerializer(order).data)
    

# ─── ADMIN DASHBOARD ──────────────────────────────────────────

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        from django.db.models import Sum, Count

        # ── Order stats ──
        total_orders    = Order.objects.count()
        pending_orders  = Order.objects.filter(status='pending').count()
        preparing_orders= Order.objects.filter(status='preparing').count()
        delivered_orders= Order.objects.filter(status='delivered').count()
        cancelled_orders= Order.objects.filter(status='cancelled').count()

        # ── Revenue ──
        total_revenue   = Order.objects.exclude(
            status='cancelled'
        ).aggregate(r=Sum('final_total'))['r'] or 0

        # ── Product stats ──
        total_products  = Product.objects.count()
        out_of_stock    = Product.objects.filter(stock=0).count()
        low_stock       = Product.objects.filter(stock__gt=0, stock__lt=5).count()

        # ── Recent orders ──
        recent_orders   = OrderSerializer(
            Order.objects.order_by('-created_at')[:10],
            many=True
        ).data

        # ── Revenue per day (last 7 days) ──
        from django.utils import timezone
        from django.db.models.functions import TruncDate
        last_7_days = Order.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).annotate(
            day=TruncDate('created_at')
        ).values('day').annotate(
            revenue=Sum('final_total'),
            count=Count('id')
        ).order_by('day')

        return Response({
            'orders': {
                'total':     total_orders,
                'pending':   pending_orders,
                'preparing': preparing_orders,
                'delivered': delivered_orders,
                'cancelled': cancelled_orders,
            },
            'revenue': {
                'total':    total_revenue,
                'per_day':  list(last_7_days),
            },
            'products': {
                'total':        total_products,
                'out_of_stock': out_of_stock,
                'low_stock':    low_stock,
            },
            'recent_orders': recent_orders,
        })


# ─── ADMIN ORDERS ─────────────────────────────────────────────

class AdminOrderListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Optional filter by status: /api/admin/orders/?status=pending
        status_filter = request.query_params.get('status')
        orders = Order.objects.all().order_by('-created_at')
        if status_filter:
            orders = orders.filter(status=status_filter)
        return Response(OrderSerializer(orders, many=True).data)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        return Response(OrderSerializer(order).data)


    def patch(self, request, pk):
        order        = get_object_or_404(Order, pk=pk)
        new_status   = request.data.get('status')

        VALID_STATUSES = ['pending', 'preparing', 'delivered', 'cancelled']
        if new_status not in VALID_STATUSES:
            return Response(
                {'error': f'Invalid status. Must be one of: {VALID_STATUSES}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        # Notify customer via email (async through RabbitMQ)
        publish_status_event(
            order_id      = order.id,
            customer_email= order.customer_email,
            total         = str(order.final_total),
            status        = new_status,
            customer_name = order.customer_username,
        )

        return Response(OrderSerializer(order).data)

# ─── ADMIN PRODUCTS ───────────────────────────────────────────
# Note: Product CRUD already exists in ProductListView and
# ProductDetailView. We just need to lock them to admins.
# Update those views' POST/PUT/DELETE to require IsAdminRole.


# ─── ADMIN CATEGORIES ─────────────────────────────────────────

class AdminCategoryCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── ADMIN COUPONS ────────────────────────────────────────────

class AdminCouponView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        coupons = Coupon.objects.all().order_by('-id')
        return Response(CouponResponseSerializer(coupons, many=True).data)

    def post(self, request):
        from django.utils import timezone as tz

        code = request.data.get('code', '').strip().upper()
        if not code:
            return Response(
                {'error': 'Coupon code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Coupon.objects.filter(code=code).exists():
            return Response(
                {'error': 'A coupon with this code already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        coupon = Coupon.objects.create(
            code            = code,
            coupon_type     = request.data.get('coupon_type', 'percentage'),
            value           = request.data.get('value', 0),
            min_order_value = request.data.get('min_order_value', 0),
            max_uses        = request.data.get('max_uses', 100),
            valid_from      = request.data.get('valid_from', tz.now()),
            valid_until     = request.data['valid_until'],
            is_active       = True,
        )
        return Response(
            CouponResponseSerializer(coupon).data,
            status=status.HTTP_201_CREATED
        )

    def delete(self, request, pk=None):
        coupon = get_object_or_404(Coupon, pk=pk)
        coupon.is_active = False
        coupon.save()
        return Response({'message': 'Coupon deactivated'})


# ─── ADMIN GIFT CARDS ─────────────────────────────────────────

class AdminGiftCardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        cards = GiftCard.objects.all().order_by('-id')
        return Response(GiftCardResponseSerializer(cards, many=True).data)

    def post(self, request):
        balance = request.data.get('balance')
        if not balance:
            return Response(
                {'error': 'Balance is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Auto-generate code if not provided
        code = request.data.get('code', '').strip().upper()
        if not code:
            code = ''.join(
                random.choices(string.ascii_uppercase + string.digits, k=12)
            )

        if GiftCard.objects.filter(code=code).exists():
            return Response(
                {'error': 'A gift card with this code already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        card = GiftCard.objects.create(
            code              = code,
            initial_balance   = balance,
            remaining_balance = balance,
            issued_to         = request.data.get('issued_to', ''),
            expires_at        = request.data['expires_at'],
            is_active         = True,
        )
        return Response(
            GiftCardResponseSerializer(card).data,
            status=status.HTTP_201_CREATED
        )