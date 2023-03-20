# Generated by Django 4.1.7 on 2023-03-19 21:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0004_alter_author_host_alter_author_password_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='author',
            name='host',
            field=models.CharField(default='https://t20-social-distribution.herokuapp.com/', max_length=200),
        ),
        migrations.AlterField(
            model_name='author',
            name='url',
            field=models.CharField(default='https://t20-social-distribution.herokuapp.com//service/authors/', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='origin',
            field=models.CharField(default='https://t20-social-distribution.herokuapp.com//service/posts/', max_length=200),
        ),
    ]
