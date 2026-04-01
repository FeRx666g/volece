from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import SolicitudServicio, EstadoSolicitud

@receiver(post_save, sender=SolicitudServicio)
def sync_dataset_status(sender, instance, **kwargs):
    """
    Sincroniza el estado de la SolicitudServicio con el registro correspondiente en DatasetTurnosIA.
    """
    from gestion_transporte.models import DatasetTurnosIA  # Importación local para evitar ciclos

    if instance.estado_sistema and instance.estado_sistema.codigo == 'INACTIVO':
          DatasetTurnosIA.objects.filter(solicitud=instance).delete()
          return

    if instance.estado:
        # Mapear el código del estado de SolicitudServicio al campo estado_solicitud de DatasetTurnosIA
        # DatasetTurnosIA usa choices: 'pendiente', 'asignado', 'rechazado', 'completado'
        # Asumimos que los códigos de EstadoSolicitud coinciden o se normalizan a minúsculas.
        nuevo_estado = instance.estado.codigo.lower()
        
        # Actualizar todos los registros asociados (debería ser uno si es 1-1 lógico, pero filter cubre todo)
        DatasetTurnosIA.objects.filter(solicitud=instance).update(estado_solicitud=nuevo_estado)

@receiver(post_delete, sender=SolicitudServicio)
def delete_dataset_record(sender, instance, **kwargs):
    """
    Elimina registros en DatasetTurnosIA cuando se borra una SolicitudServicio.
    Aunque on_delete=CASCADE debería manejarlo, esto asegura limpieza explícita si hay lógica custom.
    """
    from gestion_transporte.models import DatasetTurnosIA
    DatasetTurnosIA.objects.filter(solicitud=instance).delete()
