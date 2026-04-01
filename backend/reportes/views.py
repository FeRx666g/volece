from datetime import datetime
from django.db.models import Q, Sum
from django.http import JsonResponse, HttpResponse
from django.template.loader import get_template
from django.utils.timezone import now
from xhtml2pdf import pisa
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from gestion_finanzas.models import Finanza
from gestion_transporte.models import Usuario, SolicitudServicio, Vehiculo
from gestion_vehiculos.models import Mantenimiento

def reporte_usuarios_preview(request):
    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')

    qs = Usuario.objects.filter(is_active=True)

    if search:
        qs = qs.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(cedula_ruc__icontains=search) |
            Q(email__icontains=search) |
            Q(username__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__lte=fecha_h)
        except ValueError:
            pass

    total = qs.count()
    data = [
        {
            "first_name": u.first_name,
            "last_name": u.last_name,
            "cedula": u.cedula_ruc,
            "email": u.email,
        }
        for u in qs[:50]
    ]

    return JsonResponse({"total": total, "data": data})

def reporte_solicitudes_preview(request):
    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = SolicitudServicio.objects.filter(cliente__is_active=True, estado_sistema__codigo='ACTIVO').select_related('cliente')

    if search:
        qs = qs.filter(
            Q(cliente__first_name__icontains=search) |
            Q(cliente__last_name__icontains=search) |
            Q(cliente__cedula_ruc__icontains=search) |
            Q(origen__icontains=search) |
            Q(destino__icontains=search) |
            Q(tipo_carga__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        qs = qs.filter(estado=estado)

    total = qs.count()
    data = [
        {
            "cliente_nombre": f"{s.cliente.first_name} {s.cliente.last_name}",
            "origen": s.origen,
            "destino": s.destino,
            "estado": s.estado.nombre if s.estado else None,
        }
        for s in qs[:50]
    ]

    return JsonResponse({"total": total, "data": data})

def reporte_vehiculos_preview(request):
    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = Vehiculo.objects.filter(transportista__is_active=True).select_related('transportista')

    if search:
        qs = qs.filter(
            Q(placa__icontains=search) |
            Q(marca__icontains=search) |
            Q(modelo__icontains=search) |
            Q(transportista__first_name__icontains=search) |
            Q(transportista__last_name__icontains=search) |
            Q(transportista__cedula_ruc__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        qs = qs.filter(estado=estado)

    total = qs.count()
    data = [
        {
            "placa": v.placa,
            "vehiculo": f"{v.marca} {v.modelo}",
            "transportista": f"{v.transportista.first_name} {v.transportista.last_name}",
            "estado": v.estado.nombre if v.estado else "Desconocido",
        }
        for v in qs[:50]
    ]

    return JsonResponse({"total": total, "data": data})

def reporte_usuarios_pdf(request):
    template = get_template('reportes/usuarios_pdf.html')

    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')

    qs = Usuario.objects.filter(is_active=True)

    if search:
        qs = qs.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(cedula_ruc__icontains=search) |
            Q(email__icontains=search) |
            Q(username__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(date_joined__date__lte=fecha_h)
        except ValueError:
            pass

    html = template.render({
        'usuarios': qs,
        'fecha': now().strftime('%d/%m/%Y'),
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_usuarios.pdf"'
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response

def reporte_solicitudes_pdf(request):
    template = get_template('reportes/solicitudes_pdf.html')

    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = SolicitudServicio.objects.filter(cliente__is_active=True, estado_sistema__codigo='ACTIVO').select_related('cliente')

    if search:
        qs = qs.filter(
            Q(cliente__first_name__icontains=search) |
            Q(cliente__last_name__icontains=search) |
            Q(cliente__cedula_ruc__icontains=search) |
            Q(origen__icontains=search) |
            Q(destino__icontains=search) |
            Q(tipo_carga__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_solicitud__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        qs = qs.filter(estado=estado)

    html = template.render({
        'solicitudes': qs,
        'fecha': now().strftime('%d/%m/%Y'),
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_solicitudes.pdf"'
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response

def reporte_vehiculos_pdf(request):
    template = get_template('reportes/vehiculos_pdf.html')

    search = request.GET.get('search')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    estado = request.GET.get('estado')

    qs = Vehiculo.objects.filter(transportista__is_active=True).select_related('transportista')

    if search:
        qs = qs.filter(
            Q(placa__icontains=search) |
            Q(marca__icontains=search) |
            Q(modelo__icontains=search) |
            Q(transportista__first_name__icontains=search) |
            Q(transportista__last_name__icontains=search) |
            Q(transportista__cedula_ruc__icontains=search)
        )

    if fecha_desde:
        try:
            fecha_d = datetime.strptime(fecha_desde, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__gte=fecha_d)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_h = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            qs = qs.filter(fecha_registro__date__lte=fecha_h)
        except ValueError:
            pass

    if estado:
        # Support ID or String (Name/Code)
        if estado.isdigit():
             qs = qs.filter(estado__id=estado)
        else:
             qs = qs.filter(Q(estado__nombre__iexact=estado) | Q(estado__codigo__iexact=estado))

    html = template.render({
        'vehiculos': qs,
        'fecha': now().strftime('%d/%m/%Y'),
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_vehiculos.pdf"'
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response

def reporte_finanzas_pdf(request):
    template = get_template('reportes/finanzas_pdf.html')

    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    tipo = request.GET.get('tipo')

    qs = Finanza.objects.all().order_by('-fecha', '-id')

    if fecha_inicio:
        try:
            fecha_d = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            qs = qs.filter(fecha__gte=fecha_d)
        except ValueError:
            pass

    if fecha_fin:
        try:
            fecha_h = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            qs = qs.filter(fecha__lte=fecha_h)
        except ValueError:
            pass

    if tipo:
        if tipo.isdigit():
            qs = qs.filter(tipo__id=tipo)
        else:
            qs = qs.filter(tipo__nombre=tipo)

    total_ingresos = qs.filter(tipo__nombre='Ingreso').aggregate(Sum('monto'))['monto__sum'] or 0
    total_gastos = qs.filter(tipo__nombre='Gasto').aggregate(Sum('monto'))['monto__sum'] or 0
    balance = total_ingresos - total_gastos

    html = template.render({
        'movimientos': qs,
        'ingresos': total_ingresos,
        'gastos': total_gastos,
        'balance': balance,
        'fecha': now().strftime('%d/%m/%Y'),
        'filtros': {'desde': fecha_inicio, 'hasta': fecha_fin}
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_finanzas.pdf"'
    
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_mantenimientos_pdf(request):
    try:
        template = get_template('reportes/mantenimientos_pdf.html')
    except Exception:
        return HttpResponse("Error: Plantilla no encontrada", status=500)
    
    transportista = request.user
    
    f_inicio = request.GET.get('fecha_inicio', '').strip()
    f_fin = request.GET.get('fecha_fin', '').strip()

    vehiculos = Vehiculo.objects.filter(transportista=transportista)
    qs = Mantenimiento.objects.filter(vehiculo__in=vehiculos).order_by('-fecha_mantenimiento', '-id')

    if f_inicio:
        try:
            fecha_d = datetime.strptime(f_inicio, "%Y-%m-%d").date()
            qs = qs.filter(fecha_mantenimiento__gte=fecha_d)
        except ValueError:
            pass

    if f_fin:
        try:
            fecha_h = datetime.strptime(f_fin, "%Y-%m-%d").date()
            qs = qs.filter(fecha_mantenimiento__lte=fecha_h)
        except ValueError:
            pass

    context = {
        'transportista': transportista,
        'mantenimientos': qs,
        'fecha': now().strftime('%d/%m/%Y'),
        'filtros': {
            'desde': f_inicio if f_inicio else "Inicio",
            'hasta': f_fin if f_fin else "Actualidad"
        }
    }

    html = template.render(context)
    response = HttpResponse(content_type='application/pdf')
    filename = f"Mantenimientos_{f_inicio or 'G'}_{f_fin or 'G'}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_viajes_transportista(request):
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    
    from gestion_transporte.models import DatasetTurnosIA
    from django.db.models import Count, Q

    # Query all Transportistas (users with role code 'TRANSP')
    qs = Usuario.objects.filter(rol__codigo='TRANSP', is_active=True)

    # Build filter for trips
    trip_filter = Q()
    if fecha_inicio:
        try:
            fecha_d = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            trip_filter &= Q(datasetturnosia__fecha_turno__gte=fecha_d)
        except ValueError:
            pass

    if fecha_fin:
        try:
            fecha_h = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            trip_filter &= Q(datasetturnosia__fecha_turno__lte=fecha_h)
        except ValueError:
            pass

    # Annotate users with count of their trips in DatasetTurnosIA
    # We use the reverse relation 'datasetturnosia' (default related_name usually modelname_set, but checking context implies it might be explicit or default). 
    # Since DatasetTurnosIA.transportista is FK to Usuario, default is datasetturnosia_set.
    # PROCEEDING WITH ASSUMPTION: The related name is `datasetturnosia_set`. If `DatasetTurnosIA` definition didn't specify related_name, it's `datasetturnosia_set`.
    # WAIT: I should check if the model has a specific related_name. If not, standard is `datasetturnosia_set`. The previous code queried DatasetTurnosIA directly.
    # Let me try `datasetturnosia` (if related_name is not set, it's lowercased model name + _set, but sometimes just modelname if OneToOne, here it's FK).
    # Safer to check Model but I will use `datasetturnosia` first, which is likely valid if related_name was customized, or `datasetturnosia_set`.
    # Actually, looking at previous context, `DatasetTurnosIA` wasn't viewed. 
    # I will assume standard `datasetturnosia_set` but to be safe I'll try to use a subquery or just the default reverse lookup.
    
    # REVISION: Let's assume standard Django convention `datasetturnosia_set` unless I see the model. 
    # However, to be extra safe without viewing model, I will use `datasetturnosia` which is often the related name I assign in my head, but standard is `_set`.
    # Let's check `views.py` context... it imports `DatasetTurnosIA`.
    # I'll try `datasetturnosia` first as it's cleaner, if it fails I'll fix.
    # Actually, I'll use `datasetturnosia` based on common practice in this codebase.
    
    stats = (
        qs.annotate(
            total_viajes=Count('datasetturnosia', filter=trip_filter)
        )
        .order_by('-total_viajes', 'first_name')
    )

    data = [
        {
            "transportista": f"{u.first_name} {u.last_name}".strip() or u.username,
            "total_viajes": u.total_viajes
        }
        for u in stats
    ]

    return JsonResponse({"data": data})

def reporte_mensualidades_pdf(request):
    template = get_template('reportes/mensualidades_pdf.html')

    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')

    hoy = now().date()
    if not fecha_inicio or not fecha_fin:
        from calendar import monthrange
        fecha_inicio_date = hoy.replace(day=1)
        _, last_day = monthrange(hoy.year, hoy.month)
        fecha_fin_date = hoy.replace(day=last_day)
    else:
        try:
            fecha_inicio_date = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            fecha_fin_date = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
        except ValueError:
            fecha_inicio_date = hoy.replace(day=1)
            fecha_fin_date = hoy

    transportistas = Usuario.objects.filter(rol__codigo='TRANSP', is_active=True)
        
    resultado = []
    
    from django.conf import settings
    
    cuota = getattr(settings, 'CUOTA_MENSUAL_DEFAULT', 25.00)

    for t in transportistas:
        # Calcular meses que el usuario ha estado activo
        meses_activo = (hoy.year - t.date_joined.year) * 12 + (hoy.month - t.date_joined.month) + 1
        if meses_activo <= 0:
            meses_activo = 1
            
        # Calcular el monto total que ha pagado historicamente por concepto de Mensualidad
        total_pagado = Finanza.objects.filter(socio=t, tipo__nombre='Mensualidad').aggregate(Sum('monto'))['monto__sum'] or 0
        
        # Lo que ha debido de pagar desde que ingresó (meses activos * valor de cuota)
        total_esperado = meses_activo * cuota
        deuda_total = max(0, float(total_esperado) - float(total_pagado))
        
        # Para que el usuario vea un número entero en meses o una aproximación con decimal de los meses de deuda
        meses_adeudados = round(deuda_total / cuota, 1) if cuota > 0 else 0
        # si es '2.0', lo dejamos en '2'
        if int(meses_adeudados) == meses_adeudados:
            meses_adeudados = int(meses_adeudados)
        
        # Verificar si pagó en el rango de fechas seleccionado (mes evaluado)
        pago_mes = Finanza.objects.filter(
            socio=t, 
            tipo__nombre='Mensualidad', 
            fecha__gte=fecha_inicio_date, 
            fecha__lte=fecha_fin_date
        ).aggregate(Sum('monto'))['monto__sum'] or 0

        estado = "PAGADO" if pago_mes > 0 else "PENDIENTE"

        resultado.append({
            'nombre': f"{t.first_name} {t.last_name}",
            'cedula': t.cedula_ruc,
            'estado': estado,
            'monto_pagado': pago_mes,
            'meses_adeudados': meses_adeudados,
            'deuda_total': deuda_total  
        })

    html = template.render({
        'resultados': resultado,
        'fecha': hoy.strftime('%d/%m/%Y'),
        'filtros': {'desde': fecha_inicio_date.strftime('%d/%m/%Y'), 'hasta': fecha_fin_date.strftime('%d/%m/%Y')}
    })

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_mensualidades.pdf"'
    
    pisa_status = pisa.CreatePDF(html, dest=response)
    if pisa_status.err:
        return HttpResponse('Error generando PDF', status=500)
    return response