# Etapa 1: Build de React
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Inyectamos la variable desde el .env y el compose al contexto de Node para React
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Esto construye tu app y genera la carpeta 'build' optimizada para producción
RUN npm run build


# Etapa 2: Servidor Nginx (muy ligero)
FROM nginx:alpine

# Copiamos la build generada de la etapa anterior a la carpeta de nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Configuración básica para aplicaciones React (SPA) para que funcionen las rutas (react-router)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
