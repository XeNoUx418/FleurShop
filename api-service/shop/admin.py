from django.contrib.auth.models import User, Group
from django.contrib import admin

from django.contrib import admin
from .models import (
    Category, Product,
    Cart, CartItem,
    Coupon, CouponUsage, GiftCard,
    Order, OrderItem, Payment
)

# Unregister default User and Group from api-service admin
# These are managed by auth-service
try:
    admin.site.unregister(User)
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'price', 'stock', 'category']
    list_filter  = ['category']

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'coupon_type', 'value', 'times_used', 'max_uses', 'valid_until', 'is_active']

@admin.register(GiftCard)
class GiftCardAdmin(admin.ModelAdmin):
    list_display = ['code', 'initial_balance', 'remaining_balance', 'is_active', 'expires_at']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_username', 'status', 'original_total', 'discount_amount', 'final_total']
    list_filter  = ['status']
    inlines      = [OrderItemInline]

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'method', 'status', 'amount', 'paid_at']