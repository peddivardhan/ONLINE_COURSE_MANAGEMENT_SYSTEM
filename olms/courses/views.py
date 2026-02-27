from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer
from .models import Course, Module, Lecture
from .serializers import CourseSerializer, ModuleSerializer, LectureSerializer


# GET ALL COURSES + CREATE COURSE
@api_view(['GET', 'POST'])
def course_list_create(request):
    if request.method == 'GET':
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)


# GET ONE + UPDATE + DELETE
@api_view(['GET', 'PUT', 'DELETE'])
def course_detail(request, pk):
    try:
        course = Course.objects.get(id=pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"})

    if request.method == 'GET':
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CourseSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    elif request.method == 'DELETE':
        course.delete()
        return Response({"message": "Deleted successfully"})
@api_view(['GET', 'POST'])
def module_list_create(request):
    if request.method == 'GET':
        data = Module.objects.all()
        serializer = ModuleSerializer(data, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ModuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
def module_detail(request, pk):
    try:
        obj = Module.objects.get(id=pk)
    except Module.DoesNotExist:
        return Response({"error": "Not found"})

    if request.method == 'GET':
        return Response(ModuleSerializer(obj).data)

    elif request.method == 'PUT':
        serializer = ModuleSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    elif request.method == 'DELETE':
        obj.delete()
        return Response({"message": "Deleted"})
@api_view(['GET', 'POST'])
def lecture_list_create(request):
    if request.method == 'GET':
        data = Lecture.objects.all()
        serializer = LectureSerializer(data, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = LectureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
def lecture_detail(request, pk):
    try:
        obj = Lecture.objects.get(id=pk)
    except Lecture.DoesNotExist:
        return Response({"error": "Not found"})

    if request.method == 'GET':
        return Response(LectureSerializer(obj).data)

    elif request.method == 'PUT':
        serializer = LectureSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    elif request.method == 'DELETE':
        obj.delete()
        return Response({"message": "Deleted"})