# Generated by Django 4.1.7 on 2023-03-04 04:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0007_remove_inbox_post_inboxitem_inbox_items'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inboxitem',
            name='posts',
            field=models.ManyToManyField(blank=True, to='social_distribution.post'),
        ),
        migrations.AlterField(
            model_name='inboxitem',
            name='requests',
            field=models.ManyToManyField(blank=True, to='social_distribution.request'),
        ),
    ]