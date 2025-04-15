from django.db.utils import IntegrityError
from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from users.models import *
from django.contrib.auth import authenticate
from rest_framework import status

class MyTokenObtainPairView(TokenObtainPairView):
    pass  # Inherits default JWT behavior

# Add a new user to the database
# A unique User ID is generated upon this action
# Certain fields must be unique
@csrf_exempt
@api_view(['POST'])
def register_user(request):

    """Register a new user"""

    # Handling succesful registration requests
    try:
        data = request.data
        user = CustomUser.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            bio=data.get('bio', ""),
            interests=data.get('interests', []),
            skills=data.get('skills', []),
            user_type=data.get('user_type', CustomUser.UserType.MUSICIAN)
        )
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

    # Handling bad registration requests
    except IntegrityError as e:
        # If email already exists
        if 'UNIQUE constraint failed: users_customuser.email' in str(e):
            return Response({'error': 'User email already exists!'}, status=status.HTTP_400_BAD_REQUEST)

        # If username already exists
        elif 'UNIQUE constraint failed: users_customuser.username' in str(e):
            return Response({'errr' : "User username already exists!"}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def logout_user(request):

    """Blacklist token on logout"""
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
        return Response({'message': 'User logged out'}, status=status.HTTP_205_RESET_CONTENT)
    except:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

# Return an array containing basic information about all users
# Used solely for the '/users' home page
@api_view(['GET'])
def get_all_users(request):

    return Response({'users': [{
            'username': user.username,
            'id': user.id
        } for user in CustomUser.objects.all()
    ]})

# Get all public information about a user in JSON format
@api_view(['GET'])
def get_user_info(request, user_id):

    try:
        user = CustomUser.objects.get(pk=int(user_id))
        return Response({
            'id': user_id,
            'username': user.username,
            'bio': user.bio,
            'email': user.email,
            'interests': user.interests,
            'skills': user.skills,
            'user_type': str(user.user_type)
        })
    except (ValueError, CustomUser.DoesNotExist):
        return Response({'error': "Invalid user ID"}, status=status.HTTP_400_BAD_REQUEST)

# Send a friend request from user A to user B
@api_view(['POST'])
def update_friend(request):

    # Request should contain 'action', 'from', and 'to' fields
    try:
        from_user = request.data['from']
        to_user = request.data['to']
        action = request.data['action']
        user_a = min(from_user, to_user)
        user_b = max(from_user, to_user)
    except KeyError:
        return Response({'error': "Missing field"}, status=status.HTTP_400_BAD_REQUEST)

    # The targeted users must exist
    if not (CustomUser.objects.filter(id=user_a).exists()):
        return Response({'error': f"Nonexistent user #{user_a}"}, status=status.HTTP_400_BAD_REQUEST)
    elif not (CustomUser.objects.filter(id=user_b).exists()):
        return Response({'error': f"Nonexistent user #{user_b}"}, status=status.HTTP_400_BAD_REQUEST)

    # Branch off to different functions depending on action
    # 'reject' and 'remove' share a function due to their code overlapping
    if (action == 'send'):
        return send_friend_request(from_user, to_user, user_a, user_b)
    elif (action in ['reject', 'remove']):
        return remove_friend_status(from_user, to_user, user_a, user_b, action == 'remove')
    elif (action == 'accept'):
        return accept_friend_request(from_user, to_user, user_a, user_b)
    else:
        return Response({'error': "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

def send_friend_request(from_user, to_user, user_a, user_b):

    if (from_user == to_user):
        return Response({'error': "Cannot send request to self"}, status=status.HTTP_400_BAD_REQUEST)

    # This friend request should not already be in the DB
    # By extension, this also makes sure the users aren't already friends
    elif (FriendStatus.objects.filter(user_a=user_a, user_b=user_b).exists()):
        return Response({'error': "Duplicate request"}, status=status.HTTP_400_BAD_REQUEST)

    # Insert friend request into DB
    new_req = FriendStatus(user_a=user_a, user_b=user_b, from_user=from_user, accepted=False)
    new_req.save()

    return Response({'status': "Success"})

# Can be used to remove an unaccepted friend request, OR
# can remove an existing friendship, depending on 'accepted'
def remove_friend_status(from_user, to_user, user_a, user_b, accepted):

    # This friend request must exist in the DB
    # However, the request cannot already be accepted
    requests = FriendStatus.objects.filter(user_a=user_a, user_b=user_b, accepted=accepted)
    if (not requests.exists()):
        return Response({'error': "Friend status doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

    # Remove the friendship from the database
    req = requests[0]
    req.delete()

    return Response({'status': "Success"})

def accept_friend_request(from_user, to_user, user_a, user_b):

    # This friend request must exist in the DB
    # However, the request cannot already be accepted
    requests = FriendStatus.objects.filter(user_a=user_a, user_b=user_b, accepted=False)
    if (not requests.exists()):
        return Response({'error': "Friend request doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

    # Change the request to be accepted
    req = requests[0]
    req.accepted = True
    req.save()

    return Response({'status': "Success"})


# Check whether the server is online
@api_view(['GET'])
def health_check(request):
    return Response({"status":"healthy"})
