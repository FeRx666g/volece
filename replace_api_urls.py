import os
import re

src_dir = r"c:\Users\ferx666g\Desktop\Todo\Archivos\volece-agente-ia-main\frontend-auth-backup\src"

def replace_urls(content):
    fallback = "http://127.0.0.1:8000"
    PLACEHOLDER = "___API_URL_PLACEHOLDER___"
    
    # Reemplazamos las comillas simples que tienen URL dentro por backticks (comillas de plantillas `)
    content = re.sub(r"'http://(?:127\.0\.0\.1|localhost):8000(.*?)'", rf"`{PLACEHOLDER}\1`", content)
    
    # Hacemos lo mismo para las comillas dobles
    content = re.sub(r'"http://(?:127\.0\.0\.1|localhost):8000(.*?)"', rf"`{PLACEHOLDER}\1`", content)
    
    # Finalmente, las que ya estaban dentro de backticks
    content = re.sub(r'http://(?:127\.0\.0\.1|localhost):8000', PLACEHOLDER, content)
    
    # Restauramos el placeholder con la inyección segura de variabes de entorno de React
    base_var = f"${{process.env.REACT_APP_API_URL || '{fallback}'}}"
    content = content.replace(PLACEHOLDER, base_var)
    
    return content

archivos_modificados = 0
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = replace_urls(content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Actualizado: {filepath}")
                    archivos_modificados += 1
            except Exception as e:
                print(f"Error procesando {filepath}: {e}")

print(f"\nFinalizado! Se han modificado {archivos_modificados} archivos adaptándolos al .env dinámicamente.")
