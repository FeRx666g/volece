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
        if not obj.socio or obj.tipo.nombre != 'Mensualidad':
            return {'deuda': 0, 'meses': 0}
        
        from django.utils.timezone import now
        from django.db.models import Sum
        from .models import TarifaMensual
        
        hoy = now().date()
        t = obj.socio
        meses_activo = (hoy.year - t.date_joined.year) * 12 + (hoy.month - t.date_joined.month) + 1
        if meses_activo <= 0:
            meses_activo = 1
            
        tarifas = TarifaMensual.objects.all()[:1]
        cuota = tarifas[0].monto if len(tarifas) > 0 else 25.00
        
        total_pagado = Finanza.objects.filter(socio=t, tipo__nombre='Mensualidad').aggregate(Sum('monto'))['monto__sum'] or 0
        total_esperado = float(meses_activo) * float(cuota)
        deuda = max(0.0, total_esperado - float(total_pagado))
        meses = deuda / float(cuota) if float(cuota) > 0 else 0
        
        # Redondeo para mostrar enteros si es exacto
        if int(meses) == meses:
            meses = int(meses)
        else:
            meses = round(meses, 1)
            
        return {'deuda': round(deuda, 2), 'meses': meses}

    def get_meses_adeudados(self, obj):
        return self._get_deuda_info(obj)['meses']
        
    def get_deuda_total(self, obj):
        return self._get_deuda_info(obj)['deuda']