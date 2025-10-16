// App.jsx
import { SocketContext, socket } from "context/socket";

const App = () => {
  return (
    <SocketContext.Provider value={socket}>
      {/* Vos autres composants */}
    </SocketContext.Provider>
  );
};

export default App;
