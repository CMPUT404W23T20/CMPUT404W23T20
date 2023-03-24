import React, { useEffect, useState } from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography, FormControlLabel, Checkbox} from '@material-ui/core';
import Nav from './Nav';
import { margin } from '@mui/system';
import axios from 'axios';

function Profile() {

    const [editProfile, setEditProfile] = React.useState(false);
    const [author, setAuthor] = useState({});
    const authorId = localStorage.getItem("id")


    const getAuthor = async () => {
        let path = 'http://localhost:8000/service/authors/' + authorId;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        console.log(response.data);
        return response.data;
    }


    useEffect(() => {
        async function fetchAuthor() {
            let path = 'http://localhost:8000/service/authors/' + authorId;
            const response = await fetch(path);
            const data = await response.json();
            setAuthor(data);
        }
        fetchAuthor();

    }, [authorId]);


    const [numPosts, setNumPosts] = useState(0);
    useEffect(() => {

        let path = 'http://localhost:8000/service/authors/' + authorId + '/posts'
        fetch(path)
          .then(response => response.json())
          .then(data => {
            const userPosts = data.filter(post => post.author.id === authorId);
            setNumPosts(userPosts.length);
          });
      }, []);


      const [followers, setFollowers] = useState(0);
      useEffect(() => {
        let path = 'http://localhost:8000/service/authors/' + authorId + '/followers'
        fetch(path)
          .then(response => response.json())
          .then(data => {
            setFollowers(data.length);
          });
      }, []);

      const [following, setFollowing] = useState(0);
      useEffect(() => {
        let path = 'http://localhost:8000/service/authors/' + authorId + '/following'
        fetch(path)
          .then(response => response.json())
          .then(data => {
            setFollowing(data.length);
          });
      }, []);

      const handleClick = () => {
        window.location.href = 'http://localhost:3000/posts';
      }

      const handleEditProfile = async () => {
        let path = "http://localhost:8000/service/authors/" + authorId;
        let data = {
          displayName: author.displayName,
          github: author.github
        }
        await axios.put(path, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token")
          }
        });
       
        setEditProfile(false);
        getAuthor().then((data) => {
          setAuthor(data);
        });
        

      }


    if (!author) {
        return <div>Loading...</div>
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
                    <h4>@{author.username}</h4>
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
                                <Button variant="contained" color="primary" onClick={() => handleEditProfile()} style={{ margin: 10, alignSelf: "flex-end" }}>
                                    Submit
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => setEditProfile(false)} style={{ margin: 10, alignSelf: "flex-end" }}>
                                    Cancel
                                </Button>
                            </Box>

                        </Box>)
                    }

                </div>

            </div>
                
		</div>

        </div>
    )
}

export default Profile;