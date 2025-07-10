from django.shortcuts import render

def index(request):
    return render(request, 'pages/index.html')
    
def wheel(request):
    return render(request, 'pages/wheel.html')
