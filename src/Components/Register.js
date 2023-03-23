import { Box, Button, Card, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  

  const [invalid, setInvalid] = React.useState(false);
 

  const handleRegister = () => {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
      axios.post("http://localhost:8000/register", {
        username: username,
        password: password,
      })
      
      .catch((error) => {
        setInvalid(true);
        console.log(error);
      });
  };

  return (
    <Box sx={{height: "100vh",width: "100%",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
        <Box sx={{flex: 1,width: "100%",display: "flex",flexDirection: "column",justifyContent: "center",}}>
        </Box>
            <Box sx={{flex: 5,width: "100%",backgroundColor: "lightgrey",alignItems: "center",display: "flex",justifyContent: "center",}}>
                <Box sx={{zIndex: 1,height: "400px",width: "400px",display: "flex",justifyContent: "right",alignItems: "center",}}>
                    <Card sx={{height: "500px",width: "500px",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",backgroundColor: "white",}}>
                        <Box sx={{flex: 2,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
                            <Typography variant="h4" sx={{ fontWeight: "bold", color: "black" }}>
                            Register
                            </Typography>
                        </Box>
                        <Box sx={{flex: 2,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",marginBottom: "25%", }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "red" }}>
                            {invalid ? "Username already in use" : ""}
                            </Typography>
                            <TextField sx={{width: "300px",}} id="username" label="Username" variant="outlined" onChange={() => setInvalid(false)} onKeyPress={(e) => {if (e.key === 'Enter') {handleRegister()}}}/>
                            <TextField sx={{width: "300px",}} id="password" label="Password" variant="outlined" onChange={() => setInvalid(false)} type='password' onKeyPress={(e) => {if (e.key === 'Enter') {handleRegister()}}}/>
                            <Box sx={{marginTop: "20px"}}>
                               
                                <Typography variant="body1" onClick= {() => navigate("/login")} sx={{ fontWeight: "bold", color: "blue" }}>
                                Already have an account? Login here
                                </Typography>
                                
                            </Box>
                        </Box>
                    
                        <Box sx={{flex: 1,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
                            <Button sx={{width: "200px", height: "50px"}} variant="contained" color="primary" onClick= {() => handleRegister()}>
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
export default Register;






