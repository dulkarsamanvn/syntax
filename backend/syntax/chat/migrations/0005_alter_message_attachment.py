# Generated by Django 5.2.3 on 2025-07-19 19:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_reaction'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='attachment',
            field=models.TextField(blank=True, null=True),
        ),
    ]
