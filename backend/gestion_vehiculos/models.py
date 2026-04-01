from django.db import models
from django.conf import settings
from django.utils import timezone

class TipoVehiculo(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class TipoCombustible(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class EstadoVehiculo(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    codigo = models.CharField(max_length=20, unique=True, null=True, help_text="Codigo interno: ACTIVO, INACTIVO, MANTENIMIENTO")
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Vehiculo(models.Model):
    transportista = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        limit_choices_to={'groups__name': 'Transportista'},
        null=True, blank=True
    )
    
    foto = models.ImageField(upload_to='vehiculos/', null=True, blank=True)
    
    tipo_vehiculo = models.ForeignKey(TipoVehiculo, on_delete=models.PROTECT, null=True, blank=True, related_name='vehiculos')
    
    marca = models.CharField(max_length=100)

    modelo = models.CharField(max_length=100, null=True, blank=True)
    placa = models.CharField(max_length=10, unique=True)
    anio = models.IntegerField(null=True, blank=True)
    color = models.CharField(max_length=50, null=True, blank=True)
    tonelaje = models.DecimalField(max_digits=5, decimal_places=2)
    
    combustible = models.ForeignKey(TipoCombustible, on_delete=models.PROTECT, null=True, blank=True)

    numero_motor = models.CharField(max_length=50, blank=True, null=True)
    numero_chasis = models.CharField(max_length=50, blank=True, null=True)
    fecha_adquisicion = models.DateField(null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    
    estado = models.ForeignKey(EstadoVehiculo, on_delete=models.PROTECT, null=True, blank=True)

    kilometraje_actual = models.PositiveIntegerField(default=0)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.placa} - {self.marca} {self.modelo}"


class TipoMantenimiento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Mantenimiento(models.Model):
    vehiculo = models.ForeignKey('Vehiculo', on_delete=models.CASCADE, related_name='mantenimientos')
    
    tipo = models.ForeignKey(TipoMantenimiento, on_delete=models.PROTECT, related_name='mantenimientos', null=True, blank=True)

    kilometraje_actual = models.PositiveIntegerField()
    kilometraje_proximo = models.PositiveIntegerField(default=0)
    fecha_mantenimiento = models.DateField(default=timezone.now)
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.vehiculo.placa} - {self.tipo.nombre if self.tipo else 'Sin Tipo'} ({self.fecha_mantenimiento})"
