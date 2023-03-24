import base64
from django.conf import settings
from .serializers import AuthorSerializer, LoginSerializer
from .models import Author
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class JWTAuth(BaseAuthentication):
    def authenticate(request):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        payload = LoginSerializer.validateToken(token)
        
        user = Author.objects.get(id=payload['user_id'])
        return AuthorSerializer(user).data
    
class HTTPBasicAuth(BaseAuthentication):
    def authenticate(request):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Basic '):
            return None

        try:
            credentials = auth_header.split(' ')[1]
            decoded_credentials = credentials.encode('ascii').decode('base64')
            username, password = decoded_credentials.split(':', 1)
        except:
            raise AuthenticationFailed('Invalid basic authentication header')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationFailed('Invalid username or password')

        if not user.check_password(password):
            raise AuthenticationFailed('Invalid username or password')

        return (user, None)