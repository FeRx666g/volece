from rest_framework import generics, permissions, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets

from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

import requests

from .models import SolicitudServicio, PrediccionIA, EstadoSolicitud, EstadoSistema
from .serializers import SolicitudServicioSerializer, DatasetTurnosIASerializer, EstadoSolicitudSerializer

from django.utils import timezone

from gestion_transporte.models import DatasetTurnosIA
from gestion_vehiculos.models import Vehiculo
from gestion_usuarios.models import Usuario
from gestion_usuarios.permissions import IsAdminRol

from django.conf import settings

class EstadoSolicitudViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EstadoSolicitud.objects.all()
    serializer_class = EstadoSolicitudSerializer
    permission_classes = [IsAuthenticated]

class CrearSolicitudServicioView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]
    serializer_class = SolicitudServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Assign default 'pendiente' state if not provided
        estado_pendiente = get_object_or_404(EstadoSolicitud, codigo='pendiente')
        estado_activo = get_object_or_404(EstadoSistema, codigo='ACTIVO')
        serializer.save(cliente=self.request.user, estado=estado_pendiente, estado_sistema=estado_activo)


class ListaSolicitudesClienteView(generics.ListAPIView):
    serializer_class = SolicitudServicioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SolicitudServicio.objects.filter(
            cliente=self.request.user,
            estado_sistema__codigo='ACTIVO' 
        ).order_by('-fecha_creacion')


class ListaSolicitudesAdminView(generics.ListAPIView):
    queryset = SolicitudServicio.objects.filter(cliente__is_active=True, estado_sistema__codigo='ACTIVO').prefetch_related('prediccion_ia').order_by('-fecha_creacion')
    serializer_class = SolicitudServicioSerializer
    permission_classes = [IsAdminRol]  
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['cliente']
    search_fields = ['cliente__username']
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        estado_param = self.request.query_params.get('estado')
        if estado_param:
            qs = qs.filter(estado__codigo=estado_param)
        return qs

class SolicitudDetailView(generics.RetrieveUpdateAPIView):
    queryset = SolicitudServicio.objects.all()
    serializer_class = SolicitudServicioSerializer
    permission_classes = [IsAdminRol]
 
class AsignarTurnoIAView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminRol] 

    def post(self, request, *args, **kwargs):
        id_solicitud = request.data.get("id_solicitud")

        if not id_solicitud:
            return Response(
                {"detail": "Falta el campo id_solicitud."},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud = get_object_or_404(SolicitudServicio, pk=id_solicitud)

        if solicitud.estado and solicitud.estado.codigo == 'asignado':
            return Response(
                {"detail": "La solicitud ya fue asignada y no debe enviarse nuevamente a IA."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payload = {
            "id_solicitud": solicitud.id,
            "origen": getattr(solicitud, "origen", None),
            "destino": getattr(solicitud, "destino", None),
            "tipo_vehiculo": request.data.get("tipo_vehiculo") or getattr(solicitud, "tipo_vehiculo", None),
            "tipo_carga": getattr(solicitud, "tipo_carga", None),
            "fecha_solicitud": getattr(solicitud, "fecha_solicitud", None).isoformat()
            if getattr(solicitud, "fecha_solicitud", None) is not None
            else None,
        }

        try:
            resp = requests.post(settings.N8N_URL_ASIGNAR_TURNO, json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()

            prediccion, created = PrediccionIA.objects.update_or_create(
                solicitud=solicitud,
                defaults={'datos': data}
            )

        except Exception as e:
            return Response(
                {
                    "detail": "Error al comunicarse con n8n",
                    "error": str(e),
                },
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response(data, status=status.HTTP_200_OK)

class CrearTurnoDesdeSolicitudView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminRol]

    def post(self, request, *args, **kwargs):

        solicitud_id = request.data.get('solicitud_id')
        transportista_id = request.data.get('transportista_id')
        vehiculo_id = request.data.get('vehiculo_id') 
        nuevo_estado_codigo = request.data.get('nuevo_estado')
        comentario_ia = request.data.get('comentario_ia')

        if not solicitud_id or not nuevo_estado_codigo:
            return Response(
                {"detail": "solicitud_id y nuevo_estado son obligatorios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_estado_codigo not in ['asignado', 'rechazado', 'completado']:
            return Response(
                {"detail": "nuevo_estado debe ser 'asignado', 'rechazado' o 'completado'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not transportista_id:
            return Response(
                {"detail": "transportista_id es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud = get_object_or_404(SolicitudServicio, pk=solicitud_id)
        
        try:
            transportista_obj = Usuario.objects.get(pk=transportista_id)
        except Usuario.DoesNotExist:
             return Response({"detail": "Transportista no encontrado."}, status=status.HTTP_400_BAD_REQUEST)

        turno = DatasetTurnosIA.objects.filter(solicitud=solicitud).first()

        vehiculo = None
        
        if vehiculo_id:
            vehiculo = get_object_or_404(Vehiculo, id=vehiculo_id)
            if vehiculo.transportista_id != int(transportista_id):
                 return Response(
                    {"detail": "El vehículo seleccionado no pertenece al transportista."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        elif turno is None or turno.transportista_id != int(transportista_id):
            vehiculo = Vehiculo.objects.filter(
                transportista_id=transportista_id,
                estado='ACTIVO'
            ).order_by('id').first()

            if not vehiculo:
                return Response(
                    {"detail": "El transportista seleccionado no tiene vehículos activos."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            vehiculo = turno.vehiculo

        estado_obj = get_object_or_404(EstadoSolicitud, codigo=nuevo_estado_codigo)
        solicitud.estado = estado_obj
        solicitud.save()

        estado_map = {
            'ACTIVO': 'activo',
            'INACTIVO': 'inactivo',
            'MANTENIMIENTO': 'mantenimiento',
        }
        estado_vehiculo_dataset = estado_map.get(vehiculo.estado, 'activo')

        comentario_final = comentario_ia if nuevo_estado_codigo == 'asignado' else None

        if turno is None:
            fecha_turno = solicitud.fecha_solicitud or timezone.localdate()

            turno = DatasetTurnosIA.objects.create(
                transportista_id=transportista_id,
                vehiculo=vehiculo,
                solicitud=solicitud,
                fecha_turno=fecha_turno,
                estado_vehiculo=estado_vehiculo_dataset,
                vehiculo_operativo=(vehiculo.estado == 'ACTIVO'),
                estado_solicitud=solicitud.estado.codigo, # Save valid Choice value
                comentario_ia=comentario_final,
            )
        else:
            turno.transportista_id = transportista_id
            turno.vehiculo = vehiculo
            turno.estado_vehiculo = estado_vehiculo_dataset
            turno.vehiculo_operativo = (vehiculo.estado == 'ACTIVO')
            turno.estado_solicitud = solicitud.estado.codigo
            
            if comentario_final is not None:
                turno.comentario_ia = comentario_final

            turno.save()

        print(f"     1. Nuevo Estado: '{nuevo_estado_codigo}' (Esperado: 'asignado')")
        print(f"     2. Tiene Teléfono?: {bool(transportista_obj.telefono)}")
            
        if nuevo_estado_codigo == 'asignado' and transportista_obj.telefono:
            
            fecha_servicio_str = ""
            if solicitud.fecha_solicitud:
                fecha_servicio_str = solicitud.fecha_solicitud.strftime('%Y-%m-%d')
            else:
                 fecha_servicio_str = timezone.localdate().strftime('%Y-%m-%d')

            payload_whatsapp = {
                "telefono": transportista_obj.telefono,
                "nombre_transportista": f"{transportista_obj.first_name} {transportista_obj.last_name}",
                "origen": solicitud.origen,
                "destino": solicitud.destino,
                "fecha_servicio": fecha_servicio_str
            }

            try:
                print(f"Enviando webhook a {settings.N8N_URL_WHATSAPP}")
                requests.post(settings.N8N_URL_WHATSAPP, json=payload_whatsapp, timeout=5)
            except requests.exceptions.RequestException as e:
                print(f"ERROR: Fallo la conexión con el webhook de n8n: {e}")

        serializer = DatasetTurnosIASerializer(turno)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MisAsignacionesView(generics.ListAPIView):
    serializer_class = DatasetTurnosIASerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DatasetTurnosIA.objects.filter(
            transportista=self.request.user,
            solicitud__estado__codigo='asignado'  
        ).order_by('-fecha_turno')


class CancelarSolicitudClienteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        solicitud = get_object_or_404(SolicitudServicio, pk=pk)

        # Verify ownership
        if solicitud.cliente != request.user:
            return Response(
                {"detail": "No tienes permiso para cancelar esta solicitud."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verify status (only 'pendiente' or 'asignado' can be cancelled by client)
        if solicitud.estado.codigo not in ['pendiente', 'asignado']:
             return Response(
                {"detail": "Solo se pueden cancelar solicitudes pendientes o asignadas."},
                status=status.HTTP_400_BAD_REQUEST
            )

        estado_cancelado = get_object_or_404(EstadoSolicitud, codigo='cancelado')
        solicitud.estado = estado_cancelado
        solicitud.save()

        return Response({"detail": "Solicitud cancelada correctamente."}, status=status.HTTP_200_OK)