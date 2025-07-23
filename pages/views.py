from django.shortcuts import render
from nativity.utils import SIGNS
import json


def index(request):
    return render(request, 'pages/index.html')

def wheel(request):
    return render(request, 'pages/wheel.html', {
        'signs_json': json.dumps(SIGNS),
    })
    