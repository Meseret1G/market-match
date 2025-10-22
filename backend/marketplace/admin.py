from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Booking)
admin.site.register(ProviderProfile)
admin.site.register(ProviderAvailability)
admin.site.register(Review)