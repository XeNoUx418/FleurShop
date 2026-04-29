from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers_jwt import CustomTokenObtainPairSerializer
from .views import RegisterView, MeView


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path('register/', RegisterView.as_view(),              name='register'),
    path('login/',    CustomTokenObtainPairView.as_view(), name='login'),   # ← custom
    path('refresh/',  TokenRefreshView.as_view(),          name='refresh'),
    path('me/',       MeView.as_view(),                    name='me'),
]