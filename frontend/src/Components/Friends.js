import React from 'react';
import { Box, Button, Card,CardContent,List, ListItem, RadioGroup, TextField, Typography } from '@material-ui/core';
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

    
    return (
        <Box>
            <h1>Friends</h1>
    
            <div style = {{float:"right",paddingRight:50,width: 400,}}>
                <Card style={{ width: 400,height:400, backgroundColor:"#66aeec",overflowY:"scroll"}}>
                    
                        <h2 style ={{color:"whitesmoke"}}>Local Authors</h2>

                        {Users.map((Users) => (
                             <CardContent>
                                <div class = "LocalAuth" style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                     <img src= {Users.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
                                     <span>
                                        <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{Users.displayName}  </h4></a>
                                     </span>
                                     <Button style={{float:"right", backgroundColor:"whitesmoke",marginLeft:25}}>Add Friend</Button>

                                </div>
                           
                                
                             
                            </CardContent>    
                         
                        ))}

                </Card>
            </div>
                 
                
            <Nav/>
        </Box>
 
      
    )
}

export default Friends;