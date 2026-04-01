from rest_framework import serializers
from .models import Vehiculo, Mantenimiento, TipoVehiculo, TipoCombustible, EstadoVehiculo, TipoMantenimiento
from gestion_usuarios.models import Usuario

class TipoVehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoVehiculo
        fields = '__all__'

class TipoCombustibleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCombustible
        fields = '__all__'

class EstadoVehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoVehiculo
        fields = '__all__'

class TransportistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name']

class VehiculoSerializer(serializers.ModelSerializer):
    transportista = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        write_only=True
    )

    transportista_detalle = TransportistaSerializer(source='transportista', read_only=True)
    # Using new related fields for display
    tipo_nombre = serializers.ReadOnlyField(source='tipo_vehiculo.nombre')
    
    combustible_nombre = serializers.ReadOnlyField(source='combustible.nombre')
    estado_nombre = serializers.ReadOnlyField(source='estado.nombre')

    class Meta:
        model = Vehiculo
        fields = '__all__'

class VehiculoTransportistaSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo_vehiculo.nombre')
    combustible_nombre = serializers.ReadOnlyField(source='combustible.nombre')
    estado_nombre = serializers.ReadOnlyField(source='estado.nombre')
    
    class Meta:
        model = Vehiculo
        fields = [
            'id', 'tipo_vehiculo', 'tipo_nombre', 'marca', 'modelo', 'placa', 'anio',
            'color', 'kilometraje_actual', 'tonelaje', 
            'combustible', 'combustible_nombre',
            'estado', 'estado_nombre',
            'foto',
        ]

class TipoMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoMantenimiento
        fields = '__all__'

class MantenimientoSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo.nombre')
    
    class Meta:
        model = Mantenimiento
        fields = ['id', 'vehiculo', 'tipo', 'tipo_nombre', 'kilometraje_actual', 'kilometraje_proximo', 'fecha_mantenimiento', 'observaciones']