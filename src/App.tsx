import React from "react";

const App = () => {
  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      background: "#007bff",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      <h1>🤴 King Urban - TESTE DE RENDERIZAÇÃO</h1>
      <p>Se você está vendo esta tela azul, o seu React está funcionando!</p>
      <button 
        onClick={() => alert("React está vivo!")}
        style={{ padding: "10px 20px", cursor: "pointer", marginTop: "20px" }}
      >
        CLIQUE AQUI
      </button>
    </div>
  );
};

export default App;