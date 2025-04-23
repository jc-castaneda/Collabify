from rest_framework import serializers
from .models import CustomUser, Message

class UserSerializer(serializers.ModelSerializer):
    # Convert JSONField to string representation for the API
    skills = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'user_type', 'bio', 'genres', 'skills', 'interests', 'date_joined']
    
    def get_skills(self, obj):
        # Handle JSONField or return as string if needed
        if hasattr(obj, 'skills') and obj.skills:
            if isinstance(obj.skills, dict) or isinstance(obj.skills, list):
                return obj.skills
            return obj.skills
        return []
    
    def get_interests(self, obj):
        # Handle JSONField or return as string if needed
        if hasattr(obj, 'interests') and obj.interests:
            if isinstance(obj.interests, dict) or isinstance(obj.interests, list):
                return obj.interests
            return obj.interests
        return []

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'content', 'created_at', 'is_read']