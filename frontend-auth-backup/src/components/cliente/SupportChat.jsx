import React, { useState } from 'react';

const SupportChat = () => {
  const [msg, setMsg] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    alert(`Mensaje enviado: ${msg}`);
    setMsg('');
  };

  return (
    <div>
      <h3>Soporte</h3>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Escribe tu mensaje"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default SupportChat;
