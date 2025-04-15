from django.db.utils import IntegrityError
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework import status

from datetime import datetime
from users.models import *
from music.models import *
from myp.globals import *

# Post a song to the database
@csrf_exempt
@api_view(['POST'])
def post_song(request):

    # Handling succesful registration requests
    try:
        data = request.data
        song = UploadedSong(
            user=int(data['user']),
            date=datetime.strptime(data['date'], DATETIME_FORMAT),
            file=data['file']
        )
        song.save()
        return Response({'message': "Song posted successfully"}, status=status.HTTP_201_CREATED)

    except KeyError as e:
        return Response({'error': "Missing field"}, status=status.HTTP_400_BAD_REQUEST)

def upload_test(request):

    template = loader.get_template('file_upload.html');
    return HttpResponse(template.render());

# Get song metadata, but not the file itself
@api_view(['GET'])
def get_song_info(request, song_id):

    try:
        song = UploadedSong.objects.get(pk=int(song_id))
        return Response({
            'id': song.id,
            'creator': song.user,
            'date': song.date.strftime(DATETIME_FORMAT),
            'comments': song.comments
        })
    except (ValueError, UploadedSong.DoesNotExist):
        return Response({'error': "Invalid song ID"}, status=status.HTTP_400_BAD_REQUEST)

# Post a comment on a specific song
@csrf_exempt
@api_view(['POST'])
def post_song_comment(request):

    data = request.data

    # Handling succesful registration requests
    try:
        
        # Song must exist
        song = UploadedSong.objects.get(pk=int(data['song']))
        comment = SongComment(
            user=data['user'],
            song=data['song'],
            date=datetime.strptime(data['date'], DATETIME_FORMAT),
            body=data['body']
        )
        comment.save()
        song.comments.append(comment.id)
        song.save()
        return Response({'message': "Comment posted successfully"}, status=status.HTTP_201_CREATED)

    except KeyError:
        return Response({'error': "Missing field"}, status=status.HTTP_400_BAD_REQUEST)
    except (UploadedSong.DoesNotExist):
        return Response({'error': f"No song with ID {data['song']}"}, status=status.HTTP_400_BAD_REQUEST)

# Get a comment using its ID
@api_view(['GET'])
def get_song_comment(request, comment_id):

    try:
        comment = SongComment.objects.get(pk=int(comment_id))
        return Response({
            'id': comment.id,
            'writer': comment.user,
            'date': comment.date.strftime(DATETIME_FORMAT),
            'body': comment.body
        })
    except (ValueError, SongComment.DoesNotExist):
        return Response({'error': "Invalid comment ID"}, status=status.HTTP_400_BAD_REQUEST)