from rest_framework import generics, viewsets
from .models import Usuario, Rol
from .serializers import UsuarioSerializer, RolSerializer
from gestion_usuarios.serializers import UsuarioEdicionAdminSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.generics import ListAPIView
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from rest_framework.permissions import AllowAny
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User

class RolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]

class RegistroUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]  

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    
class CrearUsuarioPrivadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.rol or request.user.rol.codigo != 'ADMIN':
            return Response({'detail': 'No autorizado. Solo administradores pueden crear usuarios.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = UsuarioSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({'detail': 'Usuario creado exitosamente.'}, status=status.HTTP_201_CREATED)
    
    
class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        usuario = request.user
        serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CambiarPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'Todos los campos son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'error': 'La contraseña actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validación básica de longitud (puedes ampliarla)
        if len(new_password) < 6:
            return Response({'error': 'La nueva contraseña debe tener al menos 6 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)

class ListarUsuariosView(ListAPIView):
    queryset = Usuario.objects.filter(is_active=True).order_by('-id')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    

class EliminarUsuarioView(generics.DestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class EditarUsuarioView(generics.UpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioEdicionAdminSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.get_queryset().get(id=self.kwargs["pk"])

    def update(self, request, *args, **kwargs):
        if not request.user.rol or request.user.rol.codigo != 'ADMIN':
            return Response({'detail': 'No autorizado. Solo administradores pueden editar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)


 


class SolicitarRecuperacionPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'El correo electrónico es obligatorio'}, status=400)

        Usuario = get_user_model()
        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'No se encontró un usuario con ese correo'}, status=404)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        url_recuperacion = f"http://localhost:3000/restablecer-password/{uid}/{token}"


        send_mail(
            subject='Recuperación de contraseña - VOLECE.CA',
            message=f'Hola {user.first_name},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n\n{url_recuperacion}',
            from_email=None,  
            recipient_list=[user.email],
        )

        return Response({'message': 'Se ha enviado un correo para restablecer tu contraseña.'}, status=200)



class RestablecerPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')

        if not uid or not token or not password:
            return Response({'error': 'Datos incompletos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid_decoded = urlsafe_base64_decode(uid).decode()
            user = get_user_model().objects.get(pk=uid_decoded)
        except Exception:
            return Response({'error': 'Usuario inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({'message': 'Contraseña restablecida correctamente.'}, status=status.HTTP_200_OK)

class ListaTransportistas(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        Usuario = get_user_model()
        transportistas = Usuario.objects.filter(rol__codigo='TRANSP', is_active=True)
        data = [
            {
                'id': user.id,
                'nombre': user.first_name,
                'apellido': user.last_name,
            }
            for user in transportistas
        ]
        return Response(data)

