from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FreelancerProfileViewSet, JobViewSet, MatchViewSet, 
    RegisterView, ApplicationViewSet, UserMeView, NotificationViewSet,
    MessageViewSet, InvitationViewSet
)

router = DefaultRouter()
router.register(r'profiles', FreelancerProfileViewSet, basename='profiler')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'invitations', InvitationViewSet, basename='invitation')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('', include(router.urls)),
]
