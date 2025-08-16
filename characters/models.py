from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from datetime import datetime, time
import swisseph as swe
from .utils import get_julian_day, get_planet_positions, get_houses, get_timezone_str, get_utc_datetime, get_element_totals

class PlayerCharacter(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='character')
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    username = models.CharField(max_length=20)
    birthdate = models.DateField()
    birthtime = models.TimeField(blank=True, null=True)
    birthplace_lat = models.FloatField()
    birthplace_lon = models.FloatField()
    birthplace_tz = models.CharField(max_length=50, blank=True)
    # current_lat = models.FloatField()
    # current_lon = models.FloatField()
    # current_tz = models.CharField(max_length=50, blank=True)
    is_dst = models.BooleanField(null=True)
    photo = models.ImageField(upload_to='photos/%Y/%m/%d/')
    autobiography = models.TextField(blank=True)
    email = models.EmailField(max_length=50)
    creation_date = models.DateTimeField(default=datetime.now, blank=True)
    is_werman = models.BooleanField(default=False)
    is_wifman = models.BooleanField(default=False)
    private_bio = models.TextField(max_length=280, blank=True)
    public_bio = models.TextField(max_length=140, blank=True)
    is_private = models.BooleanField(default=True)
    last_active = models.DateTimeField(default=timezone.now)
    experiences = models.IntegerField(null=True)
    friends = models.ManyToManyField('self', through='socials.Friendship', symmetrical=True, blank=True)
    accolades = models.ManyToManyField(
        'Accolade', through='PlayerAccolade', blank=True, related_name='characters')
    
    def clean(self):
        # Validate latitude
        if not (-90 <= self.birthplace_lat <= 90):
            raise ValidationError(
                {'birthplace_lat': 'Invalid latitude: degrees must be between -90 and 90'})
        # Validate longitude
        if not (-180 <= self.birthplace_lon <= 180):
            raise ValidationError(
                {'birthplace_lon': 'Invalid longitude: degrees must be between -180 and 180'})
    
    def get_birth_datetime(self):
        t = self.birthtime if self.birthtime else time(12, 0)
        local_datetime = datetime.combine(self.birthdate, t)

        # Get timezone if not stored
        if not self.birthplace_tz:
            self.birthplace_tz = get_timezone_str(self.birthplace_lat, self.birthplace_lon)
            self.save()
        
        # Convert to UTC
        dt_str = self.birthdate.strftime('%Y-%m-%d')
        time_str = self.birthtime.strftime('%H:%M:%S')
        return get_utc_datetime(dt_str, time_str, self.birthplace_tz, self.is_dst)
    
    def get_julian_day(self):
        return get_julian_day(self.get_birth_datetime())
    
    def get_planet_positions(self):
        jd = self.get_julian_day()
        return get_planet_positions(jd)

    def get_houses(self):
        jd = self.get_julian_day()
        return get_houses(jd, self.birthplace_lat, self.birthplace_lon)
    
    def __str__(self):
        return f"{self.username} | {self.first_name} {self.last_name}"
    
    def get_element_totals(self):
        """Calculate element ratio for char's natal chart"""
        # Get planets positions from above
        planet_positions = self.get_planet_positions()
        houses = self.get_houses()

        return get_element_totals(planet_positions, houses)

class Accolade(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
class PlayerAccolade(models.Model):
    player = models.ForeignKey(PlayerCharacter, on_delete=models.CASCADE)
    accolade = models.ForeignKey(Accolade, on_delete=models.CASCADE)
    date_unlocked = models.DateTimeField(auto_now_add=True)
