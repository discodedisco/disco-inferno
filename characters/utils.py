from datetime import datetime
from zoneinfo import ZoneInfo
from timezonefinder import TimezoneFinder
from characters.constellation import sign_options
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
        degree = pos[0]
        positions[name] = {
            'deg': degree,
            'sign': get_sign(degree),
            'speed': pos[3]
        }
    return positions

def get_houses(jd, lat, lon, hsys='O'):
    # hsys: 'P' = Placidus, 'K' = Koch, 'O' = Porphyry, etc.
    cusps, ascmc = swe.houses(jd, lat, lon, hsys.encode())
    return {
        'cusps': list(cusps),
        'asc': ascmc[0],
        'mc': ascmc[1],
    }
    
def get_element_totals(planet_positions, houses):
    elements_by_sign = {}
    for sign_data in sign_options:
        sign_name = sign_data['name']
        element = sign_data['element'].split(' ')[0]
        elements_by_sign[sign_name] = element
    
    # Define elements by sign
    element_counts = {
        # Change all to 1 w. aspect implementation
        'Air': 0,
        'Space': 0,
        'Fire': 0,
        'Water': 0,
        'Time': 0,
        'Earth': 0,
    }
    
    # # Init counts
    # element_counts = {element: 0 for element in elements_map}
    
    # Get signs for angles
    asc_sign = get_sign(houses['asc'])
    desc_sign = get_sign((houses['asc'] + 180) % 360)
    mc_sign = get_sign(houses['mc'])
    ic_sign = get_sign((houses['mc'] + 180) % 360)
    
    # Process planets by trad sign element
    for name, data in planet_positions.items():
        position = data['deg'] if isinstance(data, dict) else data
        sign = get_sign(position)

        # Count element per sign
        if sign in elements_by_sign:
            element = elements_by_sign[sign]
            element_counts[element] += 1
        
        
        # Space (Asc. & Desc.)
        if sign == asc_sign or sign == desc_sign:
            element_counts['Space'] += 1

        # Time (M.C. & I.C.)
        if sign == mc_sign or sign == ic_sign:
            element_counts['Time'] += 1

    return element_counts
