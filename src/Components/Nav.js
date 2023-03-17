import {
    Button,
    Drawer,
    List,
    ListItem,
    ListItemText,
  } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Nav(){
    const navigate = useNavigate();
    const itemsList = [
        {
            text: "Home",
            location: "/",
        },
        {
          text: "Inbox",
          location: "/inbox",
        },
        {
            text: "Profile",
            location: "/profile",
        },
        {
            text: "Friends",
            location: "/friends",
        },
        {
            text: "Posts",
            location: "/posts",
        },
    ]

    return (
      <Drawer
        className="sidebar"
        variant="permanent"
        anchor="left"
        PaperProps={{
          sx: {
            width: "170px",
            background: "linear-gradient(to bottom, #297fca, #66aeec)",
          },
        }}
      >
        <List>
          {itemsList.map((item, index) => {
            const { text } = item;
            return (
              <ListItem
                key={text}
                sx={{ color: "white" }}
                className="sidebar_item"
                onClick={(e) => navigate(item.location)}
              >
                <ListItemText primary={text} />
              </ListItem>
            );
          })}
        </List>
        <Button
          onClick={() => { navigate("/Login"); localStorage.clear(); }}
          variant="outlined"
          sx={{
            color: "#ffffff",
            mt: 5,
            bottom: "20px",
            alignSelf: "center",
            width: "80%",
          }}
        >
          Logout
        </Button>
      </Drawer>
    );
  }
  
  export default Nav;