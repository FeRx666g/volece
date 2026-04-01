from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehiculoViewSet, VehiculoTransportistaView, VehiculoEstadoUpdateView, 
    MantenimientoTransportistaView, TipoVehiculoViewSet, TipoMantenimientoViewSet,
    TipoCombustibleViewSet, EstadoVehiculoViewSet, 
    AlertasMantenimientoView, ActualizarKilometrajeView
)

router = DefaultRouter()
router.register(r'tipos', TipoVehiculoViewSet, basename='tipos-vehiculo')
router.register(r'tipos-mantenimiento', TipoMantenimientoViewSet, basename='tipos-mantenimiento')
router.register(r'tipos-combustible', TipoCombustibleViewSet, basename='tipos-combustible')
router.register(r'estados-vehiculo', EstadoVehiculoViewSet, basename='estados-vehiculo')
router.register(r'', VehiculoViewSet, basename='vehiculos')

urlpatterns = [
    path('transportista/vehiculo', VehiculoTransportistaView.as_view(), name='vehiculo-transportista'),
    path('transportista/vehiculo/estado', VehiculoEstadoUpdateView.as_view(), name='vehiculo-estado-update'),
    path('transportista/mantenimientos', MantenimientoTransportistaView.as_view(), name='mantenimiento-transportista'),
    path('transportista/alertas', AlertasMantenimientoView.as_view(), name='alertas-mantenimiento'),
    path('transportista/vehiculo/kilometraje', ActualizarKilometrajeView.as_view(), name='actualizar-kilometraje'),
    path('', include(router.urls)),
]


