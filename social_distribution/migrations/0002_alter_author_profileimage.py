# Generated by Django 4.1.7 on 2023-04-04 04:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='author',
            name='profileImage',
            field=models.CharField(default='https://i.imgur.com/k7XVwpB.jpeg', max_length=1000),
        ),
    ]
