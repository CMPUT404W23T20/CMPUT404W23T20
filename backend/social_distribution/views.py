from pstats import Stats
import statistics
from django.shortcuts import render
from django.template import Context
from rest_framework import viewsets, status
from .serializers import PostSerializer, LoginSerializer, CommentSerializer, AuthorSerializer, InboxSerializer, InboxItemSerializer, RequestSerializer, friendRequestSerializer, FollowersSerializer
from .models import Post, Author, Comment, Request, Inbox, InboxItem, friendRequest, Followers
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


# Create your views here.
class AuthorViewSet(APIView):
    def get(self, request, *args, **kwargs):
        if (kwargs.get('pk')):
            serializer = AuthorSerializer(Author.objects.filter(pk=kwargs.get('pk')),many=True) 
        else:
            serializer = AuthorSerializer(Author.objects.all(),many=True) 
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class InboxViewSet(APIView):
    def get(self, request):
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        pk = payload.get('user_id', None)
        return inbox(request, pk)
    
    def delete(self, request):
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        pk = payload.get('user_id', None)
        return inbox(request, pk)

class HomeViewSet(APIView):
    def get(self, request):
        posts = Post.objects.filter(visibility="PUBLIC")
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
    
class friendRequestViewSet(APIView):
 
    def get(self, request, *args, **kwargs):
        if (kwargs.get('pk') and not kwargs.get("fk") ): #/api/friendrequest/OBJECT(pk = OBJECT/RECIEVER)
            serializer = friendRequestSerializer(friendRequest.objects.filter(object__id=kwargs.get('pk')),many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif (kwargs.get("pk") and kwargs.get("fk")): #/api/ACTOR/friendrequest/OBJECT (pk = OBJECT/RECIEVER)
            filter_data = friendRequest.objects.filter(actor__id=kwargs.get('pk'))
            filter_data = filter_data.filter(object__id = kwargs.get('fk'))
            serializer = friendRequestSerializer(filter_data,many=True)

            if (filter_data.exists()):
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(False, status=status.HTTP_200_OK)
        else:
            serializer =  friendRequestSerializer(friendRequest.objects.all(),many=True) 
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self,request):
        serializer = friendRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,*args,**kwargs):
        if (kwargs.get('pk')and kwargs.get("fk") ): #/api/ACTOR/friendrequest/OBJECT 
            filter_data = friendRequest.objects.filter(actor__id=kwargs.get('pk'))
            filter_data = filter_data.filter(object__id = kwargs.get('fk'))
            filter_data.delete()
            serializer = friendRequestSerializer(friendRequest.objects.filter(actor__id=kwargs.get('pk')),many=True)
         
        return Response(status=status.HTTP_204_NO_CONTENT)

class FollowersViewSet(APIView):
   def get(self, request, *args, **kwargs):
        if kwargs.get("pk") and not kwargs.get("fk"):
           pk_val = kwargs.get("pk")
           serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
        elif kwargs.get("fk"):
            pk_val = kwargs.get("pk")
            fk_val = kwargs.get("fk")
            serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
           

            if fk_val in serializer.data[0]["items"]:
                serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response("Not a follower",status=status.HTTP_200_OK)
   
        else:
            serializer =  FollowersSerializer(Followers.objects.all(),many=True) 
       

        return Response(serializer.data, status=status.HTTP_200_OK)
   
   def put(self, request, **kwargs):
        token = request.headers.get('Authorization', None)

        if kwargs.get("pk") and not kwargs.get("fk"):
           pk_val = kwargs.get("pk")
           new_follower = request.data.get("items")
    
           followers =Followers.objects.get(user__id=pk_val)
           followers.items.add(new_follower)

           serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
           

        return Response(serializer.data, status=status.HTTP_200_OK)
   
   def delete(self,request,*args, **kwargs ):
    pk_val = kwargs.get("pk")
    fk_val = kwargs.get("fk")
    serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
    new_list = Followers.objects.get(pk=pk_val)
    new_list.items.remove(fk_val)
    
    

    return Response(serializer.data, status=status.HTTP_200_OK)
    
def authors(request, author_id = None):
    authors = Author.objects.all()
    if author_id:
        authors = authors.filter(pk = author_id)
    data = serializers.serialize('json', authors)
    return JsonResponse(data, safe=False)

def followers(request, author_id = None):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def requests(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def friends(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def posts(request, author_id, post_id = None):
    if request.method == 'GET':
        author = Author.objects.get(pk = author_id)
        posts = Post.objects.filter(author= author)
        if post_id:
            posts = posts.filter(pk = post_id)
        data = serializers.serialize('json', posts)
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        author = Author.objects.get(pk = author_id)
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        data = PostSerializer(data=data)
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
        return JsonResponse("Not authorized", status=status.HTTP_401_UNAUTHORIZED, safe=False)
    elif request.method == 'DELETE':
        author = Author.objects.get(pk = author_id)
        post = Post.objects.get(pk = post_id)
        if post.author == author:
            post.delete()
            return JsonResponse("Deleted", status=status.HTTP_204_NO_CONTENT, safe=False)
        return JsonResponse("Not authorized", status=status.HTTP_401_UNAUTHORIZED, safe=False)

def comments(request, author_id, post_id):
    if request.method == 'GET':
        comments = Comment.objects.filter(post = post_id)
        comments = comments.filter(author = author_id)
        data = serializers.serialize('json', comments)
        return JsonResponse(data, safe=False)
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
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def likedPosts(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def authorFollowersPosts(request, author_id):
    # not implemented
    return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)

def inbox(request, author_id):
    if request.method == 'GET':
        # get all inbox items for author
        author = Author.objects.get(pk = author_id)
        inbox = Inbox.objects.filter(author = author)
        serializer = InboxSerializer(inbox, many=True)
        # get InboxItem from data['items']
        serializer.data[0]['items'] = InboxItemSerializer(InboxItem.objects.get(pk = serializer.data[0]['items'])).data
        # get Post from data['items']['post']
        for i in range(len(serializer.data[0]['items']['posts'])):
            serializer.data[0]['items']['posts'][i] = PostSerializer(Post.objects.get(pk = serializer.data[0]['items']['posts'][i])).data
        for i in range(len(serializer.data[0]['items']['requests'])):
            serializer.data[0]['items']['requests'][i] = PostSerializer(Post.objects.get(pk = serializer.data[0]['items']['requests'][i])).data

        # items becomes a list with all posts and requests
        serializer.data[0]['items'] = serializer.data[0]['items']['posts'] + serializer.data[0]['items']['requests']
        
        return JsonResponse(serializer.data[0], safe=False)
        
    elif request.method == 'POST':
        # not implemented
        return JsonResponse("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED, safe=False)    
    
    elif request.method == 'DELETE':
        # clear the items field of the inbox with author_id = author_id
        author = Author.objects.get(pk = author_id)
        inbox = Inbox.objects.get(author = author)
        inbox.items.posts.clear()
        inbox.items.requests.clear()
        inbox.save()
        return JsonResponse("Inbox cleared", status=status.HTTP_200_OK, safe=False)
