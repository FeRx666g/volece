from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings  
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/usuarios/', include('gestion_usuarios.urls')), 
    path('api/servicios/', include('servicios_transporte.urls')),  
    path('api/transporte/', include('gestion_transporte.api_urls')),   
    path('api/vehiculos/', include('gestion_vehiculos.urls')), 
    path('api/reportes/', include('reportes.urls')),
    path('api/finanzas/', include('gestion_finanzas.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)