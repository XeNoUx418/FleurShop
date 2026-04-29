from rest_framework import serializers
from django.utils import timezone
from .models import (
    Category, Product,
    Cart, CartItem,
    Coupon, GiftCard,
    Order, OrderItem, Payment
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'category', 'category_name', 'image_url']


# ─── CART ─────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source='product.name',      read_only=True)
    product_price = serializers.DecimalField(source='product.price',  read_only=True, max_digits=8, decimal_places=2)
    is_expired    = serializers.BooleanField(read_only=True)
    subtotal      = serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'saved_for_later', 'expires_at', 'is_expired', 'subtotal']

    def get_subtotal(self, obj):
        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    active_items = serializers.SerializerMethodField()
    saved_items  = serializers.SerializerMethodField()
    cart_total   = serializers.SerializerMethodField()

    class Meta:
        model  = Cart
        fields = ['id', 'customer_username', 'active_items', 'saved_items', 'cart_total']

    def get_active_items(self, obj):
        return CartItemSerializer(obj.get_active_items(), many=True).data

    def get_saved_items(self, obj):
        return CartItemSerializer(obj.get_saved_items(), many=True).data

    def get_cart_total(self, obj):
        return sum(
            item.product.price * item.quantity
            for item in obj.get_active_items()
        )


# ─── COUPON ───────────────────────────────────────────────────

class CouponValidateSerializer(serializers.Serializer):
    code        = serializers.CharField()
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2)


class CouponResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Coupon
        fields = [
            'id', 'code', 'coupon_type', 'value',
            'min_order_value', 'max_uses', 'times_used',
            'valid_from', 'valid_until', 'is_active'
        ]


# ─── GIFT CARD ────────────────────────────────────────────────

class GiftCardValidateSerializer(serializers.Serializer):
    code = serializers.CharField()


class GiftCardResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = GiftCard
        fields = [
            'id', 'code', 'initial_balance', 'remaining_balance',
            'issued_to', 'is_active', 'created_at', 'expires_at'
        ]


# ─── ORDER ────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = ['id', 'method', 'status', 'amount', 'transaction_id', 'paid_at']


class OrderSerializer(serializers.ModelSerializer):
    items   = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'customer_email', 'customer_username', 'status',
            'original_total', 'discount_amount', 'gift_card_amount', 'final_total',
            'coupon', 'gift_card', 'created_at', 'items', 'payment'
        ]


class PlaceOrderSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField())
    # Optional fields
    coupon_code    = serializers.CharField(required=False, allow_blank=True)
    gift_card_code = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=['cash', 'cib', 'edahabia', 'gift_card'],
        default='cash'
    )