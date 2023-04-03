import React, { useEffect, useState } from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography, FormControlLabel, Checkbox} from '@material-ui/core';
import Nav from './Nav';
import { margin } from '@mui/system';
import { json } from 'react-router-dom';
import axios from 'axios';
import { getApiUrls } from '../utils/utils';

function Profile() {

    const [editProfile, setEditProfile] = React.useState(false);
    const [author, setAuthor] = useState({});
    const authorId = localStorage.getItem("id");
    const [userInfo, setUserInfo] = React.useState([]);


    const getUserInfo = async () => {
      let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}`;
      let response = await axios.get(path, {
          headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + localStorage.getItem("token")
          }
      });
      console.log(response.data);
      setUserInfo(response.data);
      return response.data;
    
    }

    const getGithubActivity = async (data) => {
      if (data.github === null || data.github === undefined || data.github === "" || data.github === "no github") {
          console.log("No github account", data.github);
          return [];
      }
      // strip https and www from github url
      data.github = data.github.replace("https://github.com/", "");
      let path = `https://api.github.com/users/${data.github}/events/public`;
      let response = await axios.get(path, {
          headers: {
              "Content-Type": "application/json",
          }
      });
      console.log(response);
      return response.data;
    }
    const [githubActivity, setGithubActivity] = React.useState([]);


      React.useEffect(() => {
          getUserInfo().then((data) => {
              setUserInfo(data);
              getGithubActivity(data).then((data) => {
                  setGithubActivity(data);
              });
          });
      }, []);

    // Grab author info, function to be used for other functions that need author info
    const getAuthor = async () => {
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        console.log(response.data);
        return response.data;
    }

    
    useEffect(() => {
        async function fetchAuthor() {
            let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}`;
            const response = await fetch(path);
            const data = await response.json();
            setAuthor(data);
        }
        fetchAuthor();

    }, [authorId]);

    // Sets the number of posts
    const [numPosts, setNumPosts] = useState(0);
    useEffect(() => {
      let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/posts`
      fetch(path)
        .then(response => response.json())
        .then(data => {
          console.log("Post data:", data);
          const count = data.items.length;
          console.log("Post count:", count);
          setNumPosts(count);
        })
        .catch(error => {
          console.log("Error:", error);
        });
    }, []);

      // Grabs the follower count
      const [followers, setFollowers] = useState(0);
      useEffect(() => {
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/followers`
        fetch(path)
          .then(response => response.json())
          .then(data => {
            console.log("Follower data:", data);
            const count = data.items.length;
            console.log("Follower count:", count);
            setFollowers(count);
          })
          .catch(error => {
            console.log("Error:", error);
          });
      }, []);

      // Grabs following count
      const [following, setFollowing] = useState(0);
      useEffect(() => {
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/following`
        fetch(path)
          .then(response => response.json())
          .then(data => {
            console.log("Following data:", data);
            const count = data.items.length;
            console.log("Following count:", count);
            setFollowing(count);
          })
          .catch(error => {
            console.log("Error:", error);
          });
      }, []);

      // Takes user to posts page when clicked on number of posts
      const handleClick = () => {
        window.location.href = `${getApiUrls()}/posts`;
      }

      // Handles editing of profile
      const handleEditProfile = async (newDisplayName, newGithub) => {
        
        let payload = {
          "displayName": newDisplayName,
          "github": newGithub,
          "username": author.username,
        }
        console.log(payload);
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}`;
        let token = "Bearer " + localStorage.getItem("token");
        console.log(token);
        fetch(path, {
          method: "PUT",
          headers: {'Content-Type': 'application/json', 'Authorization': token},
          body: JSON.stringify(payload)
      }).then(response => response.json())
          .then(data => console.log(data));

        setEditProfile(false);
        getAuthor().then((payload) => {
          setAuthor(payload);
        });
        

      }

    return (
        <div>
            <h1>Profile</h1>
            <Nav/>
			<div style={{
                display: "flex",
                justifyContent: "center",
                margin:"18px 0px"
            }}>
				<div>
                    <img style={{width: "300px", height: "300px", borderRadius:"200px"}}
                    src={author.profileImage}
                    />
                    <h4>@{author.displayName}</h4>
                    <h4>Github: {author.github}</h4>
                    <div>
                    <h4>{followers} Followers</h4>
                    <h4>{following} Following</h4>
                </div>
                    <u style={{color:"blue"}} onClick={handleClick}>{numPosts} Posts</u>
                <div>
                    <Button variant="contained" color="primary" onClick={() => setEditProfile(true)} style={{ margin: 10, alignSelf: "flex-end" }}>
                              Edit Profile
                            </Button>
                </div>
                <div>
                {editProfile && (
                        <Box style={{ display: "center", flexDirection: "column", margin: "40px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", width: "100%" }}>
                            <Typography variant="h4">Edit Profile</Typography>
                            <Box style={{ display: "center", flexDirection: "column", flex: 1, margin: "40px", alignItems: "center" }}>
                                <TextField id="displayName" label="Display Name" variant="outlined" style={{ width: "95%", margin: "25px" }} />
                                <TextField id="github" label="Github" variant="outlined" style={{ width: "95%", margin: "25px" }}/>
                                
                                
                            </Box>
                            <Box style={{ alignSelf: "flex-end" }}>
                                <Button variant="contained" color="primary" onClick={() => handleEditProfile(document.getElementById("displayName").value, document.getElementById("github").value)} style={{ margin: 10, alignSelf: "flex-end" }}>
                                    Submit
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => setEditProfile(false)} style={{ margin: 10, alignSelf: "flex-end" }}>
                                    Cancel
                                </Button>
                            </Box>

                        </Box>)
                    }
                  <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", backgroundColor: "#c3d3eb", width:"95%" }}>
                    <h2>GitHub Activity</h2>
                    <List style = {{width:"100%", maxHeight: 400, overflow: 'auto'}}>
                        {githubActivity.map((item) => {
                            return (
                                <Card style = {{margin:10, backgroundColor:"#f5f5f5"}}>
                                    <Typography variant="h6" style = {{margin:10}}>
                                        {item.type}
                                    </Typography>
                                    <Typography variant="body1" style = {{margin:10}}>
                                        Repo: {item.repo.name}
                                    </Typography>
                                    <Typography variant="body1" style = {{margin:10}}>
                                        Date: {item.created_at.substring(0,10)}
                                    </Typography>
                                </Card>
                            )
                        })}
                    </List>
                </Box>

                </div>

            </div>
                
		      </div>

        </div>
    )
}

export default Profile;