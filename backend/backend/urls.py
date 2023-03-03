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
from django.urls import path, include
from rest_framework import routers
from social_distribution import views         


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/posts/', views.PostViewSet.as_view(), name='posts'),
    path('api/posts', views.PostViewSet.as_view(), name='posts'),
    path('api/posts/<int:pk>', views.PostViewSet.as_view(), name='post'),
    path('api/posts/<int:pk>/', views.PostViewSet.as_view(), name='post'),
    path('api/inbox/', views.InboxViewSet.as_view(), name='inbox'),
    path('login', views.LoginView.as_view(), name='login')
]
