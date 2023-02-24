import React, { useState } from 'react';
import { Box, Button, Card,CardContent } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';

function Friends() {
    const getusers= async () => {
        let path = "http://localhost:8000/api/users/";
        let response = await axios.get(path);
        return response.data;
    }

    const [Users, setUsers] = React.useState([]);
    React.useEffect(() => {
        getusers().then((data) => {
            setUsers(data);
        });
    }, []);

    //https://reactgo.com/react-change-button-color-onclick/
    const [active, setActive] = useState(false);
  
    const handleClick = (user) => {
      setActive(!active);

      active ? document.getElementById(user.id).style.backgroundColor = "white": document.getElementById(user.id).style.backgroundColor = "lightgrey" ;
      var btnText= active ? document.getElementById(user.id).innerText = "Follow": document.getElementById(user.id).innerText= "Request Sent" ;
      
      //if btn text is now set to "Request sent", we send a message to the inbox and create a new friendRequest object.
      if (btnText === "Request Sent"){
        sendRequest(user);
      }
      if (btnText === "Follow"){
        cancelRequest(user)
      }
      
    };

    const sendRequest = async(user) => {

        let path = "http://127.0.0.1:8000/api/friendRequests/"


        /* TODO: We need to find a way to see if this request is a "Friend request"
        or if its a "follow request". We need this to determine what message to send
        the inbox and for the summary*/

        //maybe GET request and see if object is in actor's list of friends?
        
        //how do I get the id of person's account we're currently in
        let data = {
            "summary":"None",
            "requestCategory":"follow",
            "actor":5, //change id later
            "object": user.id
        }
        await axios.post(path, data, {
            headers: {
                "Content-Type": "application/json",
            }
        });

    };

    //TODO
    const cancelRequest= async(user,name) =>{
        //destroy the friendRequest object associated with that name (using the id of the friendreuqest object)
        let path = "http://127.0.0.1:8000/api/friendRequests/"
        

    }

    const sendMessage = (selfId,otherId,name) => {

        /*Using the id, do a get request, get the reuqest based on the id we want */
    }

    
    return (
        <Box>
            <h1>Friends</h1>
    
            <div style = {{float:"right",paddingRight:150,width: 400,}}>
                <Card style={{ width: 450,height:450, backgroundColor:"#66aeec",overflowY:"scroll"}}>
                    
                        <h2 style ={{color:"whitesmoke"}}>Local Authors</h2>
                        
                        {Users.map((Users) => (
                             <CardContent >
                                <div class = "LocalAuth" style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                     <img src= {Users.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
                                     <span>
                                        <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{Users.displayName}  </h4></a>
                                     </span>
                                     <Button id = {Users.id} onClick={() => handleClick(Users)}  
                                        style={{backgroundColor: "white",float:"right",
                                        marginLeft:25, fontSize:15}}>
                                            Follow
                                    </Button>

                                </div>
                           

                            </CardContent>    
                         
                        ))}

                </Card>
            </div>

            <div class = "friendsList">
              <h2> Your list of friends:</h2>

            </div>
                 
                
            <Nav/>
        </Box>
 
      
    )
}

export default Friends;