from django.contrib import admin
from .models import PlayerCharacter, Accolade, PlayerAccolade

class PlayerCharacterAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'first_name', 'last_name', 'email', 'creation_date', 'is_werman', 'is_wifman', 'experiences')
    list_display_links = ('id', 'username')
    search_fields = ('username',)
    list_per_page = 50
    
class AccoladeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'date_created')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description')
    list_per_page = 50

admin.site.register(PlayerCharacter, PlayerCharacterAdmin)