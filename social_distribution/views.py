from pstats import Stats
import statistics
from django.shortcuts import render
from django.template import Context
from rest_framework import viewsets, status
from .serializers import PostSerializer, LoginSerializer, CommentSerializer, AuthorSerializer, InboxSerializer, LikeSerializer, FollowSerializer
from .models import Post, Author, Comment, Inbox, Like, Follow
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
def index(request):
    return render(request, "public/build/index.html")

@api_view(['POST'])
def login(request):
    if request.method == 'POST':
        try:
            jwt = LoginSerializer.validate(request.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(jwt, status=status.HTTP_200_OK)
    

'''
class LoginView(APIView):
    def post(self, request):
        try:
            data = LoginSerializer.validate(request.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)
'''
        
# URL: ://service/authors/{AUTHOR_ID}/
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def authors(request, author_id = None):
    if request.method == 'GET':
        # get all authors where hidden is false
        authors = Author.objects.filter(hidden = False)
        if author_id:
            author = AuthorSerializer(authors.get(id = author_id)).data
            # author['url'] = author['url'] + str(author['id'])     dont modify in backend
            return Response(author, status=status.HTTP_200_OK)
        """ for author in authors:      get in frontend instead
            author.url = author.url + str(author.id) """
        return Response(AuthorSerializer(authors, many=True).data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        data = request.data
        data['host'] = request.scheme + "://" + request.get_host()
        data['url'] = request.scheme + "://" + request.get_host() + request.path
        serializer = AuthorSerializer(data=data)
        if serializer.is_valid():
            author = serializer.save()
            # create inbox for new author
            inbox = Inbox.objects.create(author=author)
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

# URL: ://service/authors/{AUTHOR_ID}/followers/{FOREIGN_AUTHOR_ID}
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def followers(request, author_id = None, follower_id = None):
    if request.method == 'GET':
        if not follower_id:
            # get all followers of author_id
            follows = Follow.objects.filter(author = author_id)
            follows = FollowSerializer(follows, many=True).data
            followers = []
            for follow in follows:
                author = Author.objects.get(id = follow['follower'])
                # author.url = author.url + str(author.id)
                followers.append(AuthorSerializer(author).data)
            return Response(followers, status=status.HTTP_200_OK)
        # return whether follower_id follows author_id
        follower = Follow.objects.filter(follower = follower_id, author = author_id)
        if follower:
            return Response(True, status=status.HTTP_200_OK)
        return Response(False, status=status.HTTP_200_OK)
            
    elif request.method == 'PUT':
        # add follower_id to author_id's followers
        # check if follower_id is already following author_id

        if not Author.objects.filter(id = author_id):
            # if author does not exist
            data = request.data
            if data:
                # create author
                serializer = AuthorSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response("Author does not exist", status=status.HTTP_400_BAD_REQUEST)
                
        if Follow.objects.filter(follower = follower_id, author = author_id):
            return Response("Already following", status=status.HTTP_200_OK)
        author = Author.objects.get(id = author_id)
        follower = Author.objects.get(id = follower_id)
        summary = AuthorSerializer(follower).data['displayName'] + ' is now following ' + AuthorSerializer(author).data['displayName']
        follower = Follow.objects.create(author = author, follower = follower, summary = summary)
        follower.save()
        return Response(FollowSerializer(follower).data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        # remove follower_id from author_id's followers
        follower = Follow.objects.filter(author = author_id, follower = follower_id)
        follower.delete()
        return Response(status=status.HTTP_200_OK)

""" @api_view(['PUT'])
def requests(request, author_id):
    if request.method == 'PUT':
        # add follower_id to author_id's followers
        author = Author.objects.get(id = author_id)
        follower = Author.objects.get(id = follower_id)
        follower = Follow.objects.create(author = author, follower = follower)
        follower.save()
        return Response(status=status.HTTP_200_OK) """

@api_view(['GET'])
def following(request, author_id):
    if request.method == 'GET':
        # get all authors that author_id follows
        follows = Follow.objects.filter(follower = author_id)
        follows = FollowSerializer(follows, many=True).data
        following = []
        for follow in follows:
                author = Author.objects.get(id = follow['author'])
                """ if author.host == request.get_host() or author.host == 'http://localhost:8000':
                    author.url = author.url + str(author.id) """
                following.append(AuthorSerializer(author).data)
        return Response(following, status=status.HTTP_200_OK)
        
@api_view(['GET'])
def friends(request, author_id):
    if request.method == 'GET':
        # return users who follow author_id and author_id follows
        followIn = Follow.objects.filter(follower = author_id)
        followIn = FollowSerializer(followIn, many=True).data
        followOut = Follow.objects.filter(author = author_id)
        followOut = FollowSerializer(followOut, many=True).data
        friends = []
        for follow in followIn:
            for follow2 in followOut:
                if follow['author'] == follow2['follower']:
                    author = Author.objects.get(id = follow['author'])
                    # author.url = author.url + str(author.id)
                    friends.append(AuthorSerializer(author).data)
        return Response(friends, status=status.HTTP_200_OK)
    
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
                # post['author']['url'] = post['author']['url'] + str(post['author']['id'])
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
            # posts[0]['author']['url'] = posts[0]['author']['url'] + str(posts[0]['author']['id'])
            return Response(posts[0], status=status.HTTP_200_OK)
        
        serializer = PostSerializer(posts, many=True)
        for post in serializer.data:
            post['author'] = AuthorSerializer(Author.objects.get(id = post['author'])).data
            # post['author']['url'] = post['author']['url'] + str(post['author']['id'])

        return Response(serializer.data, status=status.HTTP_200_OK)
    

    elif request.method == 'POST':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(id = payload.get('user_id', None))
        if author_id != str(author.id):
            return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        data['origin'] = author.host
        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(id = payload.get('user_id', None))
        if author_id != str(author.id):
            return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)
        post = Post.objects.get(id = post_id)
        if post.author == author:
            serializer = PostSerializer(post, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == 'DELETE':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(id = payload.get('user_id', None))
        if author_id != str(author.id):
            return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)
        post = Post.objects.get(id = post_id)
        if post.author == author:
            post.delete()
            return Response(status=status.HTTP_200_OK)
        return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'POST'])
def comments(request, author_id, post_id):
    if request.method == 'GET':
        comments = Comment.objects.filter(post = post_id)
        serializer = CommentSerializer(comments, many=True)
        for comment in serializer.data:
            comment['author'] = AuthorSerializer(Author.objects.get(id = comment['author'])).data
            # comment['author']['url'] = comment['author']['url'] + str(comment['author']['id'])
            comment['post'] = PostSerializer(Post.objects.get(id = comment['post'])).data
            comment['post']['origin'] = comment['post']['origin'] + str(comment['post']['id'])
            comment['post']['author'] = AuthorSerializer(Author.objects.get(id = comment['post']['author'])).data
            # comment['post']['author']['url'] = comment['post']['author']['url'] + str(comment['post']['author']['id'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token)
        author = Author.objects.get(id = payload.get('user_id', None))
        data = request.data
        data['author'] = author.id
        data['authorName'] = author.displayName
        data['post'] = post_id
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'DELETE'])
def commentLikes(request, comment_id):
    if request.method == 'GET':
        return Response("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED)
    elif request.method == 'POST':
        return Response("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED)
    elif request.method == 'DELETE':
        return Response("Not implemented", status=status.HTTP_501_NOT_IMPLEMENTED)
    
@api_view(['GET'])
def likedPosts(request, author_id):
    if request.method == 'GET':
        likes = Like.objects.filter(author = author_id)
        items = []
        for like in likes:
            if like.post != None:
                post = PostSerializer(Post.objects.get(id = like.post.id)).data
                post['author'] = AuthorSerializer(Author.objects.get(id = post['author'])).data
                # post['author']['url'] = post['author']['url'] + str(post['author']['id'])
                items.append(post)
            elif like.comment != None:
                comment = CommentSerializer(Comment.objects.get(id = like.comment.id)).data
                comment['author'] = AuthorSerializer(Author.objects.get(id = comment['author'])).data
                # comment['author']['url'] = comment['author']['url'] + str(comment['author']['id'])
                comment['post'] = PostSerializer(Post.objects.get(id = comment['post'])).data
                comment['post']['origin'] = comment['post']['origin'] + str(comment['post']['id'])
                comment['post']['author'] = AuthorSerializer(Author.objects.get(id = comment['post']['author'])).data
                # comment['post']['author']['url'] = comment['post']['author']['url'] + str(comment['post']['author']['id'])
                items.append(comment)
        return Response(items, status=status.HTTP_200_OK)

@api_view(['GET', 'POST', 'DELETE'])
def inbox(request, author_id):
    if request.method == 'GET':
        # get all inbox items for author
        author = Author.objects.get(id=author_id)
        inbox = Inbox.objects.get(author=author)
        if not inbox:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = InboxSerializer(inbox)

        # get author data and add to serializer
        author_data = AuthorSerializer(Author.objects.get(id=serializer.data['author'])).data
        serializer.data['author'] = author_data

        # process posts
        for i in range(len(serializer.data['posts'])):
            post_data = PostSerializer(Post.objects.get(id=serializer.data['posts'][i])).data
            post_data['author'] = AuthorSerializer(Author.objects.get(id=post_data['author'])).data
            serializer.data['posts'][i] = post_data

        # process follows
        for i in range(len(serializer.data['follows'])):
            follow_data = FollowSerializer(Follow.objects.get(id=serializer.data['follows'][i])).data
            follow_data['follower'] = AuthorSerializer(Author.objects.get(id=follow_data['follower'])).data
            follow_data['author'] = AuthorSerializer(Author.objects.get(id=follow_data['author'])).data
            serializer.data['follows'][i] = follow_data

        # process comments
        for i in range(len(serializer.data['comments'])):
            comment_data = CommentSerializer(Comment.objects.get(id=serializer.data['comments'][i])).data
            comment_data['post'] = PostSerializer(Post.objects.get(id=comment_data['post'])).data
            comment_data['author'] = AuthorSerializer(Author.objects.get(id=comment_data['author'])).data
            serializer.data['comments'][i] = comment_data

        # process likes
        for i in range(len(serializer.data['likes'])):
            like_data = LikeSerializer(Like.objects.get(id=serializer.data['likes'][i])).data
            like_data['author'] = AuthorSerializer(Author.objects.get(id=like_data['author'])).data
            like_data['post'] = PostSerializer(Post.objects.get(id=like_data['post'])).data
            like_data['post']['author'] = AuthorSerializer(Author.objects.get(id=like_data['post']['author'])).data
            serializer.data['likes'][i] = like_data

        # combine all items into a single list
        items = serializer.data['posts'] + serializer.data['follows'] + serializer.data['comments'] + serializer.data['likes']

        return Response(items)

    elif request.method == 'POST':
        # add object of type post/follow/like/comment to inbox of author_id
        # don't authorize becausing we are sending objects to another user
        """ token = request.headers.get('Authorization', None)
        payload = LoginSerializer.validateToken(token) 
        tokenAuthor = Author.objects.get(id = payload.get('user_id', None))
        if str(tokenAuthor.id) != author_id:
            return Response(status=status.HTTP_401_UNAUTHORIZED) """
        author = Author.objects.get(id = author_id)
        inbox = Inbox.objects.get(author = author)
        if not inbox:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if request.data['type'] == 'post':
            post = Post.objects.get(id = request.data['id'])
            inbox.items.posts.add(post)
        elif request.data['type'] == 'follow':
            follow = Follow.objects.get(id = request.data['id'])
            inbox.items.follows.add(follow)
        elif request.data['type'] == 'like':
            like = Like.objects.get(id = request.data['id'])
            inbox.items.likes.add(like)
        elif request.data['type'] == 'comment':
            comment = Comment.objects.get(id = request.data['id'])
            inbox.items.comments.add(comment)

        inbox.save()
        return Response(status=status.HTTP_200_OK)
        
    
    elif request.method == 'DELETE':
        # clear the items field of the inbox with author_id = author_id
        author = Author.objects.get(id = author_id)
        inbox = Inbox.objects.get(author = author)
        inbox.items.posts.clear()
        inbox.items.follows.clear()
        inbox.save()
        return Response(status=status.HTTP_200_OK)
