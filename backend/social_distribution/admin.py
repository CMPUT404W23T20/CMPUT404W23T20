from django.contrib import admin
from .models import Author, Post, Comment, Request, Inbox, InboxItem, Like

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

class RequestAdmin(admin.ModelAdmin):
    list_display = ('id',)
admin.site.register(Request, RequestAdmin)

class InboxAdmin(admin.ModelAdmin):
    list_display = ('id',)
admin.site.register(Inbox, InboxAdmin)

class InboxItemAdmin(admin.ModelAdmin):
    list_display = ('id',)
admin.site.register(InboxItem, InboxItemAdmin)

class LikesAdmin(admin.ModelAdmin):
    list_display = ('id',)
admin.site.register(Like, LikesAdmin)