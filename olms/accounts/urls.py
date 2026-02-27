from django.urls import path
from .views import RegisterView, ProfileView, LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # REGISTER
    path('register/', RegisterView.as_view()),

    # LOGIN (Custom Email-based JWT)
    path('login/', LoginView.as_view()),

    # REFRESH TOKEN
    path('refresh/', TokenRefreshView.as_view()),

    # PROFILE
    path('profile/', ProfileView.as_view()),
]