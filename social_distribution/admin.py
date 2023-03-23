from django.contrib import admin
from .models import Author, Post, Comment, Inbox, Like, Follow

# Register your models here.

class AuthorAdmin(admin.ModelAdmin):
    list_display = ('id', 'displayName')

admin.site.register(Author, AuthorAdmin)

class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title')
admin.site.register(Post, PostAdmin)

class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'comment')
admin.site.register(Comment, CommentAdmin)

class InboxAdmin(admin.ModelAdmin):
    list_display = ('id',)
admin.site.register(Inbox, InboxAdmin)

class LikesAdmin(admin.ModelAdmin):
    list_display = ('id',)
admin.site.register(Like, LikesAdmin)

class FollowAdmin(admin.ModelAdmin):
    list_display = ('id', 'follower', 'author')
admin.site.register(Follow, FollowAdmin)