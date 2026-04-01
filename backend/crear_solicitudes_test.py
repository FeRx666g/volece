import os
import django
import sys
import random
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_transporte.settings')
django.setup()

from django.contrib.auth import get_user_model
from servicios_transporte.models import SolicitudServicio, EstadoSolicitud, EstadoSistema

User = get_user_model()

def crear_solicitudes():
    print("Iniciando creación de solicitudes de prueba...")

    try:
        estado_pendiente = EstadoSolicitud.objects.get(id=1)
    except EstadoSolicitud.DoesNotExist:
        estado_pendiente, _ = EstadoSolicitud.objects.get_or_create(
            codigo='pendiente', defaults={'nombre': 'Pendiente'}
        )
    estado_sistema_activo, _ = EstadoSistema.objects.get_or_create(
        codigo='ACTIVO', defaults={'nombre': 'Activo'}
    )

    usuarios_test = User.objects.filter(email__startswith='usuariotest', email__endswith='@test.com')

    if not usuarios_test.exists():
        print("[ERROR] No se encontraron usuarios de prueba con el patrón usuariotestX@test.com")
        return

    print(f"Se encontraron {usuarios_test.count()} usuarios de prueba.")

    origenes = ['Quito', 'Guayaquil', 'Cuenca', 'Manta', 'Ambato']
    destinos = ['Loja', 'Ibarra', 'Riobamba', 'Esmeraldas', 'Machala']
    tipos_vehiculo = ['Camión', 'Volqueta', 'Trailer', 'Furgón']
    tipos_carga = ['Muebles', 'Electrodomésticos', 'Material de Construcción', 'Alimentos', 'Paquetería']

    solicitudes_creadas = 0

    for usuario in usuarios_test:
        print(f"Creando 5 solicitudes para: {usuario.email}")
        
        for i in range(5):
            dia = random.randint(1, 31)
            fecha_solicitud = date(2025, 12, dia)
            
            origen = random.choice(origenes)
            destino = random.choice(destinos)
            while origen == destino:
                destino = random.choice(destinos)

            carga_base = random.choice(tipos_carga)
            tonelaje = random.randint(1, 20)
            tipo_carga_str = f"{carga_base} - {tonelaje} Toneladas aprox."

            SolicitudServicio.objects.create(
                cliente=usuario,
                origen=origen,
                destino=destino,
                tipo_vehiculo=random.choice(tipos_vehiculo),
                tipo_carga=tipo_carga_str,
                fecha_solicitud=fecha_solicitud,
                estado=estado_pendiente,
                estado_sistema=estado_sistema_activo
            )
            solicitudes_creadas += 1

    print(f"\nResumen: {solicitudes_creadas} solicitudes creadas exitosamente para Diciembre 2025.")

if __name__ == '__main__':
    crear_solicitudes()
