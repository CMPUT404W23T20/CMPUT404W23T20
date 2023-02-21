from django.db import models

# Create your models here.

class User(models.Model):
    host = models.CharField(max_length=200)
    displayName = models.CharField(max_length=200)
    url = models.CharField(max_length=200)
    github = models.CharField(max_length=200)
    profileImage = models.CharField(max_length=200)
    
    friends = models.ManyToManyField("User", blank = True)

    def __str__(self):
        return self.displayName

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
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
    #author = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    categories = models.CharField(max_length=200, default="No categories")
    count = models.IntegerField(default=0)
    comments = models.CharField(max_length=200,default="No comments")
    #commentSrc = models.ForeignKey(Comment, on_delete=models.CASCADE, default=1)
    published = models.DateTimeField(auto_now_add=True)
    visibility = models.CharField(max_length=200, default="No visibility")
    unlisted = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class friendRequest(models.Model):
    senderUser = models.ForeignKey(User, related_name = "sender", on_delete=models.CASCADE)

    recieverUser = models.ForeignKey(User, related_name = "reciever", on_delete=models.CASCADE)

    

