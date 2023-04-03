import React from 'react';
import { Box,Card,List,ListItem, ListItemText, Typography } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import { getApiUrls } from '../utils/utils';

function Profile() {
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
            getGithubActivity(data).then((data) => {
                setGithubActivity(data);
            });
        });
    }, []);


    return (
        <Box className="App" style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", alignItems: "center", justifyContent: "center" }}>
            <Box style={{ width: "170px" }}>
                <Nav />
            </Box>
            <Box style = {{display:"flex",flexDirection:"column",alignItems:"center", height:"100vh", flex:1}}>
                <Box style={{ display: "flex",alignItems:"center", flexDirection: "column", flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", backgroundColor: "#c3d3eb", width:"95%" }}>
                    <h1>Profile</h1>
                    <img src= {userInfo.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
                    <h2>Username: {userInfo.displayName}</h2>
                    <h2>Display Name: {userInfo.displayName}</h2>
                    <h2>Host: {userInfo.host}</h2>
                    <h2>GitHub: {userInfo.github}</h2>
                </Box>
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
            </Box>
        </Box>
    )
}

export default Profile;