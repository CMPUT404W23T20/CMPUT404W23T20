from pstats import Stats
import statistics
from django.shortcuts import render
from django.template import Context
from rest_framework import viewsets, status
from .serializers import PostSerializer, LoginSerializer, AuthorSerializer, CommentSerializer, friendRequestSerializer, FollowersSerializer
from .models import Post, Author, Comment, friendRequest, Followers
from rest_framework.response import Response
from rest_framework.views import APIView
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
    
