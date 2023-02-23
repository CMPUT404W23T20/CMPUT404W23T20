from django.shortcuts import render
from rest_framework import viewsets
from .serializers import PostSerializer, LoginSerializer
from .models import Post
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


# Create your views here.

class PostView(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class LoginView(APIView):

    def post(self, request):
        try:
            data = LoginSerializer.validate(request.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)
    
    


        





