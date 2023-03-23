import { Box, Button, Card, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrls } from '../utils/utils';


function Login() {
    const navigate = useNavigate();

    const [invalid, setInvalid] = React.useState(false);

    const handleLogin = () => {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let path = getApiUrls()
        console.log(path)
        axios.post(path + "/login", {
            username: username,
            password: password
        }   
        ).then((response) => {
            if (response.status === 200) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("id", response.data.id);
                navigate("/");
            }
        }).catch((error) => {
            setInvalid(true);
            console.log(error);
        }
        )
        
    }

    return (
        <Box sx={{height: "100vh",width: "100%",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
            <Box sx={{flex: 1,width: "100%",display: "flex",flexDirection: "column",justifyContent: "center",}}>
            </Box>
                <Box sx={{flex: 5,width: "100%",backgroundColor: "lightgrey",alignItems: "center",display: "flex",justifyContent: "center",}}>
                    <Box sx={{zIndex: 1,height: "400px",width: "400px",display: "flex",justifyContent: "right",alignItems: "center",}}>
                        <Card sx={{height: "500px",width: "500px",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",backgroundColor: "white",}}>
                            <Box sx={{flex: 2,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
                                <Typography variant="h4" sx={{ fontWeight: "bold", color: "black" }}>
                                    Login
                                </Typography>
                            </Box>
                            <Box sx={{flex: 2,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",marginBottom: "25%", }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "red" }}>
                                    {invalid ? "Invalid Username or Password" : ""}
                                </Typography>
                                <TextField sx={{width: "300px",}} id="username" label="Username" variant="outlined" onChange={() => setInvalid(false)} onKeyPress={(e) => {if (e.key === 'Enter') {handleLogin()}}}/>
                                <TextField sx={{width: "300px",}} id="password" label="Password" variant="outlined" onChange={() => setInvalid(false)} type='password' onKeyPress={(e) => {if (e.key === 'Enter') {handleLogin()}}}/>
                            </Box>
                            <Box sx={{flex: 1,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
                                <Button sx={{width: "200px", height: "50px"}} variant="contained" color="primary" onClick= {() => handleLogin()}>
                                    Login
                                </Button>
                            </Box>
                        </Card>
                    </Box>
                </Box>
            <Box sx={{flex: 1,width: "100%",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
            </Box>
        </Box>
    )
}

export default Login;