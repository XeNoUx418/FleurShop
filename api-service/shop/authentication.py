from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework import authentication
from django.contrib.auth.models import AnonymousUser


class TokenUser:
    """
    A lightweight user object built from the JWT payload.
    No database lookup needed — all info comes from the token itself.
    """
    def __init__(self, payload):
        self.id           = payload.get('user_id')
        self.username     = payload.get('username', '')
        self.email        = payload.get('email', '')
        self.role         = payload.get('role', 'customer')
        self.is_authenticated = True
        self.is_active    = True

    def __str__(self):
        return self.username


class JWTAuthFromPayload(authentication.BaseAuthentication):
    """
    Authenticates using JWT token but builds the user object
    from the token payload instead of querying the database.
    """
    def authenticate(self, request):
        header = authentication.get_authorization_header(request).split()

        if not header or header[0].lower() != b'bearer':
            return None  # no token provided — let permission classes handle it

        if len(header) != 2:
            return None

        try:
            token_str    = header[1].decode('utf-8')
            # Validate and decode the token using simplejwt
            validated    = JWTAuthentication().get_validated_token(token_str)
            payload      = validated.payload
            user         = TokenUser(payload)
            return (user, validated)
        except (InvalidToken, TokenError):
            return None