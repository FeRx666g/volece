from django.urls import path
from . import views  

urlpatterns = [
    path('usuarios/pdf/', views.reporte_usuarios_pdf, name='reporte_usuarios_pdf'),
    path('solicitudes/pdf/', views.reporte_solicitudes_pdf, name='reporte_solicitudes_pdf'),
    path('vehiculos/pdf/', views.reporte_vehiculos_pdf, name='reporte_vehiculos_pdf'),
    path('usuarios/preview/', views.reporte_usuarios_preview, name='reporte_usuarios_preview'),
    path('solicitudes/preview/', views.reporte_solicitudes_preview, name='reporte_solicitudes_preview'),
    path('vehiculos/preview/', views.reporte_vehiculos_preview, name='reporte_vehiculos_preview'),

    path('finanzas-pdf/', views.reporte_finanzas_pdf, name='finanzas_pdf'),
    path('mensualidades-pdf/', views.reporte_mensualidades_pdf, name='mensualidades_pdf'),
    path('estado-cuenta-pdf/', views.reporte_estado_cuenta_pdf, name='estado_cuenta_pdf'),

    path('mantenimientos-pdf/', views.reporte_mantenimientos_pdf, name='reporte_mantenimientos_pdf'),
    path('viajes-transportista/', views.reporte_viajes_transportista, name='reporte_viajes_transportista'),
]