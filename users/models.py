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
    user_type = models.CharField(max_length = 8, choices = UserType.choices)

    # Returns username
    def __str__(self):
        return self.username


# Stores the friend status between 2 users
# By default, no link exists between 2 users
# One is created when a friend request is sent
# If the request is accepted, the 'accepted' paramater changes to reflect this
class FriendStatus(models.Model):

    # 'user_a' stores the smaller ID and 'user_b' stores the larger ID
    # This is done instead of storing 'from_user' and 'to_user', since this would
    # require 2 searches to see if two users are friends
    user_a = models.IntegerField()
    user_b = models.IntegerField()
    from_user = models.IntegerField()
    accepted = models.BooleanField(default=False)
