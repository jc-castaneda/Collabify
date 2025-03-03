from django.db import models

# Create your models here.
class User (models.Model):

	class UserType (models.TextChoices):
		PRODUCER = "1", "Producer"
		MUSICIAN = "2", "Musician"
		SINGER = "3", "Singer"

	username = models.CharField(max_length = 64)
	email = models.CharField(max_length = 512)
	bio = models.CharField(max_length = 512)
	interests = models.JSONField()
	skills = models.JSONField()
	user_type = models.CharField(max_length = 8, choices = UserType.choices)