from rest_framework import serializers
from .models import Enrollment
from courses.serializers import CourseSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_details', 'status', 'enrolled_at', 'completed_at']
        read_only_fields = ['id', 'enrolled_at', 'completed_at']
    
    def create(self, validated_data):
        # Automatically set the user to the current authenticated user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)