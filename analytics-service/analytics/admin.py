from django.contrib import admin
from .models import DailyRevenue, ProductStat, HourlyStat, OrderStatusStat, RecentEvent

admin.site.register(DailyRevenue)
admin.site.register(ProductStat)
admin.site.register(HourlyStat)
admin.site.register(OrderStatusStat)
admin.site.register(RecentEvent)