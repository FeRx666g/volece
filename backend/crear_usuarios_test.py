import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_transporte.settings')
django.setup()

from gestion_usuarios.models import Usuario, Rol

def crear_usuarios():
    print("Iniciando creación de usuarios de prueba...")

    try:
        rol_cliente = Rol.objects.get(codigo='CLIENTE')
    except Rol.DoesNotExist:
        print("El rol 'CLIENTE' no existe. Creándolo...")
        rol_cliente = Rol.objects.create(
            codigo='CLIENTE', 
            nombre='Cliente', 
            descripcion='Rol para clientes finales'
        )

    password_comun = 'clavetest'

    creados = 0
    for i in range(1, 11):
        username = f'usuariotest{i}'
        email = f'usuariotest{i}@test.com'
        first_name = 'Usuario'
        last_name = f'Test{i}'
        cedula = f'10000000{i:02d}'
        
        if Usuario.objects.filter(email=email).exists():
            print(f"[SALTADO] El usuario {email} ya existe.")
            continue

        try:
            Usuario.objects.create_user(
                username=username,
                email=email,
                password=password_comun,
                first_name=first_name,
                last_name=last_name,
                cedula_ruc=cedula,
                rol=rol_cliente,
                telefono='0991234567'
            )
            print(f"[OK] Creado: {first_name} {last_name} ({email})")
            creados += 1
        except Exception as e:
            print(f"[ERROR] No se pudo crear {email}: {e}")

    print(f"\nResumen: {creados} usuarios nuevos creados.")

if __name__ == '__main__':
    crear_usuarios()
