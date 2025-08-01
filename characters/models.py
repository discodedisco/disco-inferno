from django.db import models
from datetime import datetime, time
import swisseph as swe
from characters.utils import get_julian_day, get_planet_positions, get_houses, get_timezone_str, get_utc_datetime, get_element_totals
from django.core.exceptions import ValidationError

class PlayerCharacter(models.Model):
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    username = models.CharField(max_length=20)
    birthdate = models.DateField()
    birthtime = models.TimeField(blank=True, null=True)
    birthplace_lat = models.FloatField()
    birthplace_lon = models.FloatField()
    birthplace_tz = models.CharField(max_length=50, blank=True)
    is_dst = models.BooleanField(null=True)
    photo = models.ImageField(upload_to='photos/%Y/%m/%d/')
    autobiography = models.TextField(blank=True)
    email = models.EmailField(max_length=50)
    creation_date = models.DateTimeField(default=datetime.now, blank=True)
    is_werman = models.BooleanField(default=False)
    is_wifman = models.BooleanField(default=False)
    
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
        
