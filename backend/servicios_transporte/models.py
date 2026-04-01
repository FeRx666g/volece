from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class EstadoSolicitud(models.Model):
    nombre = models.CharField(max_length=50)
    codigo = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class EstadoSistema(models.Model):
    nombre = models.CharField(max_length=50)
    codigo = models.CharField(max_length=50, unique=True) 

    def __str__(self):
        return self.nombre

class SolicitudServicio(models.Model):
    cliente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitudes')
    origen = models.CharField(max_length=256)
    destino = models.CharField(max_length=255)
    tipo_vehiculo = models.CharField(max_length=100, null=True, blank=True)

    tipo_carga = models.CharField(max_length=1000)
    fecha_solicitud = models.DateField()
    estado = models.ForeignKey(EstadoSolicitud, on_delete=models.SET_NULL, null=True, blank=True, related_name='solicitudes')
    estado_sistema = models.ForeignKey(EstadoSistema, on_delete=models.SET_NULL, null=True, blank=True, related_name='solicitudes')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.origen} -> {self.destino} ({self.estado.nombre if self.estado else 'Sin Estado'})"

class PrediccionIA(models.Model):
    solicitud = models.OneToOneField(SolicitudServicio, on_delete=models.CASCADE, related_name='prediccion_ia')
    datos = models.JSONField(null=True, blank=True) 
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Predicción para Solicitud #{self.solicitud.id}"