from django.shortcuts import render
from django.http import JsonResponse
from .models import Elemental

def element_data(request):
    data = list(Elemental.objects.values())
    return JsonResponse(data, safe=False)
