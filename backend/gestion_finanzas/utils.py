from django.utils.timezone import now
from django.db.models import Sum
from datetime import timedelta, date
from calendar import monthrange
from .models import Finanza, TarifaMensual
from django.conf import settings

def obtener_tarifa_en_fecha(tarifas, fecha_referencia):
    # Buscamos la primera tarifa que haya sido creada ANTES o EN la fecha de referencia
    # Si no hay match (ej. el sistema recién empieza y no había tarifa), se agarra la más antigua o la default
    tarifa_aplicable = 25.00
    for t in tarifas:
        # tarifas debe estar ordenada descendente (la más reciente primero)
        if t.fecha_implementacion.date() <= fecha_referencia:
            tarifa_aplicable = float(t.monto)
            break
    # Si ninguna es anterior a la fecha, usamos la más vieja (la última en el array)
    if not tarifas:
        return float(getattr(settings, 'CUOTA_MENSUAL_DEFAULT', 25.00))
    elif tarifa_aplicable == 25.00 and len(tarifas) > 0 and tarifas[-1].fecha_implementacion.date() > fecha_referencia:
        tarifa_aplicable = float(tarifas[-1].monto)
        
    return tarifa_aplicable

def calcular_deuda_transportista(transportista):
    """
    Calcula la deuda de un transportista de manera precisa, respetando el historial de tarifas vigentes.
    Para cada mes que el usuario ha estado activo, evalúa el costo de la mensualidad dependiendo de si pagó o no,
    y congela el costo histórico para evitar que una subida de tarifa altere las deudas pasadas.
    Retorna un diccionario: {'deuda_total', 'meses_adeudados', 'total_esperado', 'total_pagado'}
    """
    hoy = now().date()
    fecha_iter = transportista.date_joined.date().replace(day=1)
    
    # Obtenemos todas las tarifas de la más reciente a la más vieja
    tarifas = list(TarifaMensual.objects.all().order_by('-fecha_implementacion'))
    
    total_esperado = 0.0
    meses_historial = [] # Guardaremos el monto que cobró cada mes de su historia
    
    while True:
        mes_anio = (fecha_iter.year, fecha_iter.month)
        
        pagos_del_mes = Finanza.objects.filter(
            socio=transportista,
            tipo__nombre='Mensualidad',
            fecha__year=mes_anio[0],
            fecha__month=mes_anio[1]
        ).order_by('fecha')
        
        if pagos_del_mes.exists():
            fecha_primer_pago = pagos_del_mes.first().fecha
            tarifa_mes = obtener_tarifa_en_fecha(tarifas, fecha_primer_pago)
        else:
            if mes_anio == (hoy.year, hoy.month):
                tarifa_mes = obtener_tarifa_en_fecha(tarifas, hoy)
            else:
                _, last_day = monthrange(mes_anio[0], mes_anio[1])
                fecha_fin_mes = date(mes_anio[0], mes_anio[1], last_day)
                tarifa_mes = obtener_tarifa_en_fecha(tarifas, fecha_fin_mes)
                
        total_esperado += tarifa_mes
        meses_historial.append(tarifa_mes)
        
        if mes_anio == (hoy.year, hoy.month):
            break
            
        fecha_iter = (fecha_iter + timedelta(days=32)).replace(day=1)
        
    # Saldo total basado en sumatorias puras
    total_pagado = float(Finanza.objects.filter(socio=transportista, tipo__nombre='Mensualidad').aggregate(Sum('monto'))['monto__sum'] or 0)
    saldo = total_esperado - total_pagado
    
    # Calcular MESES EXACTOS ADEUDADOS matando las deudas más antiguas con el total_pagado
    pago_simulado = total_pagado
    meses_adeudados_completos = 0
    fraccion_mes = 0.0
    
    for costo_mes in meses_historial:
        if pago_simulado >= costo_mes:
            pago_simulado -= costo_mes # Mes saldado
        elif pago_simulado > 0:
            pago_simulado = 0 # Agotó su dinero en un mes a medias
            meses_adeudados_completos += 1
        else:
            meses_adeudados_completos += 1 # Ya no tiene dinero, mes entero impago

    cuota_actual = obtener_tarifa_en_fecha(tarifas, hoy)
        
    return {
        'deuda_total': round(saldo, 2),
        'meses_adeudados': meses_adeudados_completos,
        'total_esperado': total_esperado,
        'total_pagado': total_pagado,
        'cuota_actual': cuota_actual
    }

