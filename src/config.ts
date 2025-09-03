// Configuración centralizada para el frontend
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SportBot Frontend',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Endpoints
  get USERS_ENDPOINT() {
    return `${this.API_BASE_URL}/api/${this.API_VERSION}/usuarios/`;
  },
  
  get ADMIN_CHATS_ENDPOINT() {
    return `${this.API_BASE_URL}/api/${this.API_VERSION}/admin/chats/`;
  },
  
  get CHAT_SUMMARY_ENDPOINT() {
    return `${this.API_BASE_URL}/api/${this.API_VERSION}/admin/chats`;
  }
};
