import React from 'react';
import { Box } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';

function Profile() {

    const getUserInfo = async () => {
        let path = "https://t20-social-distribution.herokuapp.com/service/authors/" + localStorage.getItem("id");
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        console.log(response.data);
        return response.data;
    }

    const [userInfo, setUserInfo] = React.useState([]);
    React.useEffect(() => {
        getUserInfo().then((data) => {
            setUserInfo(data);
        });
    }, []);

    return (
        <Box>
            <Nav />
            <Box>
                <h1>Profile</h1>
                <img src= {userInfo.profileImage} alt = "Profile" style = {{borderRadius:"50%",marginRight:20}} width={55} height = {55}/>
                <h2>Username: {userInfo.displayName}</h2>
                <h2>Display Name: {userInfo.displayName}</h2>
                <h2>Host: {userInfo.host}</h2>
                <h2>GitHub: {userInfo.github}</h2>
            </Box>
        </Box>
    )
}

export default Profile;