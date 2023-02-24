# Generated by Django 4.1.7 on 2023-02-20 06:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('social_distribution', '0008_alter_post_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='friends',
            field=models.ManyToManyField(blank='True', to='social_distribution.user'),
        ),
        migrations.CreateModel(
            name='friendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('recieverUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reciever', to='social_distribution.user')),
                ('senderUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender', to='social_distribution.user')),
            ],
        ),
    ]