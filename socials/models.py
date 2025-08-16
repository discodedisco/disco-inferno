from django.db import models
from django.contrib.auth.models import User
from characters.models import PlayerCharacter
from django.utils import timezone

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    character = models.OneToOneField(PlayerCharacter, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)
    private_bio = models.TextField(max_length=500, blank=True)
    public_bio = models.TextField(max_length=500, blank=True)
    birth_location = models.CharField(max_length=100, blank=True)
    current_location = models.CharField(max_length=100, blank=True)
    is_private = models.BooleanField(default=False)
    last_active = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username}'s wheel"

class FriendRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    )
    
    sender = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('sender', 'receiver')
    
    def __str__(self):
        return f"{self.sender.username} : {self.receiver.username} ({self.status})"
    
class Friendship(models.Model):
    user1 = models.ForeignKey(User, related_name='friendships_initiated', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='friendships_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user1', 'user2')
    
    def __str__(self):
        return f"{self.user1.username} : {self.user2.username}"

class MessageThread(models.Model):
    title = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_group = models.BooleanField(default=False)

    def __str__(self):
        return self.title or f"Thread {self.id}"
    
class ThreadMember(models.Model):
    thread = models.ForeignKey(MessageThread, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='threads', on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('thread', 'user')
    
    def __str__(self):
        return f"{self.user.username} in {self.thread}"

class Message(models.Model):
    thread = models.ForeignKey(MessageThread, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message {self.id} from {self.sender.username} in {self.thread}"
