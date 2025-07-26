from django.contrib import admin
from .models import PlayerCharacter

class PlayerCharacterAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'first_name', 'last_name', 'email', 'creation_date', 'is_werman', 'is_wifman')
    list_display_links = ('id', 'username')
    search_fields = ('username',)
    list_per_page = 50

admin.site.register(PlayerCharacter, PlayerCharacterAdmin)