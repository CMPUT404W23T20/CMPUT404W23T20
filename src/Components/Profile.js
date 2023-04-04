import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardMedia, CardContent, List, ListItem, TextField, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
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
  const handleEditProfile = async (newDisplayName, newGithub,profileImage) => {
    if (newDisplayName === "") {
      newDisplayName = author.displayName;
    }
    if (newGithub === "") {
      newGithub = author.github;
    }
    if (profileImage === "") {
      profileImage = author.profileImage;
    }

    let payload = {
      "displayName": newDisplayName,
      "github": newGithub,
      "username": author.username,
      "profileImage": profileImage
    }
    console.log(payload);
    let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}`;
    let token = "Bearer " + localStorage.getItem("token");
    console.log(token);
    fetch(path, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify(payload)
    }).then(response => response.json())
      .then(data => console.log(data));

    setEditProfile(false);
    getAuthor().then((payload) => {
      setAuthor(payload);
    });


  }

  return (
    <Box style={{ textAlign: "center" }}>
      <h1>Profile</h1>
      <Nav />
      <Box style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "18px 0px"
      }}>
        <Box style={{ position: "relative" }}>
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" flex={1} m={2}>
            <Card style={{ width: "100%", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.2)" }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <CardMedia component="img" image={author.profileImage} alt={author.displayName} style={{ height: 300, width: 300, borderRadius: "50%" }} />
              </Box>
              <CardContent>
                <Typography variant="h5" component="h2" align="center">
                  @{author.displayName}
                </Typography>
                <Typography variant="subtitle1" component="h4" align="center">
                  Github: {author.github}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" my={2}>
                  <Typography variant="subtitle1" component="h4" style={{ marginRight: "8px" }}>
                    {followers} Followers
                  </Typography>
                  <Box borderRadius="50%" width={8} height={8} bgcolor="grey" />
                  <Typography variant="subtitle1" component="h4" style={{ marginLeft: "8px", marginRight: "8px" }}>
                    {following} Following
                  </Typography>
                </Box>
                <Typography variant="subtitle1" component="h4" align="center">
                  <u style={{ color: "blue", cursor: "pointer" }} onClick={handleClick}>{numPosts} Posts</u>
                </Typography>
              </CardContent>
              <Box display="flex" alignItems="center" justifyContent="center" my={2}>
                <Button variant="contained" color="primary" onClick={() => setEditProfile(true)}>
                  Edit Profile
                </Button>
              </Box>
            </Card>
          </Box>

          <Box>
            {editProfile && (
              <Box style={{ display: "center", flexDirection: "column", margin: "40px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", width: "100%" }}>
                <Typography variant="h4">Edit Profile</Typography>
                <Box style={{ display: "center", flexDirection: "column", flex: 1, margin: "40px", alignItems: "center" }}>
                  <TextField id="displayName" label="Display Name" variant="outlined" style={{ width: "95%", margin: "25px" }} />
                  <TextField id="github" label="Github" variant="outlined" style={{ width: "95%", margin: "25px" }} />
                  <TextField id="profileImage" label="Profile Image" variant="outlined" style={{ width: "95%", margin: "25px" }} />
                </Box>
                <Box style={{ alignSelf: "flex-end" }}>
                  <Button variant="contained" color="primary" onClick={() => handleEditProfile(document.getElementById("displayName").value, document.getElementById("github").value,document.getElementById("profileImage").value)} style={{ margin: 10, alignSelf: "flex-end" }}>
                    Submit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => setEditProfile(false)} style={{ margin: 10, alignSelf: "flex-end" }}>
                    Cancel
                  </Button>
                </Box>

              </Box>)
            }
            <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", backgroundColor: "#c3d3eb", width: "95%" }}>
              <h2>GitHub Activity</h2>
              <List style={{ width: "100%", maxHeight: 400, overflow: 'auto' }}>
                {githubActivity.map((item) => {
                  return (
                    <Card style={{ margin: 10, backgroundColor: "#f5f5f5" }}>
                      <Typography variant="h6" style={{ margin: 10 }}>
                        {item.type}
                      </Typography>
                      <Typography variant="body1" style={{ margin: 10 }}>
                        Repo: {item.repo.name}
                      </Typography>
                      <Typography variant="body1" style={{ margin: 10 }}>
                        Date: {item.created_at.substring(0, 10)}
                      </Typography>
                    </Card>
                  )
                })}
              </List>
            </Box>

          </Box>

        </Box>

      </Box>

    </Box>
  )
}

export default Profile;