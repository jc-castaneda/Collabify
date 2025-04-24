# I M P O R T S   &   D E P E N D E N C I E S ----------------------
from rest_framework import serializers
from .models import Post, Comment
from users.models import CustomUser


# S E R I A L I Z E R S --------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'user_type']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    timestamp = serializers.FloatField(required=False, allow_null=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'timestamp', 'parent', 'replies']
        read_only_fields = ['author', 'created_at']
    
    def get_replies(self, obj):
        if hasattr(obj, 'prefetched_replies'):
            replies = obj.prefetched_replies
        else:
            replies = Comment.objects.filter(parent=obj)
        
        return CommentSerializer(replies, many=True, context=self.context).data
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
    
class PostSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'creator', 'created_at',
                          'updated_at', 'status', 'genre', 'looking_for',
                          'like_count', 'is_liked', 'comments',
                          'image', 'song']
        read_only_fields = ['creator', 'created_at', 'updated_at']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)
