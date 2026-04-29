from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'analytics-service'})


urlpatterns = [
    path('analytics-admin/',       admin.site.urls),
    path('analytics/',   include('analytics.urls')),
    path('health/',      health_check),
]