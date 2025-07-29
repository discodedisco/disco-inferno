from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from nativity.utils import SIGNS, get_timezone_str, get_utc_datetime, get_julian_day, get_planet_positions, get_houses
from characters.models import PlayerCharacter
from datetime import datetime
import json

def index(request):
    return render(request, 'pages/index.html')

@login_required(login_url='login')
def wheel(request):
    
    try:
        # Get the user's character data
        char = PlayerCharacter.objects.get(username=request.user.username)
        
        # Convert birthdate to string format
        birth_date = char.birthdate.strftime('%Y-%m-%d')
        birth_time = char.birthtime.strftime('%H:%M:%S')
        
        # Check and fix empty timezone
        if not char.birthplace_tz:
            # Get timezone from coords
            char.birthplace_tz = get_timezone_str(char.birthplace_lat, char.birthplace_lon)
            if char.birthplace_tz:  # If got valid timezone
                char.save()
            else:
                # Fallback to UTC if timezone undeterminable
                char.birthplace_tz = 'UTC'
        
        # Convert to UTC
        dt_utc = get_utc_datetime(birth_date, birth_time, char.birthplace_tz, char.is_dst)

        # Calculate Julian day
        jd = get_julian_day(dt_utc)

        # Calculate planets and houses
        planets = get_planet_positions(jd)
        houses = get_houses(jd, char.birthplace_lat, char.birthplace_lon, hsys='P')

        # Pass to template
        context = {
            'planets_json': json.dumps(planets),
            'houses_json': json.dumps(houses),
            'signs_json': json.dumps(SIGNS),
            'timestamp': datetime.now().timestamp(),
            'char': char,
        }
        
        return render(request, 'pages/wheel.html', context)
        
    except PlayerCharacter.DoesNotExist:
        messages.error(request, 'Profile not found')
        return redirect('index')

@login_required(login_url='login')
def recalculate_chart(request):
    char = PlayerCharacter.objects.get(username=request.user.username)

    # Get nativity details
    birth_date = char.birthdate.strftime('%Y-%m-%d')
    birth_time = char.birthtime.strftime('%H:%M:%S')
    
    # Calculate UTC
    dt_utc = get_utc_datetime(birth_date, birth_time, char.birthplace_tz, char.is_dst)
    
    # Convert to UTC
    jd = get_julian_day(dt_utc)
    
    # Use the specified house stem from request or default to Placidus
    house_system = request.GET.get('house_system', 'O')

    # Recalculate houses with selected system
    houses = get_houses(jd, char.birthplace_lat, char.birthplace_lon, hsys=house_system)

    # Pass to template w. refreshed data
    context = {
        'planets_json': json.dumps(get_planet_positions(jd)),
        'houses_json': json.dumps(houses),
        'signs_json': json.dumps(SIGNS),
        'timestamp': datetime.now().timestamp(),
        'char': char,
        'selected_house_system': house_system,
    }
    
    return render(request, 'pages/wheel.html', context)
