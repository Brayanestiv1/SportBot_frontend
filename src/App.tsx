
import './App.css'
import './index.css'
import React, { useState } from "react";

// Definir tipos TypeScript
interface User {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface ChatMessage {
  id: number;
  message: string;
  timestamp: string;
  isUser: boolean;
}

interface ChatHistory {
  [key: number]: ChatMessage[];
}

// Datos simulados (placeholder para la base de datos)
const users: User[] = [
  { id: 1, name: "Juan Pérez", lastMessage: "Hola, ¿horarios?", timestamp: "2025-08-13 10:30", unread: false },
  { id: 2, name: "María Gómez", lastMessage: "¿Clases para niños?", timestamp: "2025-08-13 14:15", unread: true },
  { id: 3, name: "Carlos López", lastMessage: "¿Costo mensual?", timestamp: "2025-08-13 09:00", unread: false },
];

const chatHistory: ChatHistory = {
  1: [
    { id: 1, message: "Hola, ¿cuáles son los horarios?", timestamp: "2025-08-13 10:30", isUser: true },
    { id: 2, message: "Lunes y miércoles 18:00-19:30, sábados 10:00-11:30.", timestamp: "2025-08-13 10:31", isUser: false },
    { id: 3, message: "¿Y para principiantes?", timestamp: "2025-08-13 10:35", isUser: true },
    { id: 4, message: "Sí, tenemos clases para principiantes los lunes.", timestamp: "2025-08-13 10:36", isUser: false },
  ],
  2: [
    { id: 1, message: "¿Hay clases para niños de 8 años?", timestamp: "2025-08-13 14:15", isUser: true },
    { id: 2, message: "Sí, martes y jueves a las 17:00.", timestamp: "2025-08-13 14:16", isUser: false },
  ],
  3: [
    { id: 1, message: "¿Cuánto cuesta la mensualidad?", timestamp: "2025-08-13 09:00", isUser: true },
    { id: 2, message: "La mensualidad es de $50, incluye clases y eventos.", timestamp: "2025-08-13 09:01", isUser: false },
  ],
};

const App: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const selectedChat: ChatMessage[] = selectedUserId ? chatHistory[selectedUserId] || [] : [];
  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) : null;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Lista de usuarios (sidebar) */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-blue-400 border-b border-gray-700 pb-4">
          💬 Chats
        </h2>
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-4 cursor-pointer rounded-xl mb-3 transition-all duration-200 hover:bg-gray-700 hover:shadow-lg ${
              selectedUserId === user.id ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-700'
            }`}
            onClick={() => setSelectedUserId(user.id)}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg text-gray-100 truncate">{user.name}</p>
              <p className="text-sm text-gray-400 truncate">{user.lastMessage}</p>
              <p className="text-xs text-gray-500 mt-1">{user.timestamp}</p>
            </div>
          </div>
        ))}
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
                  {selectedUser?.name.charAt(0)}
                </span>
                Chat con {selectedUser?.name}
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
                        {msg.isUser ? selectedUser?.name.charAt(0) : "🤖"}
                      </span>
                      <p className="text-sm font-semibold">
                        {msg.isUser ? selectedUser?.name : "IA"}
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
            <p className="text-gray-300">Selecciona un chat para comenzar a conversar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;