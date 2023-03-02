from django.db import models

# Create your models here.

class Author(models.Model):
    host = models.CharField(max_length=200)
    displayName = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    url = models.CharField(max_length=200)
    github = models.CharField(max_length=200)
    profileImage = models.CharField(max_length=200)
    password = models.CharField(max_length=200)

    def __str__(self):
        return self.displayName

class Comment(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    comment = models.CharField(max_length=200)
    contentType = models.CharField(max_length=200)
    published = models.DateTimeField()

    def __str__(self):
        return self.comment

class Post(models.Model):
    title = models.CharField(max_length=200, default="No title")
    source = models.CharField(max_length=200, default="No source")
    origin = models.CharField(max_length=200, default="No origin")
    description = models.CharField(max_length=2000, default="No description")
    contentType = models.CharField(max_length=200, default="text/plain")
    author = models.ForeignKey(Author, on_delete=models.CASCADE, default=1)
    authorName = models.CharField(max_length=200, default="No authorName")
    categories = models.CharField(max_length=200, default="No categories")
    count = models.IntegerField(default=0)
    comments = models.CharField(max_length=200,default="No comments")
    #commentSrc = models.ForeignKey(Comment, on_delete=models.CASCADE, default=1)
    published = models.DateTimeField(auto_now_add=True)
    visibility = models.CharField(max_length=200, default="No visibility")
    unlisted = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Request(models.Model):
    type = models.CharField(max_length=200)
    summary = models.CharField(max_length=200)
    actor = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='actor')
    object = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='object')

    def __str__(self):
        return self.request
    
class Inbox(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    inboxItems = models.array(models.ForeignKey(Post, on_delete=models.CASCADE))

    def __str__(self):
        return self.inbox