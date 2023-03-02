from pstats import Stats
import statistics
from django.shortcuts import render
from rest_framework import viewsets, status
from .serializers import PostSerializer, LoginSerializer, AuthorSerializer, CommentSerializer, LikeSerializer, RequestSerializer
from .models import Post, Author, Comment, Request, Inbox
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core import serializers
from django.http import JsonResponse

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
    
def authors(request, author_id):
    authors = Author.objects.all()
    if author_id:
        authors = authors.filter(pk = author_id)
    serializer = serializers.serialize('json', authors)
    return JsonResponse(serializer.data, safe=False)

def followers(request, author_id):
    author = Author.objects.get(pk = author_id)
    followers = author.followers.all()
    serializer = serializers.serialize('json', followers)
    return JsonResponse(serializer.data, safe=False)

def requests(request, author_id):
    author = Author.objects.get(pk = author_id)
    requests = Request.objects.filter(author= author)
    serializer = serializers.serialize('json', requests)
    return JsonResponse(serializer.data, safe=False)

def friends(request, author_id):
    author = Author.objects.get(pk = author_id)
    friends = author.friends.all()
    serializer = serializers.serialize('json', friends)
    return JsonResponse(serializer.data, safe=False)

def posts(request, author_id, post_id):
    if request.method == 'GET':
        author = Author.objects.get(pk = author_id)
        posts = Post.objects.filter(author= author)
        if post_id:
            posts = posts.filter(pk = post_id)
        serializer = serializers.serialize('json', posts)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == 'POST':
        author = Author.objects.get(pk = author_id)
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST, safe=False)
    elif request.method == 'PUT':
        author = Author.objects.get(pk = author_id)
        post = Post.objects.get(pk = post_id)
        if post.author == author:
            serializer = PostSerializer(post, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST, safe=False)
        return JsonResponse(status=status.HTTP_401_UNAUTHORIZED, safe=False)
    elif request.method == 'DELETE':
        author = Author.objects.get(pk = author_id)
        post = Post.objects.get(pk = post_id)
        if post.author == author:
            post.delete()
            return JsonResponse(status=status.HTTP_204_NO_CONTENT, safe=False)
        return JsonResponse(status=status.HTTP_401_UNAUTHORIZED, safe=False)

def comments(request, author_id):
    if request.method == 'GET':
        author = Author.objects.get(pk = author_id)
        posts = Post.objects.filter(author= author)
        comments = Comment.objects.filter(post__in= posts)
        serializer = serializers.serialize('json', comments)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == 'POST':
        author = Author.objects.get(pk = author_id)
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST, safe=False)

def commentLikes(request, comment_id):
    comment = Comment.objects.get(pk = comment_id)
    likes = comment.likes.all()
    serializer = serializers.serialize('json', likes)
    return JsonResponse(serializer.data, safe=False)

def likedPosts(request, author_id):
    author = Author.objects.get(pk = author_id)
    posts = Post.objects.filter(likes__in= author)
    serializer = serializers.serialize('json', posts)
    return JsonResponse(serializer.data, safe=False)

def authorFollowersPosts(request, author_id):
    author = Author.objects.get(pk = author_id)
    posts = Post.objects.filter(author__in= author.followers.all())
    serializer = serializers.serialize('json', posts)
    return JsonResponse(serializer.data, safe=False)

def inbox(request, author_id):
    if request.method == 'GET':
        author = Author.objects.get(pk = author_id)
        inbox = Inbox.objects.filter(author= author)
        serializer = serializers.serialize('json', inbox)
        return JsonResponse(serializer.data, safe=False)
    elif request.method == 'POST':
        if request.data['type'] == 'follow':
            return JsonResponse(status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)
        elif request.data['type'] == 'post':
           return JsonResponse(status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)
        elif request.data['type'] == 'comment':
            return JsonResponse(status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)
        elif request.data['type'] == 'like':
            return JsonResponse(status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)
    elif request.method == 'DELETE':
        author = Author.objects.get(pk = author_id)
        inbox = Inbox.objects.filter(author= author)
        inbox.inboxItems = []
        inbox.save()
        return JsonResponse(status=status.HTTP_204_NO_CONTENT, safe=False)
        





