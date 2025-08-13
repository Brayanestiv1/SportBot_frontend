
import './App.css'
import './index.css'
import React, { useState } from "react";

// Datos simulados (placeholder para la base de datos)
const users = [
  { id: 1, name: "Juan Pérez", lastMessage: "Hola, ¿horarios?", timestamp: "2025-08-13 10:30", unread: false },
  { id: 2, name: "María Gómez", lastMessage: "¿Clases para niños?", timestamp: "2025-08-13 14:15", unread: true },
  { id: 3, name: "Carlos López", lastMessage: "¿Costo mensual?", timestamp: "2025-08-13 09:00", unread: false },
];

const chatHistory = {
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

  const selectedChat = selectedUserId ? chatHistory[selectedUserId] || [] : [];
  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) : null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Lista de usuarios (sidebar) */}
      <div className="w-1/4 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-lg"
            onClick={() => setSelectedUserId(user.id)}
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.lastMessage}</p>
              <p className="text-xs text-gray-400">{user.timestamp}</p>
            </div>
            {user.unread && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
          </div>
        ))}
      </div>

      {/* Historial de chat */}
      <div className="w-3/4 p-6 bg-gray-200 overflow-y-auto">
        {selectedUserId ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Chat con {selectedUser?.name}
            </h2>
            <div className="space-y-4">
              {selectedChat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-2 rounded-lg ${
                      msg.isUser
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-300"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">
                      {msg.isUser ? selectedUser?.name : "IA"}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.isUser ? "text-white" : "text-gray-500"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {selectedChat.length === 0 && (
              <p className="text-center text-gray-500">No hay mensajes en este chat.</p>
            )}
            <p className="text-xs text-gray-400 mt-2">* mensaje no leído</p>
          </div>
        ) : (
          <p className="text-center text-gray-500">Selecciona un chat para ver el historial.</p>
        )}
      </div>
    </div>
  );
};

export default App;