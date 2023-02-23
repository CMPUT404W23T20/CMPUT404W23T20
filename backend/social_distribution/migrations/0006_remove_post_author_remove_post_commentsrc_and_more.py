# Generated by Django 4.1.7 on 2023-02-19 02:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0005_rename_auther_comment_author_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='author',
        ),
        migrations.RemoveField(
            model_name='post',
            name='commentSrc',
        ),
        migrations.AlterField(
            model_name='post',
            name='categories',
            field=models.CharField(default='No categories', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='comments',
            field=models.CharField(default='No comments', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='contentType',
            field=models.CharField(default='text/plain', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='count',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='post',
            name='description',
            field=models.CharField(default='No description', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='origin',
            field=models.CharField(default='No origin', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='published',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='post',
            name='source',
            field=models.CharField(default='No source', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='title',
            field=models.CharField(default='No title', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='unlisted',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='post',
            name='visibility',
            field=models.CharField(default='No visibility', max_length=200),
        ),
    ]