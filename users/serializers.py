from rest_framework import serializers
from .models import CustomUser, Message

class UserSerializer(serializers.ModelSerializer):
    # New! this will return the full URL to the image
    profile_picture = serializers.ImageField(read_only=True)

    # your existing SerializerMethodFields…
    skills = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'user_type',
            'bio',
            'genres',
            'skills',
            'interests',
            'date_joined',
            'profile_picture',    # ← add this
        ]


    def get_skills(self, obj):
        if hasattr(obj, 'skills') and obj.skills:
            return obj.skills if isinstance(obj.skills, (dict, list)) else obj.skills
        return []

    def get_interests(self, obj):
        if hasattr(obj, 'interests') and obj.interests:
            return obj.interests if isinstance(obj.interests, (dict, list)) else obj.interests
        return []

    def get_profile_picture_url(self, obj):
        """
        Return an absolute URL for the user's profile_picture,
        or None if they haven't uploaded one.
        """
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return request.build_absolute_uri(obj.profile_picture.url)
        return None


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'content', 'created_at', 'is_read']
