from rest_framework import serializers
from .models import SolicitudServicio, PrediccionIA, EstadoSolicitud, EstadoSistema
from gestion_transporte.models import DatasetTurnosIA
from gestion_vehiculos.models import Vehiculo

class EstadoSolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoSolicitud
        fields = '__all__'

class SolicitudServicioSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.SerializerMethodField()
    transportista_asignado_id = serializers.SerializerMethodField()
    transportista_asignado_nombre = serializers.SerializerMethodField()
    vehiculo_asignado_placa = serializers.SerializerMethodField()
    comentario_ia_asignado = serializers.SerializerMethodField()
    prediccion_data = serializers.SerializerMethodField()
    estado = serializers.SlugRelatedField(slug_field='codigo', queryset=EstadoSolicitud.objects.all(), required=False)
    estado_nombre = serializers.ReadOnlyField(source='estado.nombre')
    estado_sistema = serializers.SlugRelatedField(slug_field='codigo', queryset=EstadoSistema.objects.all(), required=False)

    class Meta:
        model = SolicitudServicio
        fields = [
            'id',
            'cliente',
            'origen',
            'destino',
            'tipo_vehiculo',
            'tipo_carga',
            'fecha_solicitud',
            'estado',
            'estado_nombre',
            'estado_sistema',
            'cliente_nombre',
            'transportista_asignado_id',
            'transportista_asignado_nombre',
            'vehiculo_asignado_placa',
            'comentario_ia_asignado',
            'prediccion_data',
        ]
        read_only_fields = ('cliente',)

    def get_cliente_nombre(self, obj):
        if obj.cliente:
            return f"{obj.cliente.first_name} {obj.cliente.last_name}"
        return "Cliente Desconocido"

    def _get_turno(self, obj):
        return DatasetTurnosIA.objects.filter(solicitud=obj).first()

    def get_transportista_asignado_id(self, obj):
        turno = self._get_turno(obj)
        return turno.transportista_id if turno else None

    def get_transportista_asignado_nombre(self, obj):
        turno = self._get_turno(obj)
        if turno and turno.transportista:
            return f"{turno.transportista.first_name} {turno.transportista.last_name}"
        return None

    def get_vehiculo_asignado_placa(self, obj):
        turno = self._get_turno(obj)
        if turno and turno.vehiculo:
            return f"{turno.vehiculo.placa} ({turno.vehiculo.modelo})"
        return None

    def get_comentario_ia_asignado(self, obj):
        turno = self._get_turno(obj)
        return turno.comentario_ia if turno else None

    def get_prediccion_data(self, obj):
        try:
            return obj.prediccion_ia.datos
        except Exception:
            return None

class VehiculoSimpleSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo_vehiculo.nombre')
    
    class Meta:
        model = Vehiculo
        fields = ['id', 'placa', 'marca', 'modelo', 'tipo_nombre', 'foto']

class DatasetTurnosIASerializer(serializers.ModelSerializer):
    solicitud_data = SolicitudServicioSerializer(source='solicitud', read_only=True)
    vehiculo_data = VehiculoSimpleSerializer(source='vehiculo', read_only=True)

    class Meta:
        model = DatasetTurnosIA
        fields = '__all__'