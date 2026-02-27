from django.urls import path
from .views import enrollment_list_create, enrollment_detail

urlpatterns = [
    path('enrollments/', enrollment_list_create),
    path('enrollments/<int:pk>/', enrollment_detail),
]