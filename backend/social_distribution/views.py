from pstats import Stats
import statistics
from django.shortcuts import render
from .serializers import PostSerializer, UserSerializer, CommentSerializer, CreatePostSerializer, friendRequestSerializer
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Post, User, Comment, friendRequest
# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    @api_view(['GET'])
    def get(self, request, pk):
        post = Post.objects.get(pk=pk)
        serializer = PostSerializer(post)
        return Response(serializer.data)
    @api_view(['DELETE'])
    def delete(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.delete()
        return Response(status="204")
    @api_view(['PUT'])
    def put(self, request, pk):
        post = Post.objects.get(pk=pk)
        serializer = CreatePostSerializer(post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status="200")
        return Response(serializer.errors, status="400")
    @api_view(['POST'])
    def create(self, request):
        serializer = CreatePostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status="201")
        return Response(serializer.errors, status="400")
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class friendRequestViewSet(viewsets.ModelViewSet):
    queryset = friendRequest.objects.all()
    serializer_class = friendRequestSerializer
    