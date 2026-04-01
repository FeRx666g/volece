from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model

from .models import Rol, Usuario

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message='Este correo electrónico ya está registrado.')]
    )
    cedula_ruc = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message='Esta Cédula/RUC ya está registrada.')]
    )
    rol = serializers.SlugRelatedField(
        slug_field='codigo',
        queryset=Rol.objects.all(),
        required=False
    )

    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'rol',
            'cedula_ruc',
            'telefono', 
            'password',
            'date_joined',
            'is_active'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        rol_recibido = validated_data.get('rol', None)

        request = self.context.get('request')
        is_admin = False
        if request and request.user.is_authenticated and request.user.rol:
            is_admin = request.user.rol.codigo == 'ADMIN'

        if is_admin and rol_recibido:
             rol_final = rol_recibido
        else:
             rol_final = Rol.objects.get(codigo='CLIENTE')

        if 'rol' in validated_data:
             validated_data.pop('rol')

        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        
        user.rol = rol_final
        user.save()
        return user
    
class UsuarioEdicionAdminSerializer(serializers.ModelSerializer):
    rol = serializers.SlugRelatedField(
        slug_field='codigo',
        queryset=Rol.objects.all()
    )
    class Meta:
        model = Usuario
        fields = ['username', 'first_name', 'last_name', 'email', 'rol', 'cedula_ruc', 'telefono']