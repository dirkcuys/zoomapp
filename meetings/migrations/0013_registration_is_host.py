# Generated by Django 3.1.2 on 2021-03-31 16:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meetings', '0012_auto_20210331_1207'),
    ]

    operations = [
        migrations.AddField(
            model_name='registration',
            name='is_host',
            field=models.BooleanField(default=False),
        ),
    ]
