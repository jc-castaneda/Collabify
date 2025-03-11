from django.db import models
from django.contrib.auth.hashers import make_password

# Create your models here.
class User (models.Model):

	class UserType (models.TextChoices):
		PRODUCER = "1", "Producer"
		MUSICIAN = "2", "Musician"
		SINGER = "3", "Singer"

	username = models.CharField(max_length = 64)
	password_hash = models.CharField(max_length = 64)
	email = models.CharField(max_length = 512)
	bio = models.CharField(max_length = 512)
	interests = models.JSONField()
	skills = models.JSONField()
	user_type = models.CharField(max_length = 8, choices = UserType.choices)

def create_user(
	username,
	password,
	email,
	bio,
	interests,
	skills,
	user_type
):

	# Ideally have some input validation on the password here

	# Make a secure hash of the user's password, and store that
	# instead of the plaintext password
	password_hash = make_password(password)

	user = User(
		username = username,
		password_hash = password_hash,
		email = email,
		bio = bio,
		interests = interests,
		skills = skills,
		user_type = user_type
	)
	user.save()