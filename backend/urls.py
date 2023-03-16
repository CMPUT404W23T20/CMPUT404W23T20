"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,re_path
from social_distribution import views        
from social_distribution.views import index
from rest_framework.schemas import get_schema_view 
from django.views.generic import TemplateView 
from django.views.decorators.csrf import csrf_exempt


urlpatterns = [
    path('api_schema/', get_schema_view(
        title='API Schema',
        description='REST API'
    ), name='api_schema'),
    path('docs/', TemplateView.as_view(
        template_name='docs.html',
        extra_context={'schema_url':'api_schema'}
        ), name='swagger-ui'),
    path('admin/', admin.site.urls),
    path('login-api', views.LoginView.as_view(), name='login'),
    path('service/posts', views.posts, name='posts'),
    path('service/authors', views.authors, name='authors'),
    path('service/authors/<str:author_id>', views.authors, name='author'),
    path('service/authors/<str:author_id>/following', views.following, name='following'),
    path('service/authors/<str:author_id>/followers', views.followers, name='followers'),
    path('service/authors/<str:author_id>/followers/<str:follower_id>', views.followers, name='followers'),
    path('service/authors/<str:author_id>/friends', views.friends, name='friends'),
    path('service/authors/<str:author_id>/posts', views.posts, name='posts'),
    path('service/authors/<str:author_id>/posts/<str:post_id>', views.posts, name='posts'),
    path('service/authors/<str:author_id>/posts/<str:post_id>/comments', views.comments, name='comments'),
    path('service/authors/<str:author_id>/inbox', views.inbox, name='inbox'),
    path('service/authors/<str:author_id>/liked', views.likedPosts, name='liked'),
   
    re_path(r'^.*',csrf_exempt(TemplateView.as_view(template_name='index.html')))
]

