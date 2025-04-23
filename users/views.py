from django.shortcuts import get_object_or_404 
from django.db.utils import IntegrityError
from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.models import CustomUser, FriendStatus
import users.models
from users.models import *
from django.contrib.auth import authenticate
from rest_framework import status
from .models import CustomUser, Message
from feed.models import Post
from feed.serializers import PostSerializer
from .serializers import UserSerializer, MessageSerializer



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
@permission_classes([AllowAny])
def get_all_users(request):
    users = CustomUser.objects.all()
    serializer = UserSerializer(
        users,
        many=True,
        context={'request': request}    # ← so DRF can build full URLs
    )
    return Response({'users': serializer.data})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_info(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    serializer = UserSerializer(
        user,
        context={'request': request}    # ← same here
    )
    return Response(serializer.data)

# Send a friend request from user A to user B
@api_view(['POST'])
def update_friend(request):
    """Update friendship status between users"""
    try:
        # Extract required fields
        from_user = request.data.get('from')
        to_user = request.data.get('to')
        action = request.data.get('action')
        
        # Validate required fields
        if any(x is None for x in [from_user, to_user, action]):
            return Response({'error': "Missing field"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to integers if needed
        try:
            from_user = int(from_user)
            to_user = int(to_user)
        except (ValueError, TypeError):
            return Response({'error': "Invalid user IDs"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine user_a and user_b for consistent storage
        user_a = min(from_user, to_user)
        user_b = max(from_user, to_user)
        
        # Verify users exist
        if not CustomUser.objects.filter(id=user_a).exists():
            return Response({'error': f"Nonexistent user #{user_a}"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not CustomUser.objects.filter(id=user_b).exists():
            return Response({'error': f"Nonexistent user #{user_b}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process based on action
        if action == 'send':
            return send_friend_request(from_user, to_user, user_a, user_b)
        elif action in ['reject', 'remove']:
            return remove_friend_status(from_user, to_user, user_a, user_b, action == 'remove')
        elif action == 'accept':
            return accept_friend_request(from_user, to_user, user_a, user_b)
        else:
            return Response({'error': "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        # Log the error for debugging
        print(f"Error in update_friend: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def send_friend_request(from_user, to_user, user_a, user_b):

    if (from_user == to_user):
        return Response({'error': "Cannot send request to self"}, status=status.HTTP_400_BAD_REQUEST)

    # This friend request should not already be in the DB
    # By extension, this also makes sure the users aren't already friends
    if (FriendStatus.objects.filter(user_a=user_a, user_b=user_b).exists()):
        return Response({'error': "Duplicate request"}, status=status.HTTP_400_BAD_REQUEST)

    # Insert friend request into DB
    new_req = FriendStatus(user_a=user_a, user_b=user_b, from_user=from_user, accepted=False)
    new_req.save()

    return Response({'status': "Success"})

# Can be used to remove an unaccepted friend request, OR
# can remove an existing friendship, depending on 'accepted'
def remove_friend_status(from_user, to_user, user_a, user_b, accepted):
    """Remove a friend request or friendship between two users"""
    try:
        # Look for the friend request/status
        requests = FriendStatus.objects.filter(user_a=user_a, user_b=user_b, accepted=accepted)
        if not requests.exists():
            return Response({'error': "Friend status doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

        # Remove the friendship from the database
        req = requests[0]
        req.delete()

        return Response({'status': "Success"})
    except Exception as e:
        # Log the error for debugging
        print(f"Error in remove_friend_status: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def accept_friend_request(from_user, to_user, user_a, user_b):
    """Accept a friend request between two users"""
    try:
        # Look for the friend request
        requests = FriendStatus.objects.filter(user_a=user_a, user_b=user_b, accepted=False)
        if not requests.exists():
            return Response({'error': "Friend request doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

        # Change the request to be accepted
        req = requests[0]
        req.accepted = True
        req.save()

        return Response({'status': "Success"})
    except Exception as e:
        # Log the error for debugging
        print(f"Error in accept_friend_request: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Check whether the server is online
@api_view(['GET'])
def health_check(request):
    return Response({"status":"healthy"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
    """Get all pending friend requests for the current user"""
    try:
        current_user_id = request.user.id
        
        # Find pending friend requests where current user is the recipient
        # This query is simplified from the previous one to avoid errors
        pending_requests = FriendStatus.objects.filter(
            (
                Q(user_a=current_user_id) | Q(user_b=current_user_id)
            ) & ~Q(from_user=current_user_id),
            accepted=False
        )
        
        # Format the response data
        result = []
        for req in pending_requests:
            # The from_user is the sender
            from_user_id = req.from_user
            
            try:
                sender = CustomUser.objects.get(id=from_user_id)
                result.append({
                    'id': req.id,
                    'from': {
                        'id': sender.id,
                        'username': sender.username,
                        'user_type': sender.user_type,
                        'bio': sender.bio or ""
                    }
                })
            except CustomUser.DoesNotExist:
                # Skip if user doesn't exist
                continue
        
        return Response(result)
    except Exception as e:
        print(f"Error getting friend requests: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    """Get all accepted friends for the current user"""
    current_user_id = request.user.id
    
    # Find accepted friend relationships where current user is either user_a or user_b
    friends_a = FriendStatus.objects.filter(user_a=current_user_id, accepted=True)
    friends_b = FriendStatus.objects.filter(user_b=current_user_id, accepted=True)
    
    # Extract the friend IDs
    friend_ids = []
    for fs in friends_a:
        # If user_a is the current user, then user_b is the friend
        friend_ids.append(fs.user_b)
    
    for fs in friends_b:
        # If user_b is the current user, then user_a is the friend
        friend_ids.append(fs.user_a)
    
    # Get the friend details
    result = []
    for friend_id in friend_ids:
        try:
            friend = CustomUser.objects.get(id=friend_id)
            result.append({
                'id': friend.id,
                'username': friend.username,
                'user_type': friend.user_type,
                'bio': friend.bio or ""
            })
        except CustomUser.DoesNotExist:
            # Skip if the user no longer exists
            continue
    
    return Response(result)

# User posts endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_posts(request, user_id):
    try:
        user = CustomUser.objects.get(pk=user_id)
        posts = Post.objects.filter(creator=user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Update profile endpoint
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request, user_id):
    try:
        # Ensure user can only update their own profile
        if request.user.id != int(user_id):
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Get all conversations
# Get all conversations
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations(request):
    try:
        user = request.user
        
        # Get all users the current user has messaged or received messages from
        message_partners = CustomUser.objects.filter(
            Q(sent_messages__receiver=user) | Q(received_messages__sender=user)
        ).distinct()
        
        conversation_data = []
        
        for partner in message_partners:
            # Get last message in conversation
            last_message = Message.objects.filter(
                Q(sender=user, receiver=partner) | Q(sender=partner, receiver=user)
            ).order_by('-created_at').first()
            
            # Count unread messages
            unread_count = Message.objects.filter(
                sender=partner, 
                receiver=user, 
                is_read=False
            ).count()
            
            if last_message:
                # Create a basic user dictionary with only fields we know exist
                partner_data = {
                    "id": partner.id,
                    "username": partner.username,
                    "user_type": partner.user_type,
                    "bio": partner.bio or ""
                }
                
                conversation_data.append({
                    "user": partner_data,
                    "last_message": last_message.content,
                    "last_message_time": last_message.created_at,
                    "unread_count": unread_count
                })
        
        # Sort by last message time
        conversation_data.sort(key=lambda x: x["last_message_time"], reverse=True)
        
        return Response(conversation_data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Get or send messages
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def messages(request, user_id):
    try:
        partner = CustomUser.objects.get(pk=user_id)
        user = request.user
        
        if request.method == 'GET':
            # Get all messages between current user and partner
            messages_list = Message.objects.filter(
                Q(sender=user, receiver=partner) | Q(sender=partner, receiver=user)
            ).order_by('created_at')
            
            # Mark messages from partner as read
            unread_messages = messages_list.filter(sender=partner, receiver=user, is_read=False)
            for message in unread_messages:
                message.is_read = True
                message.save()
            
            # Serialize messages with is_self flag
            message_data = []
            for message in messages_list:
                data = {
                    "id": message.id,
                    "content": message.content,
                    "created_at": message.created_at,
                    "is_self": message.sender == user
                }
                message_data.append(data)
            
            return Response(message_data)
        
        elif request.method == 'POST':
            # Create new message
            content = request.data.get('content')
            
            if not content:
                return Response({"error": "Message content is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            message = Message(sender=user, receiver=partner, content=content)
            message.save()
            
            return Response({
                "id": message.id,
                "content": message.content,
                "created_at": message.created_at,
                "is_self": True
            }, status=status.HTTP_201_CREATED)
            
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    try:
        user = request.user
        if 'image' not in request.FILES:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        user.profile_picture = request.FILES['image']
        user.save()

        return Response({
            "message": "Profile picture updated successfully",
            "profile_picture_url": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
