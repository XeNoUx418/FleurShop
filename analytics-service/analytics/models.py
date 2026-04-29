from django.db import models


class DailyRevenue(models.Model):
    """Revenue aggregated per day."""
    date        = models.DateField(unique=True)
    revenue     = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    order_count = models.IntegerField(default=0)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} — {self.revenue} DZD ({self.order_count} orders)"


class ProductStat(models.Model):
    """Tracks total units sold and revenue per product."""
    product_id   = models.IntegerField(unique=True)
    product_name = models.CharField(max_length=200)
    units_sold   = models.IntegerField(default=0)
    revenue      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    order_count  = models.IntegerField(default=0)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-units_sold']

    def __str__(self):
        return f"{self.product_name} — {self.units_sold} units sold"


class HourlyStat(models.Model):
    """Order count per hour of the day (0–23) across all time."""
    hour        = models.IntegerField(unique=True)  # 0–23
    order_count = models.IntegerField(default=0)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['hour']

    def __str__(self):
        return f"Hour {self.hour:02d}:00 — {self.order_count} orders"


class OrderStatusStat(models.Model):
    """Running count of orders per status."""
    status      = models.CharField(max_length=20, unique=True)
    count       = models.IntegerField(default=0)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.status}: {self.count}"


class RecentEvent(models.Model):
    """Last 100 events for the live feed."""
    EVENT_TYPES = [
        ('order.created',       'Order Created'),
        ('order.status_changed','Status Changed'),
    ]
    event_type     = models.CharField(max_length=50, choices=EVENT_TYPES)
    order_id       = models.IntegerField()
    customer_name  = models.CharField(max_length=150, blank=True)
    total          = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status         = models.CharField(max_length=20, blank=True)
    occurred_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-occurred_at']

    def __str__(self):
        return f"{self.event_type} — order #{self.order_id}"