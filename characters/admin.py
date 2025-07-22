from django.contrib import admin
from .models import PlayerCharacter

class PlayerCharacterAdmin(admin.ModelAdmin):
    list_display = ('id', 'screenname', 'forename', 'surname', 'email', 'creation_date', 'is_werman', 'is_wifman')
    list_display_links = ('id', 'screenname')
    search_fields = ('screenname',)
    list_per_page = 50

admin.site.register(PlayerCharacter, PlayerCharacterAdmin)