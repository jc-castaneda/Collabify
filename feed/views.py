# I M P O R T S   &   D E P E N D E N C I E S-----------------------
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from django.http import FileResponse
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
        post = Post.objects.get(pk=post_id) #type: ignore
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = Comment.objects.filter(post=post).order_by('created_at') #type: ignore
        serializer = CommentSerializer(comments, many=True, context={'request': request})

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data, context={'request':request})

        if serializer.is_valid():
            serializer.save(post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)





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
@permission_classes([IsAuthenticated])
def get_image(request, pk):

    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return FileResponse(open(post.image.path, 'rb'))


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_song(request, pk):

    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return FileResponse(open(post.song.path, 'rb'))



# TEMPORARY DOCUMENT FOR MUSIC/IMAGE UPLOADS

def upload_test(request):

    template = loader.get_template('file_upload.html');
    return HttpResponse(template.render());