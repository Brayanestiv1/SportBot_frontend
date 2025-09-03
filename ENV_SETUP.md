# 🚀 Configuración de Variables de Entorno

## 📋 **Variables Disponibles**

### **API Configuration**
- `VITE_API_BASE_URL`: URL base de la API (default: `http://localhost:8000`)
- `VITE_API_VERSION`: Versión de la API (default: `v1`)

### **App Configuration**
- `VITE_APP_NAME`: Nombre de la aplicación (default: `SportBot Frontend`)
- `VITE_APP_VERSION`: Versión de la aplicación (default: `1.0.0`)

## 🔧 **Configuración**

### **1. Crear archivo `.env`**
```bash
# En la raíz del proyecto
cp .env.example .env
```

### **2. Editar `.env`**
```env
# Desarrollo local
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1

# Producción
# VITE_API_BASE_URL=https://api.tudominio.com
# VITE_API_VERSION=v1
```

### **3. Reiniciar el servidor**
```bash
npm run dev
```

## 🌍 **Entornos**

### **Desarrollo Local**
```env
VITE_API_BASE_URL=http://localhost:8000
```

### **Staging**
```env
VITE_API_BASE_URL=https://staging-api.tudominio.com
```

### **Producción**
```env
VITE_API_BASE_URL=https://api.tudominio.com
```

## ⚠️ **Importante**

- **Solo variables que empiecen con `VITE_`** son accesibles en el frontend
- **Reiniciar el servidor** después de cambiar `.env`
- **No committear** el archivo `.env` (ya está en `.gitignore`)
- **Usar `.env.example`** como plantilla para el equipo

## 🔍 **Uso en el Código**

```typescript
import { config } from './config';

// Usar endpoints
const response = await fetch(config.USERS_ENDPOINT);
const response = await fetch(config.ADMIN_CHATS_ENDPOINT);
const response = await fetch(`${config.CHAT_SUMMARY_ENDPOINT}/${chatId}/summary`);

// Usar configuración
console.log(config.APP_NAME, config.APP_VERSION);
```
