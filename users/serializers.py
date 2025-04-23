from rest_framework import serializers
from .models import CustomUser, Message


class UserSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    interests = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "user_type",
            "bio",
            "genres",
            "skills",
            "interests",
            "date_joined",
            "profile_picture_url",
        ]

    def get_skills(self, obj):
        if hasattr(obj, "skills") and obj.skills:
            if isinstance(obj.skills, (dict, list)):
                return obj.skills
            return obj.skills
        return []

    def get_interests(self, obj):
        if hasattr(obj, "interests") and obj.interests:
            if isinstance(obj.interests, (dict, list)):
                return obj.interests
            return obj.interests
        return []

    def get_profile_picture_url(self, obj):
        pic = getattr(obj, "profile_picture", None)
        if pic and hasattr(pic, "url"):
            request = self.context.get("request")
            return request.build_absolute_uri(pic.url) if request else pic.url
        return None


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "content", "created_at", "is_read"]
