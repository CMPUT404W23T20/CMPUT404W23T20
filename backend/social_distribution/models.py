from django.db import models
import uuid
# Create your models here.

class Author(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=200, default="author")
    host = models.CharField(max_length=200)
    displayName = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    url = models.CharField(max_length=200)
    github = models.CharField(max_length=200, default="No github")
    profileImage = models.CharField(max_length=200, default="No profileImage")
    password = models.CharField(max_length=200)

    def __str__(self):
        return self.displayName
    
    
class Comment(models.Model):
    type = models.CharField(max_length=200, default="comment")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    comment = models.CharField(max_length=200)
    contentType = models.CharField(max_length=200)
    published = models.DateTimeField()
    post = models.ForeignKey('Post', on_delete=models.CASCADE)

    def __str__(self):
        return self.comment

class Post(models.Model):
    type = models.CharField(max_length=200, default="post")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
    visibility = models.CharField(max_length=200, default="PUBLIC")
    unlisted = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    
class Request(models.Model):
    type = models.CharField(max_length=200, default="request")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=200)
    summary = models.CharField(max_length=200)
    actor = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='actor')
    object = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='object')
class Followers(models.Model):
    '''
    returns the list of friends that a Author has
    friend = author follows them back (true friend)
    follower = author does not follow them back
    '''
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    RELATION_TYPE = [('friend','Friend'),('follower','Follower')]
    type = models.CharField(max_length=200, default="Follower")
    #user = account owner
    user = models.OneToOneField(Author, on_delete=models.CASCADE, null= True,related_name = 'Author')
    #friends/followers that account owner has
    items = models.ManyToManyField(Author, symmetrical = False, blank = True)


class FriendRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    REQUEST_TYPE= [('none','None'),('friend',"Friend"),('follow','Follow'),('accept','Accept')]

    #summmary is message sent to inbox
    summary = models.CharField(max_length=200,default= "None")
    requestCategory = models.CharField(choices= REQUEST_TYPE,max_length=200,default='none')

    #actor wants to follow object
    actor = models.ForeignKey(Author, related_name = "sender", on_delete=models.CASCADE)

    object = models.ForeignKey(Author, related_name = "reciever", on_delete=models.CASCADE)

    def accept(self):
        self.requestCategory = "Accept"
        self.save()

class like(models.Model):
    type = models.CharField(max_length=200, default="like")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    
class InboxItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requests = models.ManyToManyField(Request, blank=True)
    posts = models.ManyToManyField(Post, blank=True)

class Inbox(models.Model):
    type = models.CharField(max_length=200, default="inbox")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    items = models.ForeignKey(InboxItem, on_delete=models.CASCADE)