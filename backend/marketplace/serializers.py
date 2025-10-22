from rest_framework import serializers
from .models import ServiceListing, ProviderProfile, Booking, ProviderAvailability, Review
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    is_provider = serializers.BooleanField(default=False, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'is_provider']

    def create(self, validated_data):
        is_provider = validated_data.pop('is_provider', False)
        
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        user.is_provider_flag = is_provider 
        return user

    
class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = '__all__'
        read_only_fields =('user',)

class ServiceListingSerializer(serializers.ModelSerializer):
    provider = ProviderProfileSerializer(read_only=True)
    provider_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=ProviderProfile.objects.all(), source='provider')

    class Meta:
        model = ServiceListing
        fields = ['id','provider','provider_id','title','description','price_cents','duration_minutes','active','created_at']

class BookingSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())
    listing = serializers.PrimaryKeyRelatedField(queryset=ServiceListing.objects.all())
    class Meta:
        model = Booking
        fields = ['id','listing','customer','start','end','status','created_at']
        read_only_fields = ['status','created_at','customer']

    def validate(self, data):
        start = data.get('start')
        end = data.get('end')
        if start >= end:
            raise serializers.ValidationError("start must be before end")
        
        return data
    
    def create(self, validated_data):
        from .services import booking_conflicts
        
        listing = validated_data['listing']
        start = validated_data['start']
        end = validated_data['end']
        if booking_conflicts(listing, start, end):
            raise serializers.ValidationError("Time slot not available.")

        request = self.context.get('request')
        customer = request.user
        booking = Booking.objects.create(customer=customer, **validated_data)
        
        return booking

class ProviderAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderAvailability
        fields = '__all__'
        read_only_fields = ('provider',)