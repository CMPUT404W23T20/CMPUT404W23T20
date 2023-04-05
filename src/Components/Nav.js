import {
    Button,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
  } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import InboxIcon from "@mui/icons-material/Inbox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from '@mui/icons-material/Group';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';

function Nav(){
    const navigate = useNavigate();
    const itemsList = [
        {
            text: "Home",
            location: "/",
            icon: <HomeIcon />,
        },
        {
          text: "Inbox",
          location: "/inbox",
          icon: <InboxIcon />,
        },
        {
            text: "Profile",
            location: "/profile",
            icon : <AccountCircleIcon />,
        },
        {
            text: "Friends",
            location: "/friends",
            icon: <GroupIcon />,
        },
        {
            text: "Posts",
            location: "/posts",
            icon: <DynamicFeedIcon />,
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
                {item.icon && (
                  <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                )}
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