from pstats import Stats
import statistics
from django.shortcuts import render
from rest_framework import viewsets, status
from .serializers import PostSerializer, LoginSerializer, AuthorSerializer, CommentSerializer
from .models import Post, Author, Comment
from rest_framework.response import Response
from rest_framework.views import APIView

# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
        
class PostViewSet(APIView):
    
    def get(self, request):
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(pk = payload.get('user_id', None))
        posts = Post.objects.filter(author= author)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(pk = payload.get('user_id', None))
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(pk = payload.get('user_id', None))
        post = Post.objects.get(pk = pk)
        if post.author == author:
            serializer = PostSerializer(post, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_401_UNAUTHORIZED)  
    
    def delete(self, request, pk):
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(pk = payload.get('user_id', None))
        post = Post.objects.get(pk = pk)
        if post.author == author:
            post.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class LoginView(APIView):

    def post(self, request):
        try:
            data = LoginSerializer.validate(request.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)
    
    


        





