from django.core.management.base import BaseCommand
from gestion_usuarios.models import Usuario
from gestion_vehiculos.models import Vehiculo
from servicios_transporte.models import SolicitudServicio
from gestion_transporte.models import DatasetTurnosIA
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Genera datos sintéticos para DatasetTurnosIA'

    # Función para generar fechas aleatorias dentro de un rango
    def generar_fecha_random(self):
        start_date = datetime(2025, 1, 1)
        end_date = datetime(2025, 12, 31)
        return start_date + (end_date - start_date) * random.random()

    # Función principal para crear los datos
    def handle(self, *args, **kwargs):
        # Obtener transportistas, vehículos y solicitudes
        transportistas = Usuario.objects.filter(rol='TRANSP')
        vehiculos = Vehiculo.objects.all()
        solicitudes = SolicitudServicio.objects.all()

        # Crear 100 registros sintéticos
        for _ in range(5000):
            transportista = random.choice(transportistas)
            vehiculo = random.choice(vehiculos)
            solicitud = random.choice(solicitudes)

            fecha_turno = self.generar_fecha_random()
            estado_vehiculo = random.choice(['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'])
            vehiculo_operativo = random.choice([True, False])
            estado_solicitud = random.choice(['pendiente', 'asignado', 'rechazado', 'completado'])

            # Crear e insertar el dato sintético en la base de datos
            DatasetTurnosIA.objects.create(
                transportista=transportista,
                vehiculo=vehiculo,
                solicitud=solicitud,
                fecha_turno=fecha_turno,
                estado_vehiculo=estado_vehiculo,
                vehiculo_operativo=vehiculo_operativo,
                estado_solicitud=estado_solicitud
            )

        self.stdout.write(self.style.SUCCESS('Datos sintéticos creados correctamente.'))
