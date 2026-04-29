from django.urls import path

from .views import (
    # Public
    CategoryListView,
    ProductListView, ProductDetailView,
    # Customer
    CartView, CartItemSaveView,
    CouponValidateView, GiftCardValidateView,
    OrderListView, OrderDetailView,
    # Admin
    AdminDashboardView,
    AdminOrderListView, AdminOrderDetailView,
    AdminCategoryCreateView,
    AdminCouponView,
    AdminGiftCardView,
)


urlpatterns = [
    # ── Public ──────────────────────────────────────────────
    path('categories/',                     CategoryListView.as_view()),
    path('products/',                       ProductListView.as_view()),
    path('products/<int:pk>/',              ProductDetailView.as_view()),

    # ── Customer ────────────────────────────────────────────
    path('cart/',                           CartView.as_view()),
    path('cart/items/<int:item_id>/save/',  CartItemSaveView.as_view()),
    path('coupons/validate/',               CouponValidateView.as_view()),
    path('giftcards/validate/',             GiftCardValidateView.as_view()),
    path('orders/',                         OrderListView.as_view()),
    path('orders/<int:pk>/',                OrderDetailView.as_view()),

    # ── Admin ────────────────────────────────────────────────
    path('admin/dashboard/',                AdminDashboardView.as_view()),
    path('admin/orders/',                   AdminOrderListView.as_view()),
    path('admin/orders/<int:pk>/',          AdminOrderDetailView.as_view()),
    path('admin/categories/',               AdminCategoryCreateView.as_view()),
    path('admin/coupons/',                  AdminCouponView.as_view()),
    path('admin/giftcards/',                AdminGiftCardView.as_view()),
]