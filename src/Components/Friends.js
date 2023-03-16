import React, { useState } from 'react';
import { Box, Button, Card,CardContent } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import Nav from './Nav';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { getListSubheaderUtilityClass } from '@mui/material';



/* Load all the ones that are NOT friends
do a get request to http://127.0.0.1:8000/api/authors/{other}/followers/{user}
is user in that list
 - False? => add to list to nonFollow
 - Yes => don't add to list of authors */

function Friends() {

    

    const [following, setFollowing] = React.useState([]); //people you follow/following
    const [friends, setFriends] =  React.useState([]); //people you follow/following
    const [notFollowing, setNotFollowing] = React.useState([]); //people you don't follow
    
    const getLists = async () => {
        let userId= userInfo().user_id;
        let path = `http://localhost:8000/service/authors/${userId}/friends`;
        let friendsResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        console.log("friends", friendsResponse.data)
        setFriends(friendsResponse.data);

        
        path = `http://localhost:8000/service/authors/${userId}/following`;
        let followingResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        console.log("following", followingResponse.data)

        userId= userInfo().user_id;
        let allAuthors = await axios.get("http://localhost:8000/service/authors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        let allAuthorsList = allAuthors.data;
        let notFollowingList = []
        for (let i = 0; i < allAuthorsList.length; i++) {
            let author = allAuthorsList[i];
            let j = 0;
            let found = false;
            for (j = 0; j < followingResponse.data.length; j++) {
                if (author.id === followingResponse.data[j].id) {
                    found = true;
                    break;
                }
            }
            if (!found && author.id !== userId) {
                notFollowingList.push(author);
            }
        }

        console.log("not following", notFollowingList)
        setNotFollowing(notFollowingList);

        // remove friends from following
        let followingList = followingResponse.data;
        for (let i = 0; i < friendsResponse.data.length; i++) {
            let friend = friendsResponse.data[i];
            let j = 0;
            let found = false;
            for (j = 0; j < followingList.length; j++) {
                if (friend.id === followingList[j].id) {
                    found = true;
                    break;
                }
            }
            if (found) {
                followingList.splice(j, 1);
            }
        }
        console.log("following", followingList)
        setFollowing(followingList);
    }

    React.useEffect(() => {
        getLists()
    }, []);

    const followAuthor = async (other) => {
        let userId= userInfo().user_id;
        let path = `http://localhost:8000/service/authors/${other.id}/followers/${userId}`;
        let response = await axios.put(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        path = "http://localhost:8000/service/authors/" + other.id + "/inbox";
        await axios.post(path, response.data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        getLists()
        return response.data;
    }
    
    const unfollowAuthor = async (other) => {
        let userId= userInfo().user_id;
        let path = `http://localhost:8000/service/authors/${other.id}/followers/${userId}`;
        let response = await axios.delete(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        getLists()
        return response.data;
    }
    
    //Ensures that we are logged in 
    let token =localStorage.getItem("token");
    const navigate = useNavigate();
    const userInfo = () =>{
        if (token === null ){
            navigate("/login");
        }
        var decoded = JSON.stringify(jwt_decode(token));
        var decode_info= JSON.parse(decoded)
        return decode_info;
        
    };

    return (
        <Box>
            <Nav/>
            <div style = {{float:"right",paddingRight:150,width: 400,}}>
                <Card style={{ width: 450,height:450, backgroundColor:"#66aeec",overflowY:"scroll"}}>
                    
                        <h2 style ={{color:"whitesmoke"}}>Local Authors</h2>
                        <div className = "localauthors"> 
                            {notFollowing.map((author) => (
                             
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                        <img src= {author.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
                                        <span>
                                            <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}> {author.displayName}</h4></a>
    
                                        </span>
                                        <Button 
                                            id = {author.id}
                                            style={{backgroundColor:"white",float:"right",
                                            marginLeft:25, fontSize:15,minWidth:90}}onClick = {() => followAuthor(author)}>
                                            Follow
                                        </Button>
                                       
                                    

                                    </div>
                            

                                </CardContent>    

                                
                            
                                ))}
                         </div>
                </Card>
            </div>
            <div class = "friendslist" >
                <h2>Friends</h2>
                <div className = "friendCard">
                    {friends.map((author) => (
                        <CardContent >
                            <div style = {{display:'flex',alignItems:'center',width:550,wordWrap:"break-word",
                                            paddingLeft: 150}}>
                                <img src= {author.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginLeft:150}} width={55} height = {55}/>
                                <span>
                                    <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{author.displayName}</h4></a>
                                </span>
                                <Button
                                    style={{backgroundColor:"pink",float:"right",
                                    marginLeft:25, fontSize:15,minWidth:90}}
                                    onClick={() => unfollowAuthor(author) } >
                                    Unfriend
                                </Button>

                            </div>

                        </CardContent>
                    ))}
                </div>
                <h2>Following</h2>
                <div className = "followCard">
                    {following.map((author) => (
                        <CardContent >
                            <div style = {{display:'flex',alignItems:'center',width:550,wordWrap:"break-word",
                                                paddingLeft: 150}}>
                                <img src= {author.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginLeft:150}} width={55} height = {55}/>
                                <span>
                                    <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{author.displayName}</h4></a>
                                </span>
                                <Button 
                                    style={{backgroundColor:"pink",float:"right",
                                    marginLeft:25, fontSize:15,minWidth:90}}
                                    onClick={() => unfollowAuthor(author) } >
                                    Unfollow
                                </Button>

                            </div>
                    

                        </CardContent>    
                    
                    ))}
                </div>
            </div>
        </Box>
    )
}

export default Friends;