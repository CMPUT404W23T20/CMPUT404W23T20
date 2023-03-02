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
        if (kwargs.get('pk')): #/api/friendrequest/<pk>
            serializer = friendRequestSerializer(friendRequest.objects.get(pk=kwargs.get('pk')))
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        else:
            serializer =  friendRequestSerializer(friendRequest.objects.all(),many=True) 
        return Response(serializer.data, status=status.HTTP_200_OK)
#"author": int
#author2 = Author.objects.get(id=author)
# context["author"] = author2
# contect["object"] = obj
# return contect
    def post(self,request):
        serializer = friendRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



class FollowersViewSet(APIView):
   def get(self, request, *args, **kwargs):
        if kwargs.get("pk") and not kwargs.get("fk"):
           pk_val = kwargs.get("pk")
           serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
        elif kwargs.get("fk"):
            pk_val = kwargs.get("pk")
            fk_val = kwargs.get("fk")
            serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
            context = Followers.objects.filter(user__id=pk_val)

            if fk_val in serializer.data[0]["items"]:
                return Response(True, status=status.HTTP_200_OK)
            else:
                return Response(False, status=status.HTTP_200_OK)
   
        else:
            serializer =  FollowersSerializer(Followers.objects.all(),many=True) 
       

        return Response(serializer.data, status=status.HTTP_200_OK)
   
   def put(self, request, pk):
       return "hi"
   
   def delete(self,*args, **kwargs ):
        if kwargs.get("pk"):
            pk_val = kwargs.get("pk")
            fk_val = kwargs.get("fk")
            serializer =  FollowersSerializer(Followers.objects.filter(user__id=pk_val),many=True) 
            

        
        return Response(serializer.data, status=status.HTTP_200_OK)
   