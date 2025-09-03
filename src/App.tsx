
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
  chatId: string; // Cambiado de chatid a chatId
  ultimoMensaje: string;
  totalMensajes: number;
  usuarioId: number; // Cambiado de ussariold a usuarioId
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

// Nueva interfaz para la respuesta del endpoint summary
interface ChatSummaryResponse {
  chat_id: number;
  message_count: number;
  conversation: Array<{
    tipo: 'usuario' | 'bot';
    contenido: string;
    timestamp: string;
  }>;
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
      console.log(`Intentando obtener historial para usuario ${userId}`);
      
      // Primero intentamos obtener los chats del usuario desde el endpoint de admin
      const userChats = chatSummaries.filter(chat => chat.usuarioId === userId);
      console.log(`Chats encontrados para usuario ${userId}:`, userChats);
      
      if (userChats.length === 0) {
        console.log(`No se encontraron chats para el usuario ${userId}`);
        setChatHistory(prev => ({
          ...prev,
          [userId]: []
        }));
        return;
      }

      // Obtener el historial de cada chat del usuario usando el endpoint de summary
      const allMessages: ChatMessage[] = [];
      
      for (const chat of userChats) {
        try {
                     console.log(`Intentando obtener summary del chat ${chat.id}`);
           
           // Usar el endpoint de summary que SÍ existe
           const summaryResponse = await fetch(`http://localhost:8000/api/v1/admin/chats/${chat.id}/summary`);
           console.log(`Summary endpoint status para ${chat.id}:`, summaryResponse.status);
           
           if (summaryResponse.ok) {
             const summaryData: ChatSummaryResponse = await summaryResponse.json();
             console.log(`Summary data para ${chat.id}:`, summaryData);
             
             // Procesar los mensajes de la conversación
             const processedMessages = summaryData.conversation.map((msg, index) => ({
               id: index + 1,
               message: msg.contenido,
               timestamp: msg.timestamp,
               isUser: msg.tipo === 'usuario'
             }));
             
             allMessages.push(...processedMessages);
             console.log(`Mensajes procesados para ${chat.id}:`, processedMessages);
           } else {
             console.log(`Error en summary endpoint para ${chat.id}: ${summaryResponse.status}`);
           }
         } catch (chatErr) {
           console.error(`Error obteniendo summary del chat ${chat.id}:`, chatErr);
         }
      }

      // Ordenar todos los mensajes por timestamp
      allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Si no se pudieron obtener mensajes de los endpoints, crear un mensaje de prueba
      if (allMessages.length === 0) {
        console.log(`Creando mensaje de prueba para usuario ${userId}`);
        const testMessage: ChatMessage = {
          id: 1,
          message: `Este es un mensaje de prueba para el usuario ${userId}. Los endpoints de chat no están devolviendo datos.`,
          timestamp: new Date().toISOString(),
          isUser: false
        };
        allMessages.push(testMessage);
      }

      console.log(`Total de mensajes para usuario ${userId}:`, allMessages);

      setChatHistory(prev => ({
        ...prev,
        [userId]: allMessages
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
    const userChats = chatSummaries.filter(chat => chat.usuarioId === userId);
    if (userChats.length > 0) {
      // Ordenar por fecha de actualización y tomar el más reciente
      const mostRecent = userChats.sort((a, b) => 
        new Date(b.fechaActualizcion).getTime() - new Date(a.fechaActualizcion).getTime()
      )[0];
      return mostRecent.ultimoMensaje;
    }
    return 'No hay mensajes';
  };

  // Función para obtener la fecha del último mensaje
  const getLastMessageDate = (userId: number) => {
    const userChats = chatSummaries.filter(chat => chat.usuarioId === userId);
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
        {/* Botón de debug para probar endpoints */}
        <button 
          onClick={async () => {
            console.log('=== DEBUG INFO ===');
            console.log('Usuarios:', users);
            console.log('Chat Summaries:', chatSummaries);
            console.log('Chat History:', chatHistory);
            
            // Probar endpoint de usuarios
            try {
              const userResponse = await fetch('http://localhost:8000/api/v1/usuarios/');
              console.log('Usuarios endpoint status:', userResponse.status);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('Usuarios data:', userData);
              }
            } catch (err) {
              console.error('Error probando usuarios endpoint:', err);
            }
            
                         // Probar endpoint de admin chats
             try {
               const chatResponse = await fetch('http://localhost:8000/api/v1/admin/chats/');
               console.log('Admin chats endpoint status:', chatResponse.status);
               if (chatResponse.ok) {
                 const chatData = await chatResponse.json();
                 console.log('Admin chats data:', chatData);
                 
                                   // Si hay chats, probar el endpoint de summary del primer chat
                  if (chatData.length > 0) {
                    const firstChat = chatData[0];
                    console.log('Probando summary para el primer chat:', firstChat.id);
                    
                    const summaryResponse = await fetch(`http://localhost:8000/api/v1/admin/chats/${firstChat.id}/summary`);
                    console.log('Summary endpoint status:', summaryResponse.status);
                    if (summaryResponse.ok) {
                      const summaryData = await summaryResponse.json();
                      console.log('Summary data:', summaryData);
                    }
                  }
               }
             } catch (err) {
               console.error('Error probando admin chats endpoint:', err);
             }
          }}
          className="mb-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          🐛 Debug Endpoints
        </button>
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