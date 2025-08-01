from django.shortcuts import render, redirect
from django.contrib import messages, auth
from django.contrib.auth.models import User
from characters.models import PlayerCharacter
from characters.utils import get_timezone_str


def register(request):
    if request.method == 'POST':
        # Get form values
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password2 = request.POST['password2']
        
        # Get birth info
        birthdate = request.POST['birth_date']
        birthtime = request.POST['birth_time']

        try:
            # Try convert to float
            birthplace_lat = float(request.POST.get('birth_lat', ''))
            birthplace_lon = float(request.POST.get('birth_lon', ''))
            
            # Check valid ranges
            if not (-90 <= birthplace_lat <= 90):
                messages.error(request, 'Invalid latitude: degrees must be between -90 and 90')
                return redirect('register')
            
            if not (-180 <= birthplace_lon <= 180):
                messages.error(request, 'Invalid longitude: degrees must be between -180 and 180')
                return redirect('register')
            
        except ValueError:
            messages.error(request, 'Invalid coordinates: Please select a suggested location or find the closest city thereto')    
            return redirect('register')
        
        # Get DST setting
        is_dst_str = request.POST.get('is_dst')
        is_dst = None
        if is_dst_str == 'true':
            is_dst = True
        elif is_dst_str == 'false':
            is_dst = False
            
        # Get timezone from coords
        birthplace_tz = get_timezone_str(birthplace_lat, birthplace_lon)
        if not birthplace_tz:
            birthplace_tz = 'UTC'

        # Check if passwords match
        if password == password2:
            # Check username
            if User.objects.filter(username=username).exists():
                messages.error(
                    request, 'Username already exists (choose again!)')
                return redirect('register')
            else:
                if User.objects.filter(email=email).exists():
                    messages.error(
                        request, 'Email already registered to account')
                    return redirect('register')
                else:
                    user = User.objects.create_user(
                        username=username,
                        password=password,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        )
                    
                    # Create PC w. nativity info
                    PlayerCharacter.objects.create(
                        username=username,
                        first_name=first_name,
                        last_name=last_name,
                        email=email,
                        birthdate=birthdate,
                        birthtime=birthtime,
                        birthplace_lat=birthplace_lat,
                        birthplace_lon=birthplace_lon,
                        is_dst=is_dst,
                        birthplace_tz=birthplace_tz,
                    )
                    # Login after register
                    auth.login(request, user)
                    messages.success(
                        request, 'Successful new player start!')
                    return redirect('wheel')
        else:
            messages.error(request, 'Passphrases not identical; please revise')
            return redirect('register')
    else:
        return render(request, 'accounts/register.html')


def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            messages.success(request, 'Login successful')
            return redirect('wheel')
        else:
            messages.error(request, 'Invalid credentials')
            return redirect('login')
    else:
        return render(request, 'accounts/login.html')


def logout(request):
    if request.method == 'POST':
        auth.logout(request)
        messages.success(request, 'Successfully logged out')
        return redirect('index')
