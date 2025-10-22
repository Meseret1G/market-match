from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import BookingSerializer

@receiver(post_save, sender=Booking)
def booking_notify(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    data = BookingSerializer(instance).data

    # Notify customer
    async_to_sync(channel_layer.group_send)(
        f"user_{instance.customer.id}",
        {"type": "booking_update", "data": data}
    )

    # Notify provider
    async_to_sync(channel_layer.group_send)(
        f"user_{instance.listing.provider.user.id}",
        {"type": "booking_update", "data": data}
    )
