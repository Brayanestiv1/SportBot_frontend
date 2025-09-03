
import './App.css'
import './index.css'
import React, { useState, useEffect } from "react";

// Definir tipos TypeScript basados en los endpoints reales del backend
interface User {
  id: number;
  nombre?: string; // Campo que puede venir del backend
  name?: string;   // Campo alternativo
  // Otros campos que pueda tener el usuario
}

interface ChatSummary {
  id: number;
  chatid: string;
  ultinoMensaje: string;
  totalMensajes: number;
  ussariold: number;
  fechaCreacion: string;
  fechaActualizcion: string;
}

interface ChatMessage {
  id: number;
  message: string;
  timestamp: string;
  isUser: boolean;
  // Otros campos que pueda tener el mensaje
}

interface ChatHistory {
  [key: number]: ChatMessage[];
}

const App: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/usuarios/');
      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar la lista de usuarios');
    }
  };

  // Función para obtener todos los chats (admin)
  const fetchAllChats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/chats/');
      if (!response.ok) {
        throw new Error(`Error al obtener chats: ${response.status}`);
      }
      const data = await response.json();
      setChatSummaries(data);
    } catch (err) {
      console.error('Error fetching all chats:', err);
      setError('Error al cargar los chats');
    }
  };

  // Función para obtener el historial de chat de un usuario específico
  const fetchUserChatHistory = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/chats/usuario/${userId}`);
      if (!response.ok) {
        throw new Error(`Error al obtener chat del usuario: ${response.status}`);
      }
      const data = await response.json();
      
             // Procesar los datos del chat del usuario
       const processedMessages: ChatMessage[] = data.map((msg: Record<string, unknown>, index: number) => ({
         id: (msg.id as number) || index,
         message: (msg.message as string) || (msg.contenido as string) || (msg.texto as string) || 'Mensaje sin contenido',
         timestamp: (msg.timestamp as string) || (msg.fecha as string) || (msg.created_at as string) || new Date().toISOString(),
         isUser: msg.isUser !== undefined ? (msg.isUser as boolean) : true // Por defecto asumimos que es del usuario
       }));

      setChatHistory(prev => ({
        ...prev,
        [userId]: processedMessages
      }));
    } catch (err) {
      console.error('Error fetching user chat history:', err);
      setError('Error al cargar el historial del chat');
    }
  };



  // Cargar datos al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Cargar usuarios y chats en paralelo
        await Promise.all([
          fetchUsers(),
          fetchAllChats()
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Error al cargar los datos iniciales');
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Cargar historial de chat cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUserId) {
      fetchUserChatHistory(selectedUserId);
    }
  }, [selectedUserId]);

  // Marcar como leído cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUserId) {
      // Aquí podrías implementar la lógica para marcar como leído
      // Por ahora solo actualizamos el estado local
    }
  }, [selectedUserId]);

  const selectedChat: ChatMessage[] = selectedUserId ? chatHistory[selectedUserId] || [] : [];
  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) : null;

  // Función para obtener el nombre del usuario
  const getUserName = (user: User) => {
    return user.nombre || user.name || `Usuario ${user.id}`;
  };

  // Función para obtener el último mensaje de un usuario
  const getLastMessage = (userId: number) => {
    const userChats = chatSummaries.filter(chat => chat.ussariold === userId);
    if (userChats.length > 0) {
      // Ordenar por fecha de actualización y tomar el más reciente
      const mostRecent = userChats.sort((a, b) => 
        new Date(b.fechaActualizcion).getTime() - new Date(a.fechaActualizcion).getTime()
      )[0];
      return mostRecent.ultinoMensaje;
    }
    return 'No hay mensajes';
  };

  // Función para obtener la fecha del último mensaje
  const getLastMessageDate = (userId: number) => {
    const userChats = chatSummaries.filter(chat => chat.ussariold === userId);
    if (userChats.length > 0) {
      const mostRecent = userChats.sort((a, b) => 
        new Date(b.fechaActualizcion).getTime() - new Date(a.fechaActualizcion).getTime()
      )[0];
      return mostRecent.fechaActualizcion;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl text-blue-400">Cargando chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100 items-center justify-center">
        <div className="text-center bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-red-400 mb-4">Error de conexión</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              Promise.all([fetchUsers(), fetchAllChats()]).finally(() => setLoading(false));
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Lista de usuarios (sidebar) */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-blue-400 border-b border-gray-700 pb-4">
          💬 Chats
        </h2>
        {users.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-2xl mb-2">📭</div>
            No hay usuarios disponibles
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center p-4 cursor-pointer rounded-xl mb-3 transition-all duration-200 hover:bg-gray-700 hover:shadow-lg ${
                selectedUserId === user.id ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-700'
              }`}
              onClick={() => setSelectedUserId(user.id)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getUserName(user).charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg text-gray-100 truncate">{getUserName(user)}</p>
                <p className="text-sm text-gray-400 truncate">{getLastMessage(user.id)}</p>
                <p className="text-xs text-gray-500 mt-1">{getLastMessageDate(user.id)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historial de chat */}
      <div className="w-3/4 p-6 bg-gray-900 overflow-y-auto relative">
        {/* Fondo con imagen personalizada */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url(/fondo.jpg)',
            backgroundSize: '300px 300px',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        {selectedUserId ? (
          <div className="relative z-10">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg border border-gray-700">
              <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                <span className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg">
                  {selectedUser ? getUserName(selectedUser).charAt(0) : '?'}
                </span>
                Chat con {selectedUser ? getUserName(selectedUser) : 'Usuario'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {selectedChat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md p-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                      msg.isUser
                        ? "bg-gradient-to-r from-blue-500/95 to-blue-600/95 text-white border border-blue-400/30"
                        : "bg-gray-800/90 border border-gray-600/50 text-gray-100"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shadow-sm">
                        {msg.isUser ? (selectedUser ? getUserName(selectedUser).charAt(0) : '?') : "🤖"}
                      </span>
                      <p className="text-sm font-semibold">
                        {msg.isUser ? (selectedUser ? getUserName(selectedUser) : 'Usuario') : "IA"}
                      </p>
                    </div>
                    <p className="text-base leading-relaxed">{msg.message}</p>
                    <p className={`text-xs mt-3 opacity-70 ${msg.isUser ? "text-blue-100" : "text-gray-400"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedChat.length === 0 && (
              <div className="text-center text-gray-400 text-lg bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <div className="text-4xl mb-4">💬</div>
                No hay mensajes en este chat.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-lg bg-gray-800/90 backdrop-blur-sm rounded-xl p-12 border border-gray-700 shadow-lg relative z-10">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Bienvenido a SportBot</h3>
            <p className="text-gray-300">Selecciona un usuario para ver sus chats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;