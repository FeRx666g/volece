from django.urls import path, include
from rest_framework.routers import DefaultRouter


from .views import (
    CrearSolicitudServicioView,
    ListaSolicitudesClienteView,
    ListaSolicitudesAdminView,
    SolicitudDetailView,
    AsignarTurnoIAView, 
    CrearTurnoDesdeSolicitudView, 
    MisAsignacionesView,
    EstadoSolicitudViewSet,
    CancelarSolicitudClienteView,
)

router = DefaultRouter()
router.register(r'estados-solicitudes', EstadoSolicitudViewSet, basename='estado-solicitud')

urlpatterns = [
    path('solicitudes/crear/', CrearSolicitudServicioView.as_view(), name='crear-solicitud'),
    path('solicitudes/mis-solicitudes/', ListaSolicitudesClienteView.as_view(), name='mis-solicitudes'),
    path('solicitudes/', ListaSolicitudesAdminView.as_view(), name='solicitudes-admin'),
    path('solicitudes/<int:pk>/', SolicitudDetailView.as_view(), name='solicitud-detail'),
    path('solicitudes/<int:pk>/cancelar/', CancelarSolicitudClienteView.as_view(), name='cancelar-solicitud-cliente'),
    path('solicitudes/todas/', ListaSolicitudesAdminView.as_view(), name='solicitudes-admin'),

    # Nuevo endpoint para la IA de n8n:
    path('asignar-turno/', AsignarTurnoIAView.as_view(), name='asignar-turno-ia'),
    
    path('solicitudes/crear-turno/', CrearTurnoDesdeSolicitudView.as_view(), name='crear-turno-desde-solicitud'),

    path('mis-asignaciones/', MisAsignacionesView.as_view(), name='mis-asignaciones'),

    path('', include(router.urls)),
]

