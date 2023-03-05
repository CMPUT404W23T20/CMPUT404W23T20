import React, { useState } from 'react';
import { Box, Button, Card,CardContent } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
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
    const getFollowing= async (other) => { //sees if user is following the other
        let userId= userInfo().user_id;
        let path = `http://localhost:8000/api/authors/${other.id}/followers/${userId}`
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        return response.data;
    }



    const [notFollowing,setNotFollow] = React.useState([]); //list of authors who are not friends w/ users
    const [friend, setFriend] =  React.useState([]); //list of
    
    
    //Gets the list of authors that are not friends with users
    React.useEffect(() => {
        getusers()
            .then((data) => {
                for (let item of data){  
                    getFollowing(item)
                    .then((data => {
                        let userId= userInfo().user_id;
                        if ((data ==="Not a follower") && (item.id !== userId)){ 
                            setNotFollow(currentState => [...currentState,item])
                         
                        }
                        else if (item.id !== userId){
                            setFriend(thisState => [...thisState,item])
                        }
                      
                    }));

             }});
    }, []);

    //The call to ".then()" returns duplicates, so we need to filter them out
    const followerCopy = notFollowing.filter((v,i) => {return notFollowing.map((data)=> data.id).indexOf(v.id)==i})
    const friendsCopy = friend.filter((v,i) => {return friend.map((data)=> data.id).indexOf(v.id)==i})
    
   

    //Ensures that we are logged in 
    let token =localStorage.getItem("token");
    console.log(token)
    const navigate = useNavigate();
    const userInfo = () =>{
        if (token === null ){
            navigate("/Login");
        }
        var decoded = JSON.stringify(jwt_decode(token));
        var decode_info= JSON.parse(decoded)
        return decode_info;
        
    };
    const friendReqExists = async(author) =>{
        let userId= userInfo().user_id;
        let path = `http://localhost:8000/api/${userId}/friendrequest/${author.id}`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token"),

            }
        });
        return response.data;
    }
   
    
   //Sends a request
    const sendRequest = async(author) =>{
        

        const requestSent = await(friendReqExists(author))
        
        if (requestSent.length > 0){ //ensures there is no duplicate
            alert("Friend Request is Pending")
            return
        }
        else{
            alert("A request has been sent")
        }
    
        let userId= userInfo().user_id;
        let userName =  userInfo().username;


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
        window.location.reload()  
    }

    //delete friend
    /*go to the the friend's followers page, and take out the user's id.
     Store their list of followers in an array. 
    */
    const deleteFriend = async(formerFriend)=> {
        let userId= userInfo().user_id;
        let path = `http://localhost:8000/api/authors/${formerFriend.id}/followers/${userId}`;
        let response = await axios.delete(path, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
        window.location.reload();
    }

    //get all friend requests
    //paste this into inbox page
    const getFriendReq = async() =>{
            let userId= userInfo().user_id;
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
        //remove + reload
        let userId= userInfo().user_id;
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
        let userId= userInfo().user_id;
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
             <Nav/>
            <div style = {{float:"right",paddingRight:150,width: 400,}}>
                <Card style={{ width: 450,height:450, backgroundColor:"#66aeec",overflowY:"scroll"}}>
                    
                        <h2 style ={{color:"whitesmoke"}}>Local Authors</h2>
                        <div class = "localauthors"> 
                            {followerCopy.map((Authors) => (
                             
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                        <img src= {Authors.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
                                        <span>
                                            <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}> {Authors.displayName}</h4></a>
    
                                        </span>
                                        <Button 
                                            id = {Authors.id}
                                            style={{backgroundColor:"white",float:"right",
                                            marginLeft:25, fontSize:15,minWidth:90}}onClick = {() => sendRequest(Authors)}
                                           >
                                            Follow
                                               
                                        </Button>
                                       
                                    

                                    </div>
                            

                                </CardContent>    
                            
                                ))}
                         </div>
                </Card>
            </div>
            <div class = "friendslist" >
                <h2>Your friends</h2>
                <div class = "friendCard">
                    {friendsCopy.map((Authors) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:550,wordWrap:"break-word",
                                                     paddingLeft: 150}}>
                                        <img src= {Authors.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginLeft:150}} width={55} height = {55}/>
                                        <span>
                                            <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{Authors.displayName}</h4></a>
                                        </span>
                                        <Button 
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
             <h2>Friend Requests</h2>
              <div class = "friendRequests">
                    
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

           
        </Box>
 
      
    )
}

export default Friends;