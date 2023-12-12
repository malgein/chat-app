import { Routes, Route } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import ChatPage from "./components/pages/ChatPage";
import "./App.css"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/chats' element={<ChatPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
