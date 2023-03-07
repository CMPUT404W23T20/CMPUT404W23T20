from pstats import Stats
import statistics
from django.shortcuts import render
from django.template import Context
from rest_framework import viewsets, status
from .serializers import PostSerializer, LoginSerializer, CommentSerializer, AuthorSerializer, InboxSerializer, InboxItemSerializer, RequestSerializer, LikeSerializer
from .models import Post, Author, Comment, Request, Inbox, InboxItem, Like
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core import serializers
from django.http import JsonResponse
import json
from django.http import JsonResponse
from django.forms.models import model_to_dict
from django.conf import settings
import jwt
from django.db.models import Q
from rest_framework.decorators import api_view

# need to be changed to proper format
# proper format
class LoginView(APIView):

    def post(self, request):
        try:
            data = LoginSerializer.validate(request.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def authors(request, author_id = None):
    if request.method == 'GET':
        authors = Author.objects.all()
        if author_id:
            author = Author.objects.get(id = author_id)
            return Response(AuthorSerializer(author).data, status=status.HTTP_200_OK)
        return Response(AuthorSerializer(authors, many=True).data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        data = json.parse(request)
        serializer = AuthorSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            # create inboxItems for new author
            inboxItem = InboxItem.objects.create(author = serializer.data.get('id'))
            inboxItem.save()
            # create inbox for new author
            inbox = Inbox.objects.create(author = serializer.data.get('id'))
            inbox.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'PUT':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        if author_id != str(payload.get('user_id', None)):
            return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)
        serializer = AuthorSerializer(Author.objects.get(id = author_id), data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        token = request.headers.get('Authorization', None)
        try:
            payload = LoginSerializer.validateToken(token)
        except:
            return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)
        author = Author.objects.get(id = payload.get('user_id', None))
        if author_id != str(author.id):
            return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)
        author.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def followers(request, author_id, follower_id = None):
    if request.method == 'GET':
        # not implemented
        if not follower_id:
            return Response("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED)
        # get follower
        follower = Author.objects.get(id = follower_id)
        author = Author.objects.get(id = author_id)
        if follower in author.followers.all():
            return Response(AuthorSerializer(follower).data, status=status.HTTP_200_OK)
        return Response("Not found", status=status.HTTP_404_NOT_FOUND)
        
def requests(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def friends(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def posts(request, author_id = None, post_id = None):
    if request.method == 'GET':
        if not author_id:
            # get all public posts
            posts = Post.objects.all()
            posts = posts.filter(visibility = 'PUBLIC')
            serializer = PostSerializer(posts, many=True)
            for post in serializer.data:
                post['author'] = AuthorSerializer(Author.objects.get(id = post['author'])).data
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        author = Author.objects.get(id = author_id)
        posts = Post.objects.filter(author= author)
        token = request.headers.get('Authorization', None)
        try:
            payload = LoginSerializer.validateToken(token)
        except:
            payload = None
        if payload:
            requestAuthor = Author.objects.get(id = payload.get('user_id', None))
            if author_id != str(requestAuthor.id):
                posts = posts.filter(visibility = 'PUBLIC')

        if post_id:
            posts = posts.filter(id = post_id)
            posts = PostSerializer(posts, many=True).data
            posts[0]['author'] = AuthorSerializer(Author.objects.get(id = posts[0]['author'])).data
            return Response(posts[0], status=status.HTTP_200_OK)
        
        serializer = PostSerializer(posts, many=True)
        for post in serializer.data:
            post['author'] = AuthorSerializer(Author.objects.get(id = post['author'])).data

        return Response(serializer.data, status=status.HTTP_200_OK)
    

    elif request.method == 'POST':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(id = payload.get('user_id', None))
        if author_id != str(author.id):
            return JsonResponse("Not authorized", status=status.HTTP_401_UNAUTHORIZED, safe=False)
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST, safe=False)
    
    elif request.method == 'PUT':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(id = payload.get('user_id', None))
        if author_id != str(author.id):
            return JsonResponse("Not authorized", status=status.HTTP_401_UNAUTHORIZED, safe=False)
        post = Post.objects.get(id = post_id)
        if post.author == author:
            serializer = PostSerializer(post, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST, safe=False)
        return JsonResponse("Not authorized", status=status.HTTP_401_UNAUTHORIZED, safe=False)
    
    elif request.method == 'DELETE':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(id = payload.get('user_id', None))
        if author_id != str(author.id):
            return JsonResponse("Not authorized", status=status.HTTP_401_UNAUTHORIZED, safe=False)
        post = Post.objects.get(id = post_id)
        if post.author == author:
            post.delete()
            return JsonResponse("Deleted", status=status.HTTP_204_NO_CONTENT, safe=False)
        return JsonResponse("Not authorized", status=status.HTTP_401_UNAUTHORIZED, safe=False)

@api_view(['GET', 'POST'])
def comments(request, author_id, post_id):
    if request.method == 'GET':
        comments = Comment.objects.filter(post = post_id)
        comments = comments.filter(author = author_id)
        data = serializers.serialize('json', comments)
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        author = Author.objects.get(id = author_id)
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST, safe=False)

def commentLikes(request, comment_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def likedPosts(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def authorFollowersPosts(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

@api_view(['GET', 'POST'])
def inbox(request, author_id):
    if request.method == 'GET':
        # get all inbox items for author
        author = Author.objects.get(id = author_id)
        inbox = Inbox.objects.filter(author = author)
        serializer = InboxSerializer(inbox, many=True)
        # get InboxItem from data['items']
        serializer.data[0]['items'] = InboxItemSerializer(InboxItem.objects.get(id = serializer.data[0]['items'])).data
        serializer.data[0]['author'] = AuthorSerializer(Author.objects.get(id = serializer.data[0]['author'])).data
        # get Post from data['items']['post']
        for i in range(len(serializer.data[0]['items']['posts'])):
            serializer.data[0]['items']['posts'][i] = PostSerializer(Post.objects.get(id = serializer.data[0]['items']['posts'][i])).data
            serializer.data[0]['items']['posts'][i]['author'] = AuthorSerializer(Author.objects.get(id = serializer.data[0]['items']['posts'][i]['author'])).data
        for i in range(len(serializer.data[0]['items']['requests'])):
            serializer.data[0]['items']['requests'][i] = RequestSerializer(Request.objects.get(id = serializer.data[0]['items']['requests'][i])).data
            serializer.data[0]['items']['requests'][i]['actor'] = AuthorSerializer(Author.objects.get(id = serializer.data[0]['items']['requests'][i]['actor'])).data
            serializer.data[0]['items']['requests'][i]['object'] = AuthorSerializer(Author.objects.get(id = serializer.data[0]['items']['requests'][i]['object'])).data
        for i in range(len(serializer.data[0]['items']['comments'])):
            serializer.data[0]['items']['comments'][i] = CommentSerializer(Comment.objects.get(id = serializer.data[0]['items']['comments'][i])).data
            serializer.data[0]['items']['comments'][i]['post'] = PostSerializer(Post.objects.get(id = serializer.data[0]['items']['comments'][i]['post'])).data
            serializer.data[0]['items']['comments'][i]['author'] = AuthorSerializer(Author.objects.get(id = serializer.data[0]['items']['comments'][i]['author'])).data
        for i in range(len(serializer.data[0]['items']['likes'])):
            serializer.data[0]['items']['likes'][i] = LikeSerializer(Like.objects.get(id = serializer.data[0]['items']['likes'][i])).data
            serializer.data[0]['items']['likes'][i]['author'] = AuthorSerializer(Author.objects.get(id = serializer.data[0]['items']['likes'][i]['author'])).data
            serializer.data[0]['items']['likes'][i]['post'] = PostSerializer(Post.objects.get(id = serializer.data[0]['items']['likes'][i]['post'])).data
            serializer.data[0]['items']['likes'][i]['post']['author'] = AuthorSerializer(Author.objects.get(id = serializer.data[0]['items']['likes'][i]['post']['author'])).data

        # items becomes a list with all posts and requests
        serializer.data[0]['items'] = serializer.data[0]['items']['posts'] + serializer.data[0]['items']['requests'] + serializer.data[0]['items']['comments'] + serializer.data[0]['items']['likes']
        
        return Response(serializer.data[0])
        
    elif request.method == 'POST':
        # not implemented
        return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)    
    
    elif request.method == 'DELETE':
        # clear the items field of the inbox with author_id = author_id
        author = Author.objects.get(id = author_id)
        inbox = Inbox.objects.get(author = author)
        inbox.items.posts.clear()
        inbox.items.requests.clear()
        inbox.save()
        return JsonResponse("Inbox cleared", status=status.HTTP_200_OK, safe=False)
