from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer


@api_view(['GET', 'POST'])
def review_list_create(request):
    if request.method == 'GET':
        data = Review.objects.all()
        serializer = ReviewSerializer(data, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
def review_detail(request, pk):
    try:
        obj = Review.objects.get(id=pk)
    except Review.DoesNotExist:
        return Response({"error": "Not found"})

    if request.method == 'GET':
        serializer = ReviewSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ReviewSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)

    elif request.method == 'DELETE':
        obj.delete()
        return Response({"message": "Deleted"})