from datetime import datetime
from zoneinfo import ZoneInfo
from timezonefinder import TimezoneFinder
import swisseph as swe

def get_timezone_str(lat, lon):
    tf = TimezoneFinder()
    tz_str = tf.timezone_at(lat=lat, lng=lon)
    return tz_str

def get_utc_datetime(local_date, local_time, tz_str, is_dst=None):
    dt_str = f'{local_date} {local_time}'
    dt_naive = datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
    
    tz = ZoneInfo(tz_str)

    if is_dst is not None and hasattr(dt_naive, 'fold'):
        dt_naive = dt_naive.replace(fold=0 if is_dst else 1)
    
    dt_local = dt_naive.replace(tzinfo=tz)
    dt_utc = dt_local.astimezone(ZoneInfo('UTC'))
    return dt_utc

SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

def get_sign(lon):
    index = int(lon // 30) % 12
    return SIGNS[index]

def get_julian_day(dt):
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60 + dt.second/3600)

def get_planet_positions(jd):
    flag = swe.FLG_SWIEPH | swe.FLG_SPEED
    planets = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mercury': swe.MERCURY,
        'Venus': swe.VENUS,
        'Mars': swe.MARS,
        'Jupiter': swe.JUPITER,
        'Saturn': swe.SATURN,
        'Uranus': swe.URANUS,
        'Neptune': swe.NEPTUNE,
        'Pluto': swe.PLUTO,
    }
    positions = {}
    for name, code in planets.items():
        pos, ret = swe.calc_ut(jd, code, flag)
        positions[name] = pos[0]
    return positions

def get_houses(jd, lat, lon, hsys='O'):
    # hsys: 'P' = Placidus, 'K' = Koch, 'O' = Porphyry, etc.
    cusps, ascmc = swe.houses(jd, lat, lon, hsys.encode())
    return {
        'cusps': list(cusps),
        'asc': ascmc[0],
        'mc': ascmc[1],
    }