# Generated by Django 4.1.7 on 2023-02-18 23:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0003_rename_author_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='origin',
            field=models.CharField(default='test', max_length=200),
            preserve_default=False,
        ),
    ]