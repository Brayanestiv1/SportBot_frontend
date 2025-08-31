# Usa una imagen base de Dev Containers de Microsoft para Node.js.
# Esta imagen ya incluye Git y otras herramientas esenciales.
FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Instala paquetes adicionales que necesites, como zip y unzip.
RUN apt-get update && apt-get install -y --no-install-recommends \
    zip \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copia los archivos de manifiesto de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código de la aplicación.
# Por defecto, Docker lo copiará en el directorio de trabajo del volumen.
COPY . .

# Comando por defecto para iniciar el servidor de desarrollo
CMD ["npm", "run", "dev"]