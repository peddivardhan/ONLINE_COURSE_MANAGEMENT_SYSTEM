from rest_framework import serializers
from .models import User


# REGISTER
class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=128)
    last_name = serializers.CharField(max_length=128)
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(default='STUDENT', required=False)

    def create(self, validated_data):
        email = validated_data['email']
        first_name = validated_data['first_name']
        last_name = validated_data['last_name']
        password = validated_data['password']
        role = validated_data.get('role', 'STUDENT')
        
        full_name = f"{first_name} {last_name}"
        
        user = User.objects.create_user(
            email=email,
            full_name=full_name,
            password=password,
            role=role
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value


# PROFILE (READ ONLY)
class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'created_at']
    
    def get_first_name(self, obj):
        names = obj.full_name.split(' ', 1)
        return names[0] if names else ''
    
    def get_last_name(self, obj):
        names = obj.full_name.split(' ', 1)
        return names[1] if len(names) > 1 else ''