# Generated by Django 5.2.4 on 2025-07-25 21:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('characters', '0003_rename_forename_playercharacter_first_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='playercharacter',
            name='birthplace_tz',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='playercharacter',
            name='is_dst',
            field=models.BooleanField(null=True),
        ),
    ]
