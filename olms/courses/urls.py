from django.urls import path
from .views import (
    course_list_create, course_detail,
    module_list_create, module_detail,
    lecture_list_create, lecture_detail
)

urlpatterns = [
    path('courses/', course_list_create),
    path('courses/<int:pk>/', course_detail),

    path('modules/', module_list_create),
    path('modules/<int:pk>/', module_detail),

    path('lectures/', lecture_list_create),
    path('lectures/<int:pk>/', lecture_detail),
]