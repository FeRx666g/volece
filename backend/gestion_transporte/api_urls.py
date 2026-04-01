from django.urls import path
from .views import obtener_transportistas

urlpatterns = [
    path('usuarios/transportistas/', obtener_transportistas, name='obtener_transportistas'),
]

