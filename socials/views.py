from django.shortcuts import render
from django.urls import reverse

def profile(request):
    return render(request, 'socials/profile.html')

def profile(request):
    breadcrumbs = [
        {'name': 'Home', 'url': reverse('index'), 'icon': 'fa-solid fa-fire'},
        {'name': f"{request.user.username}'s Profile", 'url': '', 'icon': 'fas fa-portrait'},
    ]
    return render(request, 'socials/profile.html', {'breadcrumbs': breadcrumbs})
