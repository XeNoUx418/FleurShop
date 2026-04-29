from django.db import models
from django.utils import timezone


# ─── EXISTING Fondamental MODELS  ──────────────────────────────

class Category(models.Model):
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class Product(models.Model):
    name        = models.CharField(max_length=200)
    description = models.TextField()
    price       = models.DecimalField(max_digits=8, decimal_places=2)
    stock       = models.IntegerField(default=0)
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    image_url   = models.URLField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ─── CART ─────────────────────────────────────────────────────

class Cart(models.Model):
    customer_username = models.CharField(max_length=150, unique=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    def get_active_items(self):
        """Returns only items that haven't expired"""
        return self.items.filter(
            saved_for_later=False,
            expires_at__gt=timezone.now()
        )

    def get_saved_items(self):
        return self.items.filter(saved_for_later=True)

    def __str__(self):
        return f"Cart of {self.customer_username}"


class CartItem(models.Model):
    cart            = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product         = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity        = models.IntegerField(default=1)
    saved_for_later = models.BooleanField(default=False)
    expires_at      = models.DateTimeField()  # 24h from when item was added
    added_at        = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        # Auto-set expiry to 24h from now if not set
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.cart}"

    class Meta:
        unique_together = ('cart', 'product')  # one entry per product per cart


# ─── COUPON ───────────────────────────────────────────────────

class Coupon(models.Model):
    TYPE_CHOICES = [
        ('percentage', 'Percentage'),   # e.g. 20% off
        ('fixed',      'Fixed Amount'), # e.g. 500 DZD off
        ('free_ship',  'Free Shipping'),
    ]

    code            = models.CharField(max_length=50, unique=True)
    coupon_type     = models.CharField(max_length=20, choices=TYPE_CHOICES)
    value           = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    min_order_value = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_uses        = models.IntegerField(default=1)
    times_used      = models.IntegerField(default=0)
    valid_from      = models.DateTimeField()
    valid_until     = models.DateTimeField()
    is_active       = models.BooleanField(default=True)

    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.times_used < self.max_uses and
            self.valid_from <= now <= self.valid_until
        )

    def apply_discount(self, total):
        """Returns the discounted total"""
        if self.coupon_type == 'percentage':
            return total * (1 - self.value / 100)
        elif self.coupon_type == 'fixed':
            return max(total - self.value, 0)  # never go below 0
        return total  # free_ship doesn't change total

    def __str__(self):
        return f"{self.code} ({self.coupon_type})"


class CouponUsage(models.Model):
    """Tracks which user used which coupon — prevents double use"""
    coupon            = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    customer_username = models.CharField(max_length=150)
    used_at           = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('coupon', 'customer_username')

    def __str__(self):
        return f"{self.customer_username} used {self.coupon.code}"


# ─── GIFT CARD ────────────────────────────────────────────────

class GiftCard(models.Model):
    code              = models.CharField(max_length=50, unique=True)
    initial_balance   = models.DecimalField(max_digits=8, decimal_places=2)
    remaining_balance = models.DecimalField(max_digits=8, decimal_places=2)
    issued_to         = models.EmailField(blank=True)   # optional: lock to one email
    is_active         = models.BooleanField(default=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    expires_at        = models.DateTimeField()

    def is_valid(self):
        return (
            self.is_active and
            self.remaining_balance > 0 and
            timezone.now() <= self.expires_at
        )

    def __str__(self):
        return f"GiftCard {self.code} — {self.remaining_balance} DZD remaining"


# ─── ORDER ────────────────────────────────────────────────────

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('preparing', 'Preparing'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    customer_email    = models.EmailField()
    customer_username = models.CharField(max_length=150)
    status            = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    original_total    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gift_card_amount  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_total       = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    coupon            = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL)
    gift_card         = models.ForeignKey(GiftCard, null=True, blank=True, on_delete=models.SET_NULL)

    created_at        = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer_username} — {self.status}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price    = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"


# ─── PAYMENT ──────────────────────────────────────────────────

class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash',      'Cash on Delivery'),
        ('cib',       'CIB Card'),
        ('edahabia',  'Edahabia Card'),
        ('gift_card', 'Gift Card'),
    ]
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('paid',     'Paid'),
        ('failed',   'Failed'),
        ('refunded', 'Refunded'),
    ]

    order          = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method         = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount         = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, blank=True)  # simulated
    paid_at        = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} — {self.method} — {self.status}"