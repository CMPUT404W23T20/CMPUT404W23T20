import React, { useState } from 'react';
import { Box, Button, Card,CardContent } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import jwt_decode from "jwt-decode";


/* Load all the ones that are NOT friends
do a get request to http://127.0.0.1:8000/api/authors/{other}/followers/{user}
is user in that list
 - False? => add to list to nonFollow
 - Yes => don't add to list of authors */

function Friends() {
    const getusers= async () => {
        let path = "http://localhost:8000/api/authors";
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        return response.data;
    }
    const getNonFollowers= async (other) => {
        let path = `http://localhost:8000/api/authors/${other.id}/followers/${userId}`
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        return response.data;
    }



    const [nonFollower,setFollow] = React.useState([]);
    const [friend, setFriend] =  React.useState([]);

    //Gets the list of authors that are not friends with users
    React.useEffect(() => {
        getusers()
            .then((data) => {
                for (let item of data){  
                    getNonFollowers(item)
                    
                    .then((data => {
                        if ((data == "Not a follower") && (item.id !== userId)){ 
                            
                            setFollow(currentState => [...currentState,item])
                            console.log(nonFollower.length)
                         
                        }
                        else if (item.id !== userId){
                            console.log(data,item)
                            setFriend(thisState => [...thisState,item])
                        }
                      
                    }));

             }});
    }, []);
    
    
    


    //Accept Request
    /* get the sender detail and update the request */
   
    
    let token =localStorage.getItem("token");
   

    const userInfo = () =>{
        var decoded = JSON.stringify(jwt_decode(token));
        var decode_info= JSON.parse(decoded)
        return decode_info;
        
    };

    let userId= userInfo().user_id;
    let userName =  userInfo().username;
    const sendRequest = async(author) =>{
        alert(`${userName}  A friend request to ${author.username} has been sent`)
        

        let summary  =`${userName} wants to follow ${author.displayName}`

        //POST request to the inbox..
        let path = "http://127.0.0.1:8000/api/friendrequest" //CHANGE THIS TO INBOX ADDRESS
        
        let data = {
            "summary":summary,
            "requestCategory":"follow",
            "actor":userId, 
            "object": author.id
        }
        await axios.post(path, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });


    }

    //delete friend
    /*go to the the friend's followers page, and take out the user's id.
     Store their list of followers in an array. 
    */
    const deleteFriend = async(formerFriend)=> {
        let path = `http://localhost:8000/api/authors/${formerFriend.id}/followers/${userId}`;
        let response = await axios.delete(path, {
            headers: {
                "Authorization": localStorage.getItem("token"),

            }
        });
        window.location.reload()  
    }

    const getFriendReq = async() =>{
            let path = `http://localhost:8000/api/friendrequest/${userId}`;
            let response = await axios.get(path, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                }
            });
            return response.data;
        }


    const [friendRequest, setRequest] =  React.useState([]);
    React.useEffect(() => {
        getFriendReq().then((data) => {
            setRequest(data);
        });
    }, []);

    const declineReq = async(actor) =>{
        //destroy the friend request object
        //remove + relode
        let path = `http://localhost:8000/api/${actor.actor}/friendrequest/${userId}`;
        let response = await axios.delete(path, {
            headers: {
                "Authorization": localStorage.getItem("token"),

            }
        });
        window.location.reload()  

    }
    
    const acceptReq = async(actor) =>{
        /*
        1. destroy the request (ie. call decline request)
        2. add actor to list of object's followers (object = user),(actor = sender)
        3. PUT  http://localhost:8000/api/authors/${userId}/followers/${actor.id}
        */

        declineReq(actor)
        let path = `http://localhost:8000/api/authors/${userId}/followers/`;
        let data = {
            items: actor.actor
        }
        await axios.put(path, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        window.location.reload()
    }



    return (
        <Box>
            <h1>Friends</h1>
            
            <div style = {{float:"right",paddingRight:150,width: 400,}}>
                <Card style={{ width: 450,height:450, backgroundColor:"#66aeec",overflowY:"scroll"}}>
                    
                        <h2 style ={{color:"whitesmoke"}}>Local Authors</h2>
                        
                        {nonFollower.map((Authors) => (
                             <CardContent >
                                <div id = {Authors.id} style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                     <img src= {Authors.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
                                     <span>
                                        <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{Authors.displayName}</h4></a>
                                     </span>
                                     <Button id = {Authors.username}
                                        onClick={() => sendRequest(Authors)} 
                                        style={{backgroundColor: "white",float:"right",
                                        marginLeft:25, fontSize:15}} >
                                            Send Request
                                    </Button>

                                </div>
                           

                            </CardContent>    
                         
                        ))}
                </Card>
            </div>
            <div class = "friendslist" >
                <h2>People you follow</h2>
                <div class = "friendCard">
                    {friend.map((Authors) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:550,wordWrap:"break-word",
                                                     paddingLeft: 150}}>
                                        <img src= {Authors.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginLeft:150}} width={55} height = {55}/>
                                        <span>
                                            <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{Authors.displayName}</h4></a>
                                        </span>
                                        <Button id = {Authors.username}
                                            style={{backgroundColor:"pink",float:"right",
                                            marginLeft:25, fontSize:15,minWidth:90}}
                                            onClick={() => deleteFriend(Authors) } >
                                            Unfriend
                                        </Button>

                                    </div>
                            

                                </CardContent>    
                            
                            ))}
                </div>

            </div>
              <div class = "friendRequest">
                    <h2>Friend Requests</h2>
                     {friendRequest.map((request) =>(
                        <div>
                            <h5>{request.summary}</h5>
                            <Button onClick = {() => acceptReq(request)}>
                                Accept
                            </Button>
                            <Button onClick={() => declineReq(request) }>
                                Decline
                            </Button>
                        </div>

                            

                

                     ))}
                    

                </div>

            <Nav/>
        </Box>
 
      
    )
}

export default Friends;