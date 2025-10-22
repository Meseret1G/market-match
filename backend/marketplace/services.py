from django.db.models import Q
from .models import Booking
from django.core.cache import cache
from .models import ProviderProfile

def get_provider_profile(user_id):
    key = f"profile:{user_id}"
    profile = cache.get(key)  
    if not profile:
        profile = ProviderProfile.objects.filter(user_id=user_id).first()
        if profile:
            cache.set(key, profile, timeout=60*5)  
    return profile


def booking_conflicts(listing, start, end):
    conflicts = Booking.objects.filter(
        listing= listing,
        status__in = [Booking.STATUS_PENDING, Booking.STATUS_ACCEPTED]
    ).filter(
        Q(start__lt=end) & Q(end__gt=start)
    )
    return conflicts.exists()