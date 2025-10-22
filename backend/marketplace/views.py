from rest_framework import viewsets, permissions, filters, viewsets, mixins, status
from rest_framework.permissions import AllowAny
from .models import *
from rest_framework import status, generics
from .serializers import *
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from django.utils import timezone
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework.views import APIView
from .services import get_provider_profile

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if request.data.get('is_provider'):
            ProviderProfile.objects.create(user=user, display_name=user.username)

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

# class MyProviderProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             profile = ProviderProfile.objects.get(user=request.user)
#             serializer = ProviderProfileSerializer(profile)
#             return Response(serializer.data)
#         except ProviderProfile.DoesNotExist:
#             return Response(
#                 {"detail": "No profile found for this user."},
#                 status=status.HTTP_404_NOT_FOUND
#             )        
class ProviderProfileViewSet(viewsets.ModelViewSet):
    queryset= ProviderProfile.objects.select_related('user').all()
    serializer_class = ProviderProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        profile = get_provider_profile(request.user.id)  # use cached function
        if profile:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        return Response({"detail": "No profile found"}, status=404)


class ServiceListingViewSet(viewsets.ModelViewSet):
    queryset = ServiceListing.objects.select_related('provider').all()
    serializer_class = ServiceListingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title','description','provider__display_name']

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        # ?lat=...&lon=...&radius_km=10
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        radius_km = float(request.query_params.get('radius_km', 10))
        if not lat or not lon:
            return Response({"detail":"lat and lon required"}, status=400)
        from django.db import connection
        from django.db.models import F, FloatField, ExpressionWrapper
        import math
        lat = float(lat); lon = float(lon)
        listings = ServiceListing.objects.filter(active=True).select_related('provider')
        def haversine(a_lat,a_lon,b_lat,b_lon):
            R=6371
            from math import radians,sin,cos,asin,sqrt
            dlat=radians(b_lat-a_lat); dlon=radians(b_lon-a_lon)
            a=sin(dlat/2)**2 + cos(radians(a_lat))*cos(radians(b_lat))*sin(dlon/2)**2
            c=2*asin(sqrt(a)); return R*c
        results = []
        for l in listings:
            if l.provider.latitude is None or l.provider.longitude is None:
                continue
            d = haversine(lat, lon, float(l.provider.latitude), float(l.provider.longitude))
            if d <= radius_km:
                results.append(l)
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('listing', 'customer').all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'provider_profile'):
            return Booking.objects.filter(models.Q(customer=user) | models.Q(listing__provider= user.provider_profile))
        
        return Booking.objects.filter(customer=user)
    