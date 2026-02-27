from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from courses.models import Course
from enrollments.models import Enrollment
from reviews.models import Review


@api_view(['GET'])
def dashboard_data(request):
    data = {
        "total_courses": Course.objects.count(),
        "total_enrollments": Enrollment.objects.count(),
        "total_reviews": Review.objects.count(),
    }
    return Response(data)