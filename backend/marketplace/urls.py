# marketplace/urls.py
from rest_framework.routers import DefaultRouter
from .views import  ProviderProfileViewSet, ServiceListingViewSet, BookingViewSet, RegisterAPIView
from django.urls import path, include

router = DefaultRouter()
router.register('providers', ProviderProfileViewSet, basename='providers')
router.register('listings', ServiceListingViewSet)
router.register('bookings', BookingViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterAPIView.as_view(), name='register'),
    

]
