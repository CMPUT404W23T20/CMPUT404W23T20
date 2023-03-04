from django.contrib import admin
from .models import Author, Post, Comment, Request, Inbox, InboxItem

# Register your models here.

admin.site.register(Author)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Request)
admin.site.register(Inbox)
admin.site.register(InboxItem)
