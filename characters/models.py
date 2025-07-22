from django.db import models
from datetime import datetime, time
import swisseph as swe
from nativity.utils import get_julian_day, get_planet_positions, get_houses

class PlayerCharacter(models.Model):
    forename = models.CharField(max_length=200)
    surname = models.CharField(max_length=200)
    screenname = models.CharField(max_length=20)
    birthdate = models.DateField()
    birthtime = models.TimeField(blank=True, null=True)
    birthplace_lat = models.FloatField()
    birthplace_lon = models.FloatField()
    photo = models.ImageField(upload_to='photos/%Y/%m/%d/')
    autobiography = models.TextField(blank=True)
    email = models.EmailField(max_length=50)
    creation_date = models.DateTimeField(default=datetime.now, blank=True)
    is_werman = models.BooleanField(default=False)
    is_wifman = models.BooleanField(default=False)
    
    def get_birth_datetime(self):
        t = self.birthtime if self.birthtime else time(12, 0)
        return datetime.combine(self.birthdate, t)
    
    def get_julian_day(self):
        return get_julian_day(self.get_birth_datetime())
    
    def get_planet_positions(self):
        jd = self.get_julian_day()
        return get_planet_positions(jd)

    def get_houses(self):
        jd = self.get_julian_day()
        return get_houses(jd, self.birthplace_lat, self.birthplace_lon)
    
    def __str__(self):
        return f"{self.screenname} | {self.forename} {self.surname}"
