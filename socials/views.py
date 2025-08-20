from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import Friendship, MessageThread
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

@login_required
def thread_json(request, thread_id):
    thread = MessageThread.objects.get(id=thread_id, users=request.user)
    messages = thread.messages.order_by('-timestamp')[:50]
    return JsonResponse({
        'title': thread.title,
        'messages': [
            {'sender': m.sender.username, 'text': m.text}
            for m in messages
        ]
    })

def messages_view(request):
    threads = MessageThread.objects.filter(users=request.user)
    return render(request, '_messages.html', {'threads': threads})
