# Generated by Django 4.1.7 on 2023-03-27 05:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0007_alter_comment_published'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='like',
            name='comment',
        ),
        migrations.RemoveField(
            model_name='like',
            name='post',
        ),
        migrations.AddField(
            model_name='like',
            name='object',
            field=models.CharField(default='None', max_length=200),
        ),
        migrations.AddField(
            model_name='like',
            name='summary',
            field=models.CharField(default='No summary', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='origin',
            field=models.CharField(default='no origin', max_length=200),
        ),
    ]
