# Generated by Django 4.1.7 on 2023-03-08 02:29

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0019_rename_followering_author_following'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='author',
            name='following',
        ),
        migrations.CreateModel(
            name='Follow',
            fields=[
                ('type', models.CharField(default='follow', max_length=200)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='author', to='social_distribution.author')),
                ('follower', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='follower', to='social_distribution.author')),
            ],
        ),
    ]
