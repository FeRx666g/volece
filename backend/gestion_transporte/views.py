from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from gestion_usuarios.models import Usuario
from gestion_usuarios.serializers import UsuarioSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_transportistas(request):
    transportistas = Usuario.objects.filter(rol='TRANSP')
    serializer = UsuarioSerializer(transportistas, many=True)
    return Response(serializer.data)
