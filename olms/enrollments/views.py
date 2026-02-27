from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Enrollment
from .serializers import EnrollmentSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def enrollment_list_create(request):
    if request.method == 'GET':
        # Get only the current user's enrollments
        data = Enrollment.objects.filter(user=request.user)
        serializer = EnrollmentSerializer(data, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = EnrollmentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def enrollment_detail(request, pk):
    try:
        # Make sure user can only access their own enrollments
        obj = Enrollment.objects.get(id=pk, user=request.user)
    except Enrollment.DoesNotExist:
        return Response({"error": "Enrollment not found"}, status=404)

    if request.method == 'GET':
        serializer = EnrollmentSerializer(obj, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = EnrollmentSerializer(obj, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        obj.delete()
        return Response({"message": "Unenrolled successfully"}, status=204)