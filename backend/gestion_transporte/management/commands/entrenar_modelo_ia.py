import joblib
import pandas as pd
from django.core.management.base import BaseCommand
from gestion_transporte.models import DatasetTurnosIA
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report  # Asegúrate de importar classification_report
import numpy as np
import os

class Command(BaseCommand):
    help = 'Entrena un modelo IA para predecir asignación de turnos usando DatasetTurnosIA'

    def handle(self, *args, **options):
        self.stdout.write("Cargando datos desde la base de datos...")

        # Obtener los datos de la base de datos
        datos = DatasetTurnosIA.objects.all().values(
            'fecha_turno', 'estado_vehiculo', 'vehiculo_operativo', 'estado_solicitud', 'transportista'
        )
        
        # Convertir a DataFrame de pandas
        df = pd.DataFrame(list(datos))

        if df.empty:
            self.stdout.write(self.style.ERROR("No hay datos en DatasetTurnosIA."))
            return

        self.stdout.write("Preprocesando datos...")

        # Convertir las fechas a valores numéricos (por ejemplo, días desde una fecha base)
        df['fecha_turno'] = pd.to_datetime(df['fecha_turno'])
        base_date = df['fecha_turno'].min()  # Fecha más temprana en el dataset
        df['dias_desde_turno'] = (df['fecha_turno'] - base_date).dt.days

        # Codificar las columnas categóricas, como 'estado_vehiculo' y 'estado_solicitud'
        df_encoded = pd.get_dummies(df, columns=['estado_vehiculo', 'estado_solicitud'])

        # Obtener todos los transportistas únicos en el dataset
        transportistas_unicos = df['transportista'].unique()

        # Crear columnas para cada transportista y asignar 1 si el transportista está asignado, 0 si no
        for t in transportistas_unicos:
            df_encoded[f'transportista_{t}'] = (df_encoded['transportista'] == t).astype(int)

        # Verificar las columnas generadas
        self.stdout.write("Columnas generadas:")
        self.stdout.write(str(df_encoded.columns))  # Verifica las columnas generadas

        # Las características X (el resto de las columnas menos 'transportista' y 'fecha_turno')
        X = df_encoded.drop(columns=['transportista', 'fecha_turno'])

        # Las etiquetas y (columnas para cada transportista)
        y = df_encoded[[f'transportista_{t}' for t in transportistas_unicos]]  # Seleccionamos las columnas de transportistas

        # Dividir en conjuntos de entrenamiento y prueba
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.stdout.write("Entrenando modelo RandomForest...")
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Evaluar el modelo
        self.stdout.write("Evaluando modelo...")
        y_pred = model.predict(X_test)

        # Reporte de clasificación para cada transportista
        report = classification_report(y_test, y_pred)  # Usamos classification_report aquí
        self.stdout.write("Reporte de clasificación:")
        self.stdout.write(report)

        # Guardar el modelo entrenado
        output_path = os.path.join("modelo_turnos.pkl")
        joblib.dump(model, output_path)

        self.stdout.write(self.style.SUCCESS(f"Modelo entrenado y guardado como {output_path}"))

        # Predicción: Obtener los 3 transportistas más adecuados para cada solicitud que necesita un turno
        self.stdout.write("Obteniendo los 3 transportistas más adecuados para las solicitudes pendientes...")

        # Obtener todas las solicitudes pendientes (que aún no tienen un turno asignado)
        solicitudes_pendientes = DatasetTurnosIA.objects.filter(estado_solicitud='pendiente')

        # Para cada solicitud, predecir los 3 transportistas más adecuados
        for solicitud in solicitudes_pendientes:
            self.stdout.write(f"Obteniendo transportistas para la solicitud con ID {solicitud.solicitud_id}...")

            # Preprocesar los datos de la solicitud
            turno_data = pd.DataFrame([{
                'estado_vehiculo': solicitud.estado_vehiculo,
                'vehiculo_operativo': solicitud.vehiculo_operativo,
                # Convertir ambas fechas a pandas Timestamp antes de restarlas
                'dias_desde_turno': (pd.to_datetime(solicitud.fecha_turno) - pd.to_datetime(base_date)).days,  # Aseguramos que ambas sean Timestamp
                'estado_solicitud': solicitud.estado_solicitud,  # Asegúrate que 'estado_solicitud' esté en el DataFrame
                # Asegúrate de que las columnas codificadas estén bien formateadas
            }])

            # Codificar las columnas categóricas para el turno
            turno_data_encoded = pd.get_dummies(turno_data, columns=['estado_vehiculo', 'estado_solicitud'])

            # Asegúrate de que el formato del turno codificado coincida con el entrenamiento
            turno_data_encoded = turno_data_encoded.reindex(columns=X.columns, fill_value=0)

            # Predecir la asignación de los 3 transportistas más adecuados
            predicciones = model.predict(turno_data_encoded)

            # Verificar si las predicciones son vacías (ningún transportista adecuado)
            transportistas_adecuados = []
            for idx, pred in enumerate(predicciones[0]):
                if pred == 1:  # El transportista es adecuado para este turno
                    transportistas_adecuados.append(transportistas_unicos[idx])

            # Si no se encuentran transportistas adecuados, no continuar con la predicción
            if transportistas_adecuados:
                self.stdout.write(f"Los 3 transportistas más adecuados para la solicitud ID {solicitud.solicitud_id} son:")
                self.stdout.write(str(transportistas_adecuados[:3]))  # Mostrar los primeros 3 transportistas
            else:
                self.stdout.write(f"No se encontraron transportistas adecuados para la solicitud ID {solicitud.solicitud_id}.")
