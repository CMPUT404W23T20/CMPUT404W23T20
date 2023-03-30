# Generated by Django 4.1.7 on 2023-03-29 23:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0002_remove_like_comment_remove_like_post_comment_likes_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='like',
            name='comment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='social_distribution.comment'),
        ),
        migrations.AddField(
            model_name='like',
            name='post',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='social_distribution.post'),
        ),
    ]
