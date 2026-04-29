from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()  # This gets our CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'password', 'role', 'phone']

    def create(self, validated_data):
        # Use create_user so the password gets hashed properly
        user = User.objects.create_user(
            username = validated_data['username'],
            email    = validated_data.get('email', ''),
            password = validated_data['password'],
            role     = validated_data.get('role', 'customer'),
            phone    = validated_data.get('phone', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'role', 'phone']