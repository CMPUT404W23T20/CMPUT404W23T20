from rest_framework import serializers
from .models import Post, User, Comment, friendRequest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
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