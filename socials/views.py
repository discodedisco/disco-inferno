from django.shortcuts import render
from django.urls import reverse
from .models import Friendship
from characters.models import PlayerCharacter, PlayerAccolade

def profile(request):
    return render(request, 'socials/profile.html')

def profile(request):
    char = PlayerCharacter.objects.get(user=request.user)
    breadcrumbs = [
        {'name': 'Home', 'url': reverse('index'), 'icon': 'fa-solid fa-fire'},
        {'name': f"{request.user.username}'s Profile", 'url': '', 'icon': 'fas fa-portrait'},
    ]
    return render(request, 'socials/profile.html', {'char': char, 'breadcrumbs': breadcrumbs})
