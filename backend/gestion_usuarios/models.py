from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import BaseUserManager

class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email, password=None, first_name=None, last_name=None, cedula_ruc=None, rol='CLIENTE', telefono= None, **extra_fields):
        if not email:
            raise ValueError('El usuario debe tener un email')
        email = self.normalize_email(email)
        
        if isinstance(rol, str):
            from .models import Rol
            rol = Rol.objects.get(codigo=rol)

        user = self.model(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            cedula_ruc=cedula_ruc,
            rol=rol,
            telefono=telefono,  
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, first_name=None, last_name=None, cedula_ruc=None, telefono= None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            cedula_ruc=cedula_ruc,
            rol='ADMIN',
            telefono=telefono,
            
            **extra_fields
        )

class Rol(models.Model):
    codigo = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Usuario(AbstractUser):
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True, related_name='usuarios')
    cedula_ruc = models.CharField(max_length=12, unique=True)
    telefono = models.CharField(max_length=10, blank=True, null=False)
    email = models.EmailField(unique=True) 

    objects = UsuarioManager()

    REQUIRED_FIELDS = ['first_name', 'last_name', 'cedula_ruc', 'email', 'telefono']

    def __str__(self):
        rol_name = self.rol.nombre if self.rol else 'Sin Rol'
        return f"{self.first_name} {self.last_name} ({rol_name})"
