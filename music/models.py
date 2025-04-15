from django.db import models

class UploadedSong(models.Model):

	user = models.IntegerField()
	date = models.DateTimeField()
	file = models.FileField(upload_to="song_uploads/")

	# This technically leads to redundancy, but it increases
	# database performance
	comments = models.JSONField(default=list)


class SongComment(models.Model):

	user = models.IntegerField()
	song = models.IntegerField()
	date = models.DateTimeField()
	body = models.TextField()