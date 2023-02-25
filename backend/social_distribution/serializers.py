from rest_framework import serializers
from .models import Post, Author, Comment, friendRequest, Followers
from rest_framework_jwt.settings import api_settings
from django.conf import settings
import jwt

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'
    
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
    
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class CreatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("title", "description")

class friendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = friendRequest
        fields = '__all__'

class FollowersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Followers
        fields = '__all__'
class LoginSerializer(serializers.Serializer):

    def validate(data):
        username = data.get("username", "")
        password = data.get("password", "")

        if username and password:
            user = Author.objects.get(username=username, password=password)
            if user:
                try:
                    payload = jwt_payload_handler(user)
                    jwt_token = jwt.encode(payload, settings.SECRET_KEY)
                except Exception as e:
                    raise serializers.ValidationError("Can't generate token", e)
                return {
                    "token": jwt_token,
                }
            else:
                msg = "Unable to log in with provided credentials."
                raise serializers.ValidationError(msg)
        else:
            msg = "Must include 'username' and 'password'."
            raise serializers.ValidationError(msg)
        
    def validateToken(token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY)
        except jwt.DecodeError as identifier:
            raise serializers.ValidationError("Error decoding signature." + str(identifier) + " token: " + str(token))
        except jwt.InvalidTokenError:
            raise serializers.ValidationError("Invalid token." + str(token))

        return payload


    
