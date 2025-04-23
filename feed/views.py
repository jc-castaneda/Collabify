# I M P O R T S   &   D E P E N D E N C I E S-----------------------
import os
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse, FileResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer


# V I E W S --------------------------------------------------------


# POST HANDLING ----------------------

@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_list(request):
    """
    If GET request returns a list of posts
    If POST request creates a new post
    """

    if request.method == 'GET':
        posts = Post.objects.all().order_by('-created_at') # type: ignore
        serializer = PostSerializer(posts, many=True, context={'request' : request})

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def post_detail(request, pk):
    """
    Retrieve update or delete post
    """

    # Checks to see if post exists
    try:
        post = Post.objects.get(pk=pk) #type: ignore
    except Post.DoesNotExist: #type: ignore
        return Response(status=status.HTTP_404_NOT_FOUND)

    # GET Request
    if request.method == 'GET':
        serializer = PostSerializer(post, context={'request':request})
        return Response(serializer.data)

    # Only allow creator to modify or delete post
    if post.creator != request.user:
        return Response({"error": "Not Authorized!"}, status=status.HTTP_403_FORBIDDEN)


    # PUT Request
    if request.method == 'PUT':
        serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# COMMENT HANDLING
@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):
    """
    List all comments for a post or create a new comment
    """
    # Check to see if post exists
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Get only top-level comments (no parent)
        comments = Comment.objects.filter(post=post, parent=None).order_by('created_at')
        # Prefetch replies to avoid N+1 query problem
        for comment in comments:
            comment.prefetched_replies = Comment.objects.filter(parent=comment).order_by('created_at')
        
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Check if this is a reply to another comment
            parent_id = request.data.get('parent')
            if parent_id:
                try:
                    parent_comment = Comment.objects.get(pk=parent_id, post=post)
                    serializer.save(post=post, parent=parent_comment)
                except Comment.DoesNotExist:
                    return Response({"error": "Parent comment not found"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer.save(post=post)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# LIKE HANDLING ----------------------

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, pk):
    """
    Toggles likes for a post
    """
    # Checks to see if post exists
    try:
        post = Post.objects.get(pk=pk) #type: ignore
    except Post.DoesNotExist:       #type: ignore
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = request.user

    # Toggle like
    if user in post.likes.all():
        post.likes.remove(user)
        return Response({"liked": False, "count": post.likes.count()})

    else:
        post.likes.add(user)
        return Response({"liked": True, "count": post.likes.count()})


# FILE HANDLING

@csrf_exempt
@api_view(['GET'])
def get_image(request, pk):
    """
    Retrieve image file for a post (no authentication required)
    """
    try:
        post = Post.objects.get(pk=pk)
        
        # Check if image exists
        if not post.image or not post.image.path or not os.path.isfile(post.image.path):
            return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Set response with file
        response = FileResponse(open(post.image.path, 'rb'))
        
        # Set content type based on file extension
        file_name = post.image.name.lower()
        if file_name.endswith('.jpg') or file_name.endswith('.jpeg'):
            response['Content-Type'] = 'image/jpeg'
        elif file_name.endswith('.png'):
            response['Content-Type'] = 'image/png'
        elif file_name.endswith('.gif'):
            response['Content-Type'] = 'image/gif'
        else:
            response['Content-Type'] = 'application/octet-stream'
        
        # Add CORS headers
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        
        return response
    
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
def get_song(request, pk):
    """
    Retrieve song file for a post (no authentication required)
    """
    try:
        post = Post.objects.get(pk=pk)
        
        # Check if song exists
        if not post.song or not post.song.path or not os.path.isfile(post.song.path):
            return Response({"error": "Audio file not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Set response with file
        response = FileResponse(open(post.song.path, 'rb'))
        
        # Set content type based on file extension
        file_name = post.song.name.lower()
        if file_name.endswith('.mp3'):
            response['Content-Type'] = 'audio/mpeg'
        elif file_name.endswith('.wav'):
            response['Content-Type'] = 'audio/wav'
        elif file_name.endswith('.ogg'):
            response['Content-Type'] = 'audio/ogg'
        else:
            response['Content-Type'] = 'application/octet-stream'
        
        # Add content disposition to help browsers understand how to handle the file
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(post.song.name)}"'
        
        # Add CORS headers
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        
        return response
    
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# TEMPORARY DOCUMENT FOR MUSIC/IMAGE UPLOADS

def upload_test(request):
    template = loader.get_template('file_upload.html')
    return HttpResponse(template.render())