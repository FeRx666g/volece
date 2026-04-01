from django.db import models
from gestion_usuarios.models import Usuario
from gestion_vehiculos.models import Vehiculo
from servicios_transporte.models import SolicitudServicio

class DatasetTurnosIA(models.Model):
    transportista = models.ForeignKey(Usuario, on_delete=models.CASCADE, limit_choices_to={'rol__codigo': 'TRANSP'})
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    solicitud = models.ForeignKey(SolicitudServicio, on_delete=models.CASCADE)
    fecha_turno = models.DateField()
    
    estado_vehiculo = models.CharField(max_length=20, choices=[
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('mantenimiento', 'Mantenimiento')
    ])
    
    vehiculo_operativo = models.BooleanField()
    
    estado_solicitud = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('asignado', 'Asignado'),
        ('rechazado', 'Rechazado'),
        ('completado', 'Completado')
    ])

    comentario_ia = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Turno para {self.transportista} con vehículo {self.vehiculo} el {self.fecha_turno}"