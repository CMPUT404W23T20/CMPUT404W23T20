import React, { useState } from 'react';
import { Box, Button, Card,CardContent, TextField, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import Nav from './Nav';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { getListSubheaderUtilityClass } from '@mui/material';
import { getApiUrls } from '../utils/utils';

/* Load all the ones that are NOT friends
do a get request to http://127.0.0.1:8000/api/authors/{other}/followers/{user}
is user in that list
 - False? => add to list to nonFollow
 - Yes => don't add to list of authors */

function Friends() {

    const [following, setFollowing] = React.useState([]); //people you follow/following
    const [friends, setFriends] =  React.useState([]); //people you follow/following
    const [notFollowing, setNotFollowing] = React.useState([]); //people you don't follow
    const [otherUsers, setOtherUsers] = React.useState([]); //all other users
    
    const getLists = async () => {
        // getting local friends
        let userId= userInfo().user_id;
        let path = `${getApiUrls()}/service/authors/${userId}/friends`;
        let friendsResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        let friendsList = friendsResponse.data;

        // getting following
        path =  `${getApiUrls()}/service/authors/${userId}/following`;
        let followingResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        // get all other users
        userId= userInfo().user_id;
        let allAuthors = await axios.get(`${getApiUrls()}/service/authors`, {
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
            if (followingList[i].host === `${getApiUrls()}`) {
                let path = `${getApiUrls()}/service/authors/${userId}/followers/${followingList[i].id}`;
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
        let usersResponse = await axios.get(`${getApiUrls()}/service/authors`, {
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
            }
        });
        // add userResponse.data to group20List
        console.log("Group20 Users", response.data)
        return response.data.items;
    }

    const getGroup6Users = async () => {
        // get users from group6
        let username = "Group6"
        let password = ""
        let auth = "Basic " + btoa(username + ":" + password);
        let response = await axios.get("https://cmput404-group6-instatonne.herokuapp.com/api/authors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth,
            }
        });
        console.log("Group6 Users", response.data)
        return response.data.items;
    }

    const getGroup13Users = async () => {
        // get users from group13
        let username = "Group13"
        let password = ""
        let auth = "Basic " + btoa(username + ":" + password);
        let response = await axios.get("https://group-13-epic-app.herokuapp.com/api/authors", {
            headers: {
                "Content-Type": "application/json",
            }
        });
        console.log("Group13 Users", response.data)
        return response.data.items
    }


    const getOtherUsers = async () => {
        let otherUsersList = [];

        let group20Users = await getGroup20Users();
        otherUsersList = otherUsersList.concat(group20Users);
        //let duplicateUsers = await getDuplicateUsers();
        //otherUsersList = otherUsersList.concat(duplicateUsers);
        //let group6Users = await getGroup6Users();
        //otherUsersList = otherUsersList.concat(group6Users);
        let group13Users = await getGroup13Users();
        otherUsersList = otherUsersList.concat(group13Users);
        

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
        let path =  `${getApiUrls()}/service/authors/${userId}/following`;
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
        // remove host from id
        let id = other.id.split("/").pop();
        let path =  `${getApiUrls()}/service/authors/${id}/followers/${userId}`;
        let data = {
            "type": "author",
            "id": id,
            "host": other.host,
            "displayName": other.displayName,
            "url": other.url,
            "github": other.github ? other.github : "no github",
            "username": other.username ? other.username : "no username",
            "profileImage": other.profileImage ? other.profileImage : "no profileImage",
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
        console.log('other.host: ', other.host);
        console.log('path: ', path);
        if (other.host === path ) {
            path = `${getApiUrls()}/service/authors/${other.id}/inbox`;
            await axios.post(path, response.data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            }).catch((error) => {
                console.log(error);
            });
        }   

        getLists()
    }
    
    const unfollowAuthor = async (other) => {
        // handles unfollow button
        let userId= userInfo().user_id;
        let path =  `${getApiUrls()}/service/authors/${other.id}/followers/${userId}`;
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
            <Box style = {{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'row', marginLeft:200, marginTop:40}}>
                <Box style = {{flex:1,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
                    <Card style = {{width:500, height:450, backgroundColor:"#a7cdd4"}}>
                        <Typography variant="h5" style = {{paddingTop:5}}>Friends</Typography>
                        <TextField id="searchFriends" label="Search" style = {{width: 400,marginLeft:20}} onChange={search}/>
                        <Box style = {{marginLeft:20,marginTop:20, height:350,overflowY:"scroll", overflowX:"hidden"}}>
                            {friends.map((author) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:500,wordWrap:"break-word"}}>
                                        {author.profileImage && (<img src= {author.profileImage} alt = "IMG" style = {{borderRadius:"50%",}} width={55} height = {55}/>)}
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
                        </Box>
                    </Card>
                    <Card style = {{width:500, height:450, backgroundColor:"#a7cdd4", marginTop:20}}>
                        <Typography variant="h5" style = {{paddingTop:5}}>Following</Typography>
                        <TextField id="searchFollowing" label="Search" style = {{width: 400,marginLeft:20}} onChange={search}/>
                        <Box style = {{marginLeft:20,marginTop:20, height:350,overflowY:"scroll", overflowX:"hidden"}}>
                            {following.map((author) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:500,wordWrap:"break-word"}}>
                                        {author.profileImage && (<img src= {author.profileImage} alt = "IMG" style = {{borderRadius:"50%"}} width={55} height = {55}/>)}
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
                        </Box>
                    </Card>
                </Box>
                <Box style = {{flex:1,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
                    <Card style = {{width:500, height:450, backgroundColor:"#a7cdd4"}}>
                        <Typography variant="h5" style = {{paddingTop:5}}>Local Authors</Typography>
                        <TextField id="searchLocal" label="Search" style = {{width: 400}} onChange={search}/>
                        <Box style = {{marginLeft:20,marginTop:20, height:350,overflowY:"scroll", overflowX:"hidden"}}>
                        {notFollowing.map((author) => (
                            <CardContent >
                                <div style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                    <img src= {author.profileImage} alt = "" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
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
                        </Box>
                    </Card>
                    <Card style = {{width:500, height:450, backgroundColor:"#a7cdd4", marginTop:20}}>
                    <Typography variant="h5" style = {{paddingTop:5}}>Other Authors</Typography>
                        <TextField id="searchOther" label="Search" style = {{width: 400,marginLeft:20}} onChange={search}/>
                        <Box style = {{marginLeft:20,marginTop:20, height:350,overflowY:"scroll", overflowX:"hidden"}}>
                            {otherUsers.map((author) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:500,wordWrap:"break-word"}}>
                                        {author.profileImage && (<img src= {author.profileImage} alt = "IMG" style = {{borderRadius:"50%"}} width={55} height = {55}/>)}
                                        <span>
                                            <a href = " "><h4 style ={{width:150,wordWrap:"break-word"}}>{author.displayName}</h4></a>
                                        </span>
                                        <Button 
                                            style={{backgroundColor:"white",float:"right",
                                            marginLeft:25, fontSize:15,minWidth:90}}
                                            onClick={() => followAuthor(author) } >
                                            Follow
                                        </Button>
                                    </div>
                                </CardContent>    
                            ))}
                        </Box>
                    </Card>
                </Box>
            </Box>
        </Box>
    )
}

export default Friends;