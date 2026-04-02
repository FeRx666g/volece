from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinanzaViewSet, BalanceView, TipoFinanzaViewSet, TarifaMensualView, EstadoCuentaView

router = DefaultRouter()
router.register(r'movimientos', FinanzaViewSet)
router.register(r'tipos', TipoFinanzaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('balance/', BalanceView.as_view(), name='balance-financiero'),
    path('tarifa/', TarifaMensualView.as_view(), name='tarifa-mensual'),
    path('estado_cuenta/', EstadoCuentaView.as_view(), name='estado-cuenta'),
]