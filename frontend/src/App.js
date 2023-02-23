import './App.css';
import { Box } from '@material-ui/core';
import Home from './Components/Home';
import Profile from './Components/Profile';
import Friends from './Components/Friends';
import Posts from './Components/Posts';
import Comments from './Components/Comments';
import Login from './Components/Login';
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Box className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/comments" element={<Comments />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
