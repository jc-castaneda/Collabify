from enum import unique
from pyclbr import Class
from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    # Expanding on the built-in model
    class UserType(models.TextChoices):
        PRODUCER = "1", "Producer"
        MUSICIAN = "2", "Musician"
        SINGER = "3", "Singer"

    username = models.CharField(max_length = 512, unique=True)
    password = models.CharField(max_length = 512)
    email = models.CharField(max_length = 512, unique=True)
    bio = models.CharField(max_length = 512, blank=True, null=True)
    interests = models.JSONField(blank=True, null=True, default=dict)
    skills = models.JSONField(blank=True, null=True, default=dict)
    # Add the genres field that the serializer is expecting
    genres = models.CharField(max_length=255, blank=True, null=True)
    user_type = models.CharField(max_length=8, choices=UserType.choices)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    # Returns username
    def __str__(self):
        return self.username


# Stores the friend status between 2 users
# By default, no link exists between 2 users
# One is created when a friend request is sent
# If the request is accepted, the 'accepted' paramter changes to reflect this
class FriendStatus(models.Model):
    # 'user_a' stores the smaller ID and 'user_b' stores the larger ID
    # This is done instead of storing 'from_user' and 'to_user', since this would
    # require 2 searches to see if two users are friends
    user_a = models.IntegerField()
    user_b = models.IntegerField()
    from_user = models.IntegerField()
    accepted = models.BooleanField(default=False)


class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Message from {self.sender.username} to {self.receiver.username}'
