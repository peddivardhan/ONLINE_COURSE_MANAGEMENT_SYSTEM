from django.urls import path
from .views import review_list_create, review_detail

urlpatterns = [
    path('reviews/', review_list_create),
    path('reviews/<int:pk>/', review_detail),
]