from django.shortcuts import render
from .serializers import PostSerializer
from rest_framework import viewsets
from .models import Post
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
# Create your views here.

class PostView(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

@api_view(['POST'])
def login(request):
    if  request.method == 'POST':
        username = request.POST['username']
        password =request.POST['password']

        user = authenticate(username = username, password = password)

        if user is not None: 
            authenticate.login(request, user)
            return redirect('/')
        else:
            pass
    else:
        return render(request, 'login.js')




