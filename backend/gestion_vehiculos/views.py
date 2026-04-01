from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from .models import Vehiculo, Mantenimiento, TipoVehiculo, TipoMantenimiento, TipoCombustible, EstadoVehiculo
from .serializer import (
    VehiculoSerializer, VehiculoTransportistaSerializer, MantenimientoSerializer, 
    TipoVehiculoSerializer, TipoMantenimientoSerializer, TipoCombustibleSerializer, EstadoVehiculoSerializer
)
from gestion_usuarios.permissions import IsAdminRol

class TipoVehiculoViewSet(viewsets.ModelViewSet):
    queryset = TipoVehiculo.objects.all()
    serializer_class = TipoVehiculoSerializer
    permission_classes = [permissions.IsAuthenticated] 

class TipoCombustibleViewSet(viewsets.ModelViewSet):
    queryset = TipoCombustible.objects.all()
    serializer_class = TipoCombustibleSerializer
    permission_classes = [permissions.IsAuthenticated]

class EstadoVehiculoViewSet(viewsets.ModelViewSet):
    queryset = EstadoVehiculo.objects.all()
    serializer_class = EstadoVehiculoSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = TipoMantenimiento.objects.all()
    serializer_class = TipoMantenimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRol]
    pagination_class = None

class VehiculoTransportistaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        vehiculos = Vehiculo.objects.filter(transportista=request.user)

        if not vehiculos.exists():
            return Response({'error': 'No se encontraron vehículos'}, status=status.HTTP_404_NOT_FOUND)

        serializer = VehiculoTransportistaSerializer(vehiculos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VehiculoEstadoUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        # Frontend might send the ID or valid code/name?
        # Let's support both or standardized input. If frontend sends 'ACTIVO', we lookup by codigo or name.
        nuevo_estado = request.data.get('estado')

        try:
            if isinstance(nuevo_estado, int) or (isinstance(nuevo_estado, str) and nuevo_estado.isdigit()):
                estado_obj = EstadoVehiculo.objects.get(id=nuevo_estado)
            else:
                # Assuming 'ACTIVO' string
                estado_obj = EstadoVehiculo.objects.get(models.Q(nombre__iexact=nuevo_estado) | models.Q(codigo__iexact=nuevo_estado))
        except EstadoVehiculo.DoesNotExist:
             return Response({'error': 'Estado no válido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vehiculo_id = request.data.get("vehiculo_id")
            vehiculo = Vehiculo.objects.get(id=vehiculo_id, transportista=request.user)
            # Update FK field
            vehiculo.estado = estado_obj
            vehiculo.save()
            return Response({'mensaje': f'Estado actualizado a {estado_obj.nombre}'}, status=status.HTTP_200_OK)
        except Vehiculo.DoesNotExist:
            return Response({'error': 'Vehículo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class MantenimientoTransportistaView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        vehiculos = Vehiculo.objects.filter(transportista=request.user)
        mantenimientos = Mantenimiento.objects.filter(vehiculo__in=vehiculos).order_by('-fecha_mantenimiento', '-id')
        serializer = MantenimientoSerializer(mantenimientos, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        vehiculo_id = request.data.get('vehiculo')
        try:
            vehiculo = Vehiculo.objects.get(id=vehiculo_id, transportista=request.user)
        except Vehiculo.DoesNotExist:
            return Response({'error': 'Vehículo no encontrado'}, status=404)
        except Vehiculo.MultipleObjectsReturned:
            return Response({'error': 'Múltiples vehículos encontrados, especifique uno'}, status=400)

        fecha = request.data.get('fecha_mantenimiento')
        km_ingresado = int(request.data.get('kilometraje_actual'))

        # Asumimos que viene el ID del tipo
        Mantenimiento.objects.create(
            vehiculo=vehiculo,
            tipo_id=request.data.get('tipo'), # Assuming payload key is 'tipo' with ID
            kilometraje_actual=km_ingresado,
            kilometraje_proximo=request.data.get('kilometraje_proximo'),
            observaciones=request.data.get('observaciones'),
            fecha_mantenimiento=fecha
        )

        if km_ingresado > vehiculo.kilometraje_actual:
            vehiculo.kilometraje_actual = km_ingresado
            vehiculo.save()

        return Response({'mensaje': 'Mantenimiento registrado exitosamente'})

class AlertasMantenimientoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        margen_alerta = 500
        alertas = []

        try:
            vehiculos = Vehiculo.objects.filter(transportista=request.user)
            
            if not vehiculos.exists():
                return Response({'error': 'No tiene vehículo asignado'}, status=status.HTTP_404_NOT_FOUND)

            for vehiculo in vehiculos:
                mantenimientos = Mantenimiento.objects.filter(vehiculo=vehiculo).order_by('-fecha_mantenimiento')
                
                tipos_vistos = set()
                
                for mantenimiento in mantenimientos:
                    tipo_id = mantenimiento.tipo_id
                    if tipo_id in tipos_vistos:
                        continue 
                    tipos_vistos.add(tipo_id)

                    km_restante = mantenimiento.kilometraje_proximo - vehiculo.kilometraje_actual

                    if km_restante <= margen_alerta:
                        tipo_mostrar = mantenimiento.tipo.nombre if mantenimiento.tipo else 'Mantenimiento'
                        mensaje = f"[{vehiculo.placa}] Próximo {tipo_mostrar} a los {mantenimiento.kilometraje_proximo} km. Quedan {km_restante} km."
                        alertas.append({'mensaje': mensaje})

            return Response(alertas, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ActualizarKilometrajeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        vehiculo_id = request.data.get('vehiculo_id')

        try:
            nuevo_km = int(request.data.get('kilometraje_actual'))
        except (TypeError, ValueError):
            return Response({'error': 'Kilometraje inválido'}, status=400)

        if vehiculo_id is None:
            return Response({'error': 'ID de vehículo faltante'}, status=400)

        try:
            vehiculo = Vehiculo.objects.get(id=vehiculo_id, transportista=request.user)
            vehiculo.kilometraje_actual = nuevo_km
            vehiculo.save()
            return Response({'mensaje': 'Kilometraje actualizado correctamente'})
        except Vehiculo.DoesNotExist:
            return Response({'error': 'Vehículo no encontrado'}, status=404)