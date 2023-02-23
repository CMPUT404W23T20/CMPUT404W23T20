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
    title = models.CharField(max_length=200)
    source = models.CharField(max_length=200)
    description = models.CharField(max_length=200)
    contentType = models.CharField(max_length=200)
    #author = models.ForeignKey(Author, on_delete=models.CASCADE)
    categories = models.CharField(max_length=200)
    count = models.IntegerField()
    comments = models.CharField(max_length=200)
    #commentSrc = models.ForeignKey(Comment, on_delete=models.CASCADE)
    published = models.DateTimeField()
    visibility = models.CharField(max_length=200)
    unlisted = models.BooleanField()

    def __str__(self):
        return self.title



