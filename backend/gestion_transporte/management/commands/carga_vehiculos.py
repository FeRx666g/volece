from django.core.management.base import BaseCommand
from gestion_vehiculos.models import Vehiculo
from gestion_usuarios.models import Usuario
import random
import string
import datetime

class Command(BaseCommand):
    help = 'Genera 50 vehículos sintéticos y los asigna a transportistas existentes'

    def handle(self, *args, **kwargs):
        # Obtener los transportistas existentes
        transportistas = Usuario.objects.filter(rol='TRANSP')

        if transportistas.count() == 0:
            self.stdout.write(self.style.ERROR("No hay transportistas en la base de datos."))
            return

        self.stdout.write(f"Creando 50 vehículos y asignándolos a transportistas...")

        # Función para generar una placa aleatoria
        def generar_placa():
            return ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))

        # Función para generar un número de motor aleatorio
        def generar_numero_motor():
            return ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

        # Función para generar un número de chasis aleatorio
        def generar_numero_chasis():
            return ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

        # Función para generar un estado aleatorio (ACTIVO o INACTIVO)
        def generar_estado():
            return random.choice(['ACTIVO', 'INACTIVO'])

        # Lista de marcas y modelos de vehículos
        marcas = ['Chevrolet', 'Hino', 'Toyota', 'Mercedes-Benz', 'Volvo', 'Mack']
        modelos = ['cyz 51L', 'GH', '700', 'Actros', 'FMX', 'Ranger']

        # Generar 50 vehículos
        vehiculos = []
        for i in range(1, 51):
            # Asignar un transportista aleatorio
            transportista = random.choice(transportistas)

            vehiculo = Vehiculo(
                tipo=random.choice(['VOLQUETA', 'CAMION', 'TRAILER']),
                marca=random.choice(marcas),
                modelo=random.choice(modelos),
                placa=generar_placa(),
                anio=random.randint(2010, 2022),
                color=random.choice(['Blanca', 'Amarilla', 'Roja', 'Azul', 'Verde', 'Negra']),
                tonelaje=round(random.uniform(5.0, 45.0), 2),
                combustible=random.choice(['DIESEL', 'GASOLINA']),
                numero_motor=generar_numero_motor(),
                numero_chasis=generar_numero_chasis(),
                fecha_adquisicion=str(datetime.date(2025, 6, 18)),  # Fijar una fecha
                observaciones=f"Vehículo de tipo {random.choice(['VOLQUETA', 'CAMION', 'TRAILER'])} color {random.choice(['Blanca', 'Amarilla', 'Roja'])}",
                estado=random.choice(['ACTIVO', 'INACTIVO']),
                fecha_registro=str(datetime.datetime.now()),  # Fecha y hora actual
                transportista_id=transportista.id,  # Asignar un transportista existente
                kilometraje_actual=random.randint(0, 100000)  # Kilometraje aleatorio
            )

            vehiculos.append(vehiculo)

        # Insertar los vehículos en la base de datos
        Vehiculo.objects.bulk_create(vehiculos)

        self.stdout.write(self.style.SUCCESS("50 vehículos generados y asignados a transportistas correctamente."))
