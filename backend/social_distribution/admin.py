from django.contrib import admin
from .models import Author, Post, Comment, Request, Inbox, InboxItem,friendRequest,Followers

# Register your models here.

admin.site.register(Author)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Request)
admin.site.register(Inbox)
admin.site.register(InboxItem)
admin.site.register(friendRequest)
admin.site.register(Followers)