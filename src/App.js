import './App.css';
import { Box } from '@material-ui/core';
import Home from './Components/Home';
import Inbox from './Components/Inbox';
import Profile from './Components/Profile';
import Friends from './Components/Friends';
import Posts from './Components/Posts';
import Login from './Components/Login';
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Box className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Inbox" element={<Inbox />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/posts" element={<Posts />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
