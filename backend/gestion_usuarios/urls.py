from django.urls import path, include
from rest_framework import routers
from .views import RegistroUsuarioView, PerfilUsuarioView, RolViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import CrearUsuarioPrivadoView
from .views import ListarUsuariosView
from .views import EliminarUsuarioView
from .views import EditarUsuarioView
from .views import SolicitarRecuperacionPasswordView
from .views import RestablecerPasswordView
from .views import RestablecerPasswordView
from .views import ListaTransportistas, CambiarPasswordView

router = routers.DefaultRouter()
router.register(r'roles', RolViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil_usuario'),
    path('crear-transportista/', CrearUsuarioPrivadoView.as_view(), name='crear_transportista'),
    path('listar/', ListarUsuariosView.as_view(), name='listar_usuarios'),
    path('eliminar/<int:pk>/', EliminarUsuarioView.as_view(), name='eliminar_usuario'), 
    path('editar/<int:pk>/', EditarUsuarioView.as_view(), name='editar-usuario'),
    path('recuperar-password/', SolicitarRecuperacionPasswordView.as_view(), name='recuperar_password'),
    path('restablecer-password/', RestablecerPasswordView.as_view(), name='restablecer-password'),
    path('transportistas/', ListaTransportistas.as_view(), name='lista_transportistas'),
    path('cambiar-password/', CambiarPasswordView.as_view(), name='cambiar_password'),
]
