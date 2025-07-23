import swisseph as swe

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

def get_houses(jd, lat, lon, hsys='0'):
    # hsys: 'P' = Placidus, 'K' = Koch, etc.
    cusps, ascmc = swe.houses(jd, lat, lon, hsys.encode())
    return {
        'cusps': cusps,
        'asc': ascmc[0],
        'mc': ascmc[1],
    }