# Generated by Django 4.1.7 on 2023-03-04 04:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0006_alter_post_visibility_inbox'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='inbox',
            name='post',
        ),
        migrations.CreateModel(
            name='InboxItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('posts', models.ManyToManyField(to='social_distribution.post')),
                ('requests', models.ManyToManyField(to='social_distribution.request')),
            ],
        ),
        migrations.AddField(
            model_name='inbox',
            name='items',
            field=models.ManyToManyField(to='social_distribution.inboxitem'),
        ),
    ]