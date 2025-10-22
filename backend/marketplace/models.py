from django.db import models

# Create your models here.

from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class ProviderProfile(models.Model):
    user= models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    place = models.CharField(max_length=255, blank=True)
    def __str__(self):
        return self.display_name

class ServiceListing(models.Model):
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price_cents = models.PositiveIntegerField() 
    duration_minutes = models.PositiveIntegerField(default=60)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def price_display(self):
        return f"{self.price_cents / 100:.2f}"

    def __str__(self):
        return f"{self.title} — {self.provider.display_name}"
    

class ProviderAvailability(models.Model):
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='availability')
    start = models.DateTimeField()
    end = models.DateTimeField()
    
    class Meta:
        indexes = [models.Index(fields=['provider', 'start', 'end'])]
        
    
    def __str__(self):
        return f"{self.provider.display_name}: {self.start.isoformat()} - {self.end.isoformat()}"

class Booking(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ACCEPTED = 'accepted'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]
    
    listing = models.ForeignKey(ServiceListing, on_delete=models.CASCADE, related_name='booking')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='booking')
    start = models.DateTimeField()
    end = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [models.Index(fields=['listing','start','end','status'])]
    
    def __str__(self):
        return f"Booking {self.id} ({self.listing.title}) {self.start}"


class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)