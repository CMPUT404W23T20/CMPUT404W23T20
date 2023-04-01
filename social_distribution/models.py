from django.db import models
import uuid
# Create your models here.
hostAddress = "https://t20-social-distribution.herokuapp.com"
class Author(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    type = models.CharField(max_length=200, default="author")
    host = models.CharField(max_length=200, default=hostAddress)
    displayName = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    url = models.CharField(max_length=200, default=hostAddress + "/service/authors/")
    github = models.CharField(max_length=200, default="No github")
    profileImage = models.CharField(max_length=200, default="https://i.imgur.com/k7XVwpB.jpeg")
    password = models.CharField(max_length=200, default="No password")
    hidden = models.BooleanField(default=False)

    def __str__(self):
        return self.displayName
    
class FollowRequest(models.Model):
    type = models.CharField(max_length=200, default="followRequest")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    summary = models.CharField(max_length=200, default="No summary")
    follower = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='requestFollower')
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='requestAuthor')
    
class Follow(models.Model):
    type = models.CharField(max_length=200, default="follow")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    summary = models.CharField(max_length=200, default="No summary")
    follower = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='follower')
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='author')

""" class Request(models.Model):
    type = models.CharField(max_length=200, default="request")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    summary = models.CharField(max_length=200)
    actor = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='actor')
    object = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='object') """
    
class Comment(models.Model):
    type = models.CharField(max_length=200, default="comment")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    comment = models.CharField(max_length=200)
    contentType = models.CharField(max_length=200, default="text/plain")
    published = models.DateTimeField(auto_now_add=True)
    post = models.ForeignKey('Post', on_delete=models.CASCADE)

    def __str__(self):
        return self.comment



class Post(models.Model):
    type = models.CharField(max_length=200, default="post")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, default="No title")
    source = models.CharField(max_length=200, default="No source")
    origin = models.CharField(max_length=200, default= "no origin")
    description = models.CharField(max_length=2000, default="No description")
    contentType = models.CharField(max_length=200, default="text/plain")
    image_data = models.CharField(max_length=100000, blank=True, null=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, default=1)
    authorName = models.CharField(max_length=200, default="No authorName")
    categories = models.CharField(max_length=200, default="No categories")
    count = models.IntegerField(default=0)
    comments = models.CharField(max_length=200,default="No comments")
    commentSrc = models.ManyToManyField(Comment, blank=True, related_name='commentSrc')
    published = models.DateTimeField(auto_now_add=True)
    visibility = models.CharField(max_length=200, default="PUBLIC")
    friend = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='friend', null=True, blank=True)
    unlisted = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Like(models.Model):
    type = models.CharField(max_length=200, default="like")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)

    
""" class InboxItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follows = models.ManyToManyField(Follow, blank=True)
    posts = models.ManyToManyField(Post, blank=True)
    comments = models.ManyToManyField(Comment, blank=True)
    likes = models.ManyToManyField(Like, blank=True) """

class PostURL(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url = models.CharField(max_length=200)
    source = models.CharField(max_length=200, default=None)
    type = models.CharField(max_length=200, default="postURL")

class Inbox(models.Model):
    type = models.CharField(max_length=200, default="inbox")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    follows = models.ManyToManyField(FollowRequest, blank=True)
    posts = models.ManyToManyField(Post, blank=True)
    postURLs = models.ManyToManyField(PostURL, blank=True)
    comments = models.ManyToManyField(Comment, blank=True)
    likes = models.ManyToManyField(Like, blank=True)