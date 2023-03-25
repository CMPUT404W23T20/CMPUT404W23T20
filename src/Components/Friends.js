import React, { useState } from 'react';
import { Box, Button, Card,CardContent, TextField, Typography } from '@material-ui/core';
import { useNavigate } from "react-router-dom";
import Nav from './Nav';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { getListSubheaderUtilityClass } from '@mui/material';
import { getApiUrls } from '../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';

/* Load all the ones that are NOT friends
do a get request to http://127.0.0.1:8000/api/authors/{other}/followers/{user}
is user in that list
 - False? => add to list to nonFollow
 - Yes => don't add to list of authors */

function Friends() {

    const [following, setFollowing] = React.useState([]); //people you follow/following
    const [filteredFollowing, setFilteredFollowing] = React.useState([])
    const [friends, setFriends] =  React.useState([]); //people you follow/following
    const [filteredFriends, setFilteredFriends] = React.useState([])
    const [notFollowing, setNotFollowing] = React.useState([]); //people you don't follow
    const [filteredNotFollowing, setFilteredNotFollowing] = React.useState([])
    const [otherUsers, setOtherUsers] = React.useState([]); //all other users
    const [filteredOtherUsers, setFilteredOtherUsers] = React.useState([])
    const [loadingFollowing, setLoadingFollowing] = React.useState(true);
    const [loadingFriends, setLoadingFriends] = React.useState(true);
    const [loadingNotFollowing, setLoadingNotFollowing] = React.useState(true);
    const [loadingOtherUsers, setLoadingOtherUsers] = React.useState(true);
    
    
    
    const getLists = async () => {
        // getting local friends
        let userId= userInfo().user_id;
        let path = `${getApiUrls()}/service/authors/${userId}/friends`;
        let friendsResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        let friendsList = friendsResponse.data.items;

        // getting following
        path =  `${getApiUrls()}/service/authors/${userId}/following`;
        let followingResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        // get all other users
        userId= userInfo().user_id;
        let allAuthors = await axios.get(`${getApiUrls()}/service/authors`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        let allAuthorsList = allAuthors.data.items;
        let notFollowingList = []
        // get all other users that are not friends or following
        for (let i = 0; i < allAuthorsList.length; i++) {
            let author = allAuthorsList[i];
            let j = 0;
            let found = false;
            // check if author is in friends list
            for (j = 0; j < followingResponse.data.items.length; j++) {
                if (author.id === followingResponse.data.items[j].id) {
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
        setFilteredNotFollowing(notFollowingList);
        setLoadingNotFollowing(false);
        // remove friends from following and self
        let followingList = followingResponse.data.items;
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
                    "Authorization": "Bearer " + localStorage.getItem("token")
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
        setFilteredFriends(friendsList);
        setLoadingFriends(false);
        setFilteredFollowing(followingList);
        setLoadingFollowing(false);
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
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        // add userResponse.data to group20List
        console.log("duplicate", usersResponse)
        return usersResponse.data.items;
    }

    const getGroup2Users = async () => {
        // get users from group20
        let username = "Group20"
        let password = "jn8VWYcZDrLrkQDcVsRi"
        let auth = "Basic " + btoa(username + ":" + password);
        let response = await axios.get("https://social-distribution-media.herokuapp.com/api/authors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth,
            }
        }).catch(() => {
            return [];
        });
        // add userResponse.data to group20List
        if (response.data && response.data.items) {
            console.log("Group2 Users", response.data.items)
            return response.data.items;
        }
        return [];
    }

    const getGroup6Users = async () => {
        // get users from group6
        let auth = "Basic R3JvdXAyMDpncm91cDIwY21wdXQ0MDQ="
        let response = await axios.get("https://cmput404-group6-instatonne.herokuapp.com/authors", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth,
            }
        }).catch(() => {
            return [];
        });
        if (response.data && response.data.items) {
            console.log("Group6 Users", response.data.items)
            return response.data.items;
        }
        return [];
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
        }).catch(() => {
            return [];
        });
        if (response.data && response.data.items) {
            console.log("Group13 Users", response.data.items)
            return response.data.items;
        }
        return [];
    }


    const getOtherUsers = async () => {
        let otherUsersList = [];

        let group2Users = await getGroup2Users();
        otherUsersList = otherUsersList.concat(group2Users);
        //let duplicateUsers = await getDuplicateUsers();
        //otherUsersList = otherUsersList.concat(duplicateUsers);
        let group6Users = await getGroup6Users();
        otherUsersList = otherUsersList.concat(group6Users);
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
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        // remove following from other users
        for (let i = 0; i < followingResponse.data.items.length; i++) {
            let following = followingResponse.data.items[i];
            let j = 0;
            let found = false;
            // remove host from id if it exists
            if (following.id.includes("/")) {
                following.id = following.id.split("/").pop();
            }
            for (j = 0; j < otherUsersList.length; j++) {
                // remove host from id if it exists
                if (otherUsersList[j].id.includes("/")) {
                    otherUsersList[j].id = otherUsersList[j].id.split("/").pop();
                }
                if (following.id === otherUsersList[j].id) {
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
        setFilteredOtherUsers(otherUsersList);
        setLoadingOtherUsers(false);
    }


    React.useEffect(() => {
        getLists()
        getOtherUsers()
    }, []);

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
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            }).catch((error) => {
                console.log(error);
            });
        // add item to inbox of other user if they are on our server
        if (other.host ===  getApiUrls()) {
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

        // remove item from other users list and add to following list
        setFilteredOtherUsers(filteredOtherUsers.filter((item) => item.id !== other.id));
        setFilteredFollowing(filteredFollowing.concat(other));
        
        getLists()
    }
    
    const unfollowAuthor = async (other) => {
        // handles unfollow button
        let userId= userInfo().user_id;
        let path =  `${getApiUrls()}/service/authors/${other.id}/followers/${userId}`;
        let response = await axios.delete(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        getLists()
        return response.data;
    }
    
    //Ensures that we are logged in 
    let token ="Bearer " + localStorage.getItem("token");
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
    

    const searchOtherUsers = () => {
        let search = document.getElementById("searchOther").value;
        // check if search is in display name or host
        let filtered = otherUsers.filter((author) => {
            return author.displayName.toLowerCase().includes(search.toLowerCase()) || author.host.toLowerCase().includes(search.toLowerCase());
        });
        setFilteredOtherUsers(filtered);
    }

    const searchFriends = () => {
        let search = document.getElementById("searchFriends").value;
        // check if search is in display name or host
        let filtered = friends.filter((author) => {
            return author.displayName.toLowerCase().includes(search.toLowerCase()) || author.host.toLowerCase().includes(search.toLowerCase());
        });
        setFilteredFriends(filtered);
    }

    const searchNotFollowing = () => {
        let search = document.getElementById("searchNotFollowing").value;
        // check if search is in display name or host
        let filtered = notFollowing.filter((author) => {
            return author.displayName.toLowerCase().includes(search.toLowerCase()) || author.host.toLowerCase().includes(search.toLowerCase());
        });
        setFilteredNotFollowing(filtered);
    }

    const searchFollowing = () => {
        let search = document.getElementById("searchFollowing").value;
        // check if search is in display name or host
        let filtered = following.filter((author) => {
            return author.displayName.toLowerCase().includes(search.toLowerCase()) || author.host.toLowerCase().includes(search.toLowerCase());
        });
        setFilteredFollowing(filtered);
    }

    return (
        <Box>
            <Nav/>
            <Box style = {{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'row', marginLeft:200, marginTop:40}}>
                <Box style = {{flex:1,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
                    <Card style = {{width:500, height:450, backgroundColor:"#c3d3eb", borderColor: "grey", borderStyle: "solid"}}>
                        <Box style = {{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
                            <Typography variant="h5" style = {{paddingTop:5, alignSelf:'left'}}>Friends</Typography>
                            <TextField id="searchFriends" label="Search by name and host" style = {{width: 370, marginLeft: 20}} onChange={searchFriends}/>
                        </Box>
                        <Box style = {{marginLeft:20,marginTop:20, height:385,overflowY:"scroll", overflowX:"hidden"}}>
                            {loadingFriends && <CircularProgress />}
                            {!loadingFriends && filteredFriends.map((author) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:500,wordWrap:"break-word"}}>
                                        <img src= {(author.profileImage != "no profileImage" && author.profileImage != "") ? author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt = "IMG" style = {{borderRadius:"50%"}} width={55} height = {55}/>
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
                    <Card style = {{width:500, height:450, backgroundColor:"#c3d3eb", marginTop:20, borderColor: "grey", borderStyle: "solid"}}>
                        <Box style = {{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
                            <Typography variant="h5" style = {{paddingTop:5, alignSelf:'left'}}>Following</Typography>
                            <TextField id="searchFollowing" label="Search by name and host" style = {{width: 350, marginLeft: 20}} onChange={searchFollowing}/>
                        </Box>
                        <Box style = {{marginLeft:20,marginTop:20, height:385,overflowY:"scroll", overflowX:"hidden"}}>
                            {loadingFollowing && <CircularProgress />}
                            {!loadingFollowing && filteredFollowing.map((author) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                        <img src= {(author.profileImage != "no profileImage" && author.profileImage != "") ? author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt = "IMG" style = {{borderRadius:"50%"}} width={55} height = {55}/>
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
                    <Card style = {{width:500, height:450, backgroundColor:"#c3d3eb", borderColor: "grey", borderStyle: "solid"}}>
                        <Box style = {{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
                            <Typography variant="h5" style = {{paddingTop:5}}>Local Authors</Typography>
                            <TextField id="searchNotFollowing" label="Search by name and host" style = {{width: 300, marginLeft: 20}} onChange={searchNotFollowing}/>
                        </Box>
                        <Box style = {{marginLeft:20,marginTop:20, height:385,overflowY:"scroll", overflowX:"hidden"}}>
                            {loadingNotFollowing && <CircularProgress />}
                            {!loadingNotFollowing && filteredNotFollowing.map((author) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:400,wordWrap:"break-word"}}>
                                        <img src= {(author.profileImage != "no profileImage" && author.profileImage != "") ? author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt = "IMG" style = {{borderRadius:"50%"}} width={55} height = {55}/>
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
                    <Card style = {{width:500, height:450, backgroundColor:"#c3d3eb", marginTop:20, borderColor: "grey", borderStyle: "solid"}}>
                        <Box style = {{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
                            <Typography variant="h5" style = {{paddingTop:5}}>Other Authors</Typography>
                            <TextField id="searchOther" label="Search by name and host" style = {{width: 300,marginLeft:20}} onChange={searchOtherUsers}/>
                        </Box>
                        <Box style = {{marginLeft:20,marginTop:20, height:385,overflowY:"scroll", overflowX:"hidden"}}>
                            {loadingOtherUsers && <CircularProgress />}
                            {!loadingOtherUsers && filteredOtherUsers.map((author) => (
                                <CardContent >
                                    <div style = {{display:'flex',alignItems:'center',width:500,wordWrap:"break-word"}}>
                                        <img src= {(author.profileImage != "no profileImage" && author.profileImage != "") ? author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt = "IMG" style = {{borderRadius:"50%"}} width={55} height = {55}/>
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