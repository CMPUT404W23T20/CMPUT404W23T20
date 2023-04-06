import { Box, Button, Card, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';

function Register() {


  const [invalid, setInvalid] = React.useState(false);
  const [correctPassword,setCorrectPassword] = React.useState(true);

  const handleRegister = () => {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (password === confirmPassword){
      axios.post("http://localhost:8000/register", {
        username: username,
        password: password,
      }).then((response) => {
        if (response.status === 201) {
        //confirmation message  
        console.log("HIIIII",response.status)
        document.getElementById("confirmation").style.display = "Block"
            setTimeout(
                function () {
                    document.getElementById("confirmation").style.display = "None"
                }, 5000);
        document.getElementById("username").value = ""
        document.getElementById("password").value = ""
        document.getElementById("confirmPassword").value = ""
          
        }
    }).catch((error) => {
        setInvalid(true);
        console.log(error);
    }
    ) 
    }
    else{
        setCorrectPassword(false)
        setTimeout(
            function () {
                document.getElementById("matchPassword").style.display = "Block"
            }, 8000);
    }
    
  };

  return (
    <Box style={{height: "100vh",backgroundColor: "#c3d3eb",width: "100%",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center"}}>
        <Box sx={{flex: 1,width: "100%",display: "flex",flexDirection: "column",justifyContent: "center",}}>
        </Box>
            <Box sx={{flex: 5,width: "100%",backgroundColor: "#c3d3eb",alignItems: "center",display: "flex",justifyContent: "center",}}>
                <Box sx={{zIndex: 1,height: "400px",width: "400px",display: "flex",justifyContent: "right",alignItems: "center",}}>
                    <Card sx={{height: "600px",width: "600px",display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",backgroundColor: "white",}}>
                        <Box sx={{flex: 2,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
                            <Typography variant="h4" sx={{ fontWeight: "bold", color: "black" }}>
                            Register
                            </Typography>
                        </Box>
                        <Box sx={{flex: 2,display: "flex",flexDirection: "column",alignItems: "center",marginTop:"-5%",marginBottom: "10%", }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "red" }}>
                            {invalid ? "Username already in use" : ""}
                            </Typography>
                            <Typography id = "matchPassword" variant="h6" sx={{ textAlign: "left",fontWeight: "bold", color: "red" }}>
                            {!correctPassword ? "Passwords must match" : ""}
                            </Typography>
                            <Typography id  = "confirmation" variant="body2" sx={{ borderRadius: "25px", backgroundColor: "#bce3c0",display:"none",textAlign: "left",fontWeight: "bold", color: "black",marginBottom:"5%" }}>
                                Your account details have been sent for approval!
                            </Typography>

                            <Typography variant="body2" style={{color: "gray",marginBottom:"5px" }} >Choose a Username:</Typography>
                            <TextField style={{width: "300px",marginBottom:"15px"}} id="username" label="Username" variant="outlined" onChange={() => setInvalid(false)} onKeyPress={(e) => {if (e.key === 'Enter') {handleRegister()}}}/>
                            <Typography variant="body2" style={{color: "gray",marginBottom:"5px" }} >Password:</Typography>
                            <TextField style={{width: "300px",marginBottom:"15px"}} id="password" label="Password" variant="outlined" onChange={() => setInvalid(false)} type='password' onKeyPress={(e) => {if (e.key === 'Enter') {handleRegister()}}}/>
                            <Typography variant="body2" style={{color: "gray",marginBottom:"5px" }} >Confirm your password:</Typography>
                            <TextField style={{width: "300px",marginBottom:"15px"}} id="confirmPassword" label="Confirm Password" variant="outlined" onChange={() => setInvalid(false)} type='password' onKeyPress={(e) => {if (e.key === 'Enter') {handleRegister()}}}/>
                            
                            <Box  sx={{marginTop:"10px"}}>
                                <Typography variant="body1" sx={{display:"inline",fontWeight: "bold", color: "black"}}>
                                Already have an account? <Link to="/login">Log in </Link> 
                                </Typography> 
                             
  
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="body2" style={{color: "gray",marginTop:"-15px",marginBottom:"10px",marginLeft:"5px",textAlign: "center" }} >
                                    Your account details will have to be reviewed and approved by system administrators before you can use the app.
                            </Typography>
                    
                        </Box>

                     
                        <Box sx={{flex: 1,display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",}}>
                            <Button sx={{width: "200px", height: "50px"}} variant="contained" color="primary" onClick= {() => handleRegister()}>
                            Register
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






