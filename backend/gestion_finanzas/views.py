from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication 
from django.db.models import Sum
from django.utils.timezone import now
from .models import Finanza, TipoFinanza, TarifaMensual
from .serializers import FinanzaSerializer, TipoFinanzaSerializer
from gestion_usuarios.permissions import IsAdminRol

class TipoFinanzaViewSet(viewsets.ModelViewSet):
    queryset = TipoFinanza.objects.all()
    serializer_class = TipoFinanzaSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsAdminRol]

class FinanzaViewSet(viewsets.ModelViewSet):
    queryset = Finanza.objects.all()
    serializer_class = FinanzaSerializer
    
    authentication_classes = [JWTAuthentication] 
    permission_classes = [permissions.IsAuthenticated, IsAdminRol] 

    def get_queryset(self):
        
        queryset = super().get_queryset()
        
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')
        tipo = self.request.query_params.get('tipo')

        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(fecha__range=[fecha_inicio, fecha_fin])
        
        if tipo:
            if tipo.isdigit():
                queryset = queryset.filter(tipo__id=tipo)
            else:
                queryset = queryset.filter(tipo__nombre=tipo)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class BalanceView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsAdminRol]

    def get(self, request):
        queryset = Finanza.objects.all()
        
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(fecha__range=[fecha_inicio, fecha_fin])

        total_ingresos = queryset.filter(tipo__nombre__in=['Ingreso', 'Mensualidad']).aggregate(Sum('monto'))['monto__sum'] or 0
        total_gastos = queryset.filter(tipo__nombre='Gasto').aggregate(Sum('monto'))['monto__sum'] or 0

        balance = total_ingresos - total_gastos

        return Response({
            "ingresos": total_ingresos,
            "gastos": total_gastos,
            "balance": balance
        })

class TarifaMensualView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsAdminRol]

    def get(self, request):
        tarifas = TarifaMensual.objects.all()[:2]
        actual = tarifas[0] if len(tarifas) > 0 else None
        anterior = tarifas[1] if len(tarifas) > 1 else None
        
        return Response({
            'actual': actual.monto if actual else 25.00,
            'fecha_modificacion': actual.fecha_implementacion if actual else None,
            'anterior': anterior.monto if anterior else 25.00
        })

    def post(self, request):
        monto = request.data.get('monto')
        if not monto:
            return Response({'error': 'Monto requerido'}, status=400)
        nueva = TarifaMensual.objects.create(monto=monto)
        return Response({'monto': nueva.monto})

class EstadoCuentaView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsAdminRol]

    def get(self, request):
        from gestion_transporte.models import Usuario
        from django.conf import settings
        from .utils import calcular_deuda_transportista
        
        transportistas = Usuario.objects.filter(rol__codigo='TRANSP', is_active=True)
        resultado = []
        for t in transportistas:
            datos = calcular_deuda_transportista(t)
            
            resultado.append({
                'id_socio': t.id,
                'nombre': f"{t.first_name} {t.last_name}",
                'cedula': t.cedula_ruc,
                'meses_adeudados': datos['meses_adeudados'],
                'deuda_total': datos['deuda_total'],
                'total_historico_pagado': datos['total_pagado']
            })
            
        return Response(resultado)