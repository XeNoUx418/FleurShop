from rest_framework import serializers
from .models import DailyRevenue, ProductStat, HourlyStat, OrderStatusStat, RecentEvent


class DailyRevenueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DailyRevenue
        fields = ['date', 'revenue', 'order_count']


class ProductStatSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductStat
        fields = ['product_id', 'product_name', 'units_sold', 'revenue', 'order_count']


class HourlyStatSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HourlyStat
        fields = ['hour', 'order_count']


class OrderStatusStatSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderStatusStat
        fields = ['status', 'count']


class RecentEventSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RecentEvent
        fields = ['event_type', 'order_id', 'customer_name',
                  'total', 'status', 'occurred_at']