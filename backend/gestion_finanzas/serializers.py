from rest_framework import serializers
from .models import Finanza, TipoFinanza

class TipoFinanzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoFinanza
        fields = '__all__'

class FinanzaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    tipo_nombre = serializers.ReadOnlyField(source='tipo.nombre')
    tipo_detalle = TipoFinanzaSerializer(source='tipo', read_only=True)
    socio_nombre = serializers.SerializerMethodField()
    meses_adeudados = serializers.SerializerMethodField()
    deuda_total = serializers.SerializerMethodField()

    class Meta:
        model = Finanza
        fields = ['id', 'usuario', 'usuario_nombre', 'tipo', 'tipo_nombre', 'tipo_detalle', 'monto', 'fecha', 'descripcion', 'created_at', 'socio', 'socio_nombre', 'meses_adeudados', 'deuda_total']

    def get_socio_nombre(self, obj):
        if obj.socio:
            return f"{obj.socio.first_name} {obj.socio.last_name}"
        return None

    def _get_deuda_info(self, obj):
        from .utils import calcular_deuda_transportista
        t = obj.socio
        if not t:
            return {'deuda': 0, 'meses': 0}
            
        datos = calcular_deuda_transportista(t)
        return {'deuda': datos['deuda_total'], 'meses': datos['meses_adeudados']}

    def get_meses_adeudados(self, obj):
        return self._get_deuda_info(obj)['meses']
        
    def get_deuda_total(self, obj):
        return self._get_deuda_info(obj)['deuda']