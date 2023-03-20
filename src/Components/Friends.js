import React, { useState } from 'react';
import { Box, Button, Card,CardContent, TextField } from '@material-ui/core';
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

let PATH = "https://t20-social-distribution.herokuapp.com"

function Friends() {

    

    const [following, setFollowing] = React.useState([]); //people you follow/following
    const [friends, setFriends] =  React.useState([]); //people you follow/following
    const [notFollowing, setNotFollowing] = React.useState([]); //people you don't follow
    const [otherUsers, setOtherUsers] = React.useState([]); //all other users
    
    const getLists = async () => {
        // getting local friends
        let userId= userInfo().user_id;
        let path = PATH + `/service/authors/${userId}/friends`;
        let friendsResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        let friendsList = friendsResponse.data;

        // getting following
        path =  PATH + `/service/authors/${userId}/following`;
        let followingResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        // get all other users
        userId= userInfo().user_id;
        let allAuthors = await axios.get( PATH + "/service/authors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        let allAuthorsList = allAuthors.data;
        let notFollowingList = []
        // get all other users that are not friends or following
        for (let i = 0; i < allAuthorsList.length; i++) {
            let author = allAuthorsList[i];
            let j = 0;
            let found = false;
            // check if author is in friends list
            for (j = 0; j < followingResponse.data.length; j++) {
                if (author.id === followingResponse.data[j].id) {
                    found = true;
                    break;
                }
            }
            // check if author is in following list
            for (j = 0; j < friendsList.length; j++) {
                if (author.id === friendsList[j].id) {
                    found = true;
                    break;
                }
            }
            // add to not following list if not in friends or following
            if (!found && author.id !== userId) {
                notFollowingList.push(author);
            }
        }
        setNotFollowing(notFollowingList);
        
        // remove friends from following and self
        let followingList = followingResponse.data;
        for (let i = 0; i < friendsList.length; i++) {
            let friend = friendsList[i];
            let j = 0;
            let found = false;
            for (j = 0; j < followingList.length; j++) {
                if (friend.id === followingList[j].id || followingList[j].id === userId) {
                    found = true;
                    break;
                }
            }
            if (found) {
                followingList.splice(j, 1);
            }
        }

        // add other server users to friends list and remove them from following list
        for (let i = 0; i < followingList.length; i++) {
            if (followingList[i].host === "http://localhost:8001") {
                let path = `http://localhost:8001/service/authors/${userId}/followers/${followingList[i].id}`;
                let headers = {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                }
                if ((await axios.get(path, headers).data)) {
                    let friend = followingList[i];
                    // add to friends
                    friendsList.push(friend);
                    // remove from following
                    followingList.splice(i, 1);
                }
            }
        }
        setFriends(friendsList);
        setFollowing(followingList);
        getOtherUsers()
        console.log("friends", friendsList)
        console.log("following", followingList)
        console.log("not following", notFollowingList)
    }

    const getDuplicateUsers = async () => {
        // get users from duplicate server
        let usersResponse = await axios.get("http://localhost:8001/service/authors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        // add userResponse.data to group20List
        console.log("duplicate", usersResponse)
        return usersResponse.data;
    }

    const getGroup20Users = async () => {
        // get users from group20
        let username = "Group20"
        let password = "jn8VWYcZDrLrkQDcVsRi"
        let auth = "Basic " + btoa(username + ":" + password);
        let response = await axios.get("https://social-distribution-media.herokuapp.com/api/authors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth,
                "access-control-allow-origin": "*"
            }
        });
        // add userResponse.data to group20List
        console.log("Group20 Users", response.data)
        return response.data;
    }


    const getOtherUsers = async () => {
        let otherUsersList = [];

        let group20Users = await getGroup20Users();
        otherUsersList = otherUsersList.concat(group20Users);
        //let duplicateUsers = await getDuplicateUsers();
        //otherUsersList = otherUsersList.concat(duplicateUsers);
        

        // remove friends from other users
        for (let i = 0; i < friends.length; i++) {
            let friend = friends[i];
            let j = 0;
            let found = false;
            for (j = 0; j < otherUsersList.length; j++) {
                if (friend.id === otherUsersList[j].id) {
                    found = true;
                    break;
                }
            }
            if (found) {
                otherUsersList.splice(j, 1);
            }
        }
        // get following
        let userId= userInfo().user_id;
        let path =  PATH +`/service/authors/${userId}/following`;
        let followingResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        // remove following from other users
        let followingList = followingResponse.data;
        for (let i = 0; i < followingList.length; i++) {
            let j = 0;
            let found = false;
            for (j = 0; j < otherUsersList.length; j++) {
                if (followingList[i].id === otherUsersList[j].id) {
                    found = true;
                    break;
                }
            }
            if (found) {
                otherUsersList.splice(j, 1);
            }
        }
        console.log("other users", otherUsersList)
        setOtherUsers(otherUsersList);
    }


    React.useEffect(() => {
        getLists()
        getOtherUsers()
    }, []);

    const search = async () => {
        let userId= userInfo().user_id;
        let filteredList = []
        let search = document.getElementById("search").value;
    }

    const followAuthor = async (other) => {
        // handles follow button
        let userId= userInfo().user_id;
        let path =  PATH +`/service/authors/${other.id}/followers/${userId}`;
        let data = {
            "type": "author",
            "id": other.id,
            "host": other.host,
            "displayName": other.displayName,
            "url": other.url,
            "github": other.github,
            "username": other.username,
            "profileImage": other.profileImage,
            "hidden": 1
        }
        // send follow request to server
        let response = await axios.put(path, data,{
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            }).catch((error) => {
                console.log(error);
            });
        // add item to inbox of other user if they are on our server
        if (other.host ===  path ) {
            path =  PATH +"/service/authors/" + other.id + "/inbox";
            await axios.post(path, response.data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });
        }   

        getLists()
        return response.data;
    }
    
    const unfollowAuthor = async (other) => {
        // handles unfollow button
        let userId= userInfo().user_id;
        let path =  PATH +`/service/authors/${other.id}/followers/${userId}`;
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
            navigate("/Login");
        }
        var decoded = JSON.stringify(jwt_decode(token));
       
        var decode_info= JSON.parse(decoded)
        console.log(decode_info)
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
                <Card style={{ width: 450,height:450, backgroundColor:"#66aeec",overflowY:"scroll", marginTop:20}}>
                    <TextField id="search" label="Search" style = {{width: 400,marginLeft:20,marginTop:20}} onChange={search}/>
                    {otherUsers.map((author) => (
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
                </Card>
            </div>
            <div class = "friendslist" >
                <h2>Friends :</h2>
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