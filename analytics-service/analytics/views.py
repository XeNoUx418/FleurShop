from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import DailyRevenue, ProductStat, HourlyStat, OrderStatusStat, RecentEvent
from .serializers import (
    DailyRevenueSerializer, ProductStatSerializer,
    HourlyStatSerializer, OrderStatusStatSerializer,
    RecentEventSerializer,
)


class AnalyticsDashboardView(APIView):
    """
    Single endpoint that returns all analytics data.
    Frontend calls this once to populate the entire dashboard.
    """
    def get(self, request):
        # Summary totals
        total_revenue = DailyRevenue.objects.aggregate(
            t=Sum('revenue'))['t'] or 0
        total_orders  = DailyRevenue.objects.aggregate(
            t=Sum('order_count'))['t'] or 0

        # Revenue last 30 days
        daily_revenue = DailyRevenueSerializer(
            DailyRevenue.objects.all()[:30], many=True
        ).data

        # Top 10 best-selling products
        top_products = ProductStatSerializer(
            ProductStat.objects.all()[:10], many=True
        ).data

        # Orders by hour (peak hours)
        hourly = HourlyStatSerializer(
            HourlyStat.objects.all(), many=True
        ).data

        # Orders by status
        status_counts = OrderStatusStatSerializer(
            OrderStatusStat.objects.all(), many=True
        ).data

        # Last 20 events (live feed)
        recent_events = RecentEventSerializer(
            RecentEvent.objects.all()[:20], many=True
        ).data

        return Response({
            'summary': {
                'total_revenue': total_revenue,
                'total_orders':  total_orders,
            },
            'daily_revenue':  daily_revenue,
            'top_products':   top_products,
            'hourly_orders':  hourly,
            'status_counts':  status_counts,
            'recent_events':  recent_events,
        })