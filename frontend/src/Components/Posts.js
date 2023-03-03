import React from 'react';
import { Box, Button, Card,List, ListItem, TextField, Typography,FormControlLabel, Checkbox } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';



function Posts() {
    const getposts = async () => {
        let path = "http://localhost:8000/api/posts/";
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        console.log(response.data);
        return response.data;
    }
    const [Posts, setPosts] = React.useState([]);
    React.useEffect(() => {
        getposts().then((data) => {
            setPosts(data);
        });
    }, []);

    const CreatePost = async (title, description) => {
        console.log(visibility ? "PUBLIC" : "FRIENDS")
        console.log(unlisted)
        let path = "http://localhost:8000/api/posts/";
        let data = {
            title: title,
            description: description,
            unlisted: unlisted,
            visibility: visibility ? "PUBLIC" : "FRIENDS"
        }
        let token = localStorage.getItem("token");
        console.log(token);
        await axios.post(path, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        setcreatePost(false);
        getposts().then((data) => {
            setPosts(data);
        }
        );
    }

    const HandleDelete = async () => {
        let path = "http://localhost:8000/api/posts/" + post.id + "/";
        let response = await axios.delete(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        setopenPost(false);
        getposts().then((data) => {
            setPosts(data);
        }
        );
    }

    const handleEditPost = async () => {
        let path = "http://localhost:8000/api/posts/" + post.id + "/";
        let data = {
            title: post.title,
            description: post.description,
        }
        await axios.put(path, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        setedit(false);
        getposts().then((data) => {
            setPosts(data);
        }
        );
    }

    const [createPost, setcreatePost] = React.useState(false);
    const [openPost, setopenPost] = React.useState(false);
    const [edit, setedit] = React.useState(false);
    const [post, setPost] = React.useState([{}]);
    const [unlisted, setUnlisted] = React.useState(false);
    const [visibility, setVisibility] = React.useState(false);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height : "100vh", width: "100vw", alignItems: "left", justifyContent: "left" }}>
                <Box style={{width: "170px"}}>
                <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh"}}>
                    <Box style={{display: "flex", flexDirection: "column",flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px"}}>
                        <Typography variant="h4">Posts</Typography>
                        <List style = {{ flex: 1, overflowY: "scroll"}}>
                            {Posts.map((post) => (
                                <ListItem key={post.id} onClick = {() => {setopenPost(true); setPost(post)}}>
                                    <Card style = {{ width: "100%", backgroundColor: "#66aeec"}}>
                                        <Box style = {{ paddingLeft: 2}}>
                                            <Typography variant="h5">{post.title}</Typography>
                                            <Typography variant="body2">{post.authorName}</Typography>
                                            <Typography variant="body1" style={{maxHeight: "200px", overflowY: "auto"}}>{post.description}</Typography>
                                        </Box>
                                    </Card>
                                </ListItem>
                            ))}
                        </List>
                        {!createPost && 
                            <Button variant="contained" color="primary" onClick={() => setcreatePost(true)} style = {{margin: 10, alignSelf: "flex-end"}}>
                                Create Post
                            </Button>
                        }
                    </Box>
                    {openPost && (
                        <Box style={{ flex: 1,display: "flex", flexDirection: "column", margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px"}}>
                            {edit ? (
                                <TextField id="title" label="Title" variant="outlined" style={{width: "95%", margin: "25px"}} value={post.title} onChange={(e) => setPost({...post, title: e.target.value})}/>
                            ) : (
                                <Typography variant="h4">{post.title}</Typography>
                            )}
                            <Box style={{flex: 1, margin: "5px"}}>
                                <Card style = {{ width: "100%", height: "100%", borderRadius: "4px", boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)"}}>
                                    {edit ? (
                                        <TextField id="description" label="Description" variant="outlined" style={{width: "95%", margin: "25px"}} value={post.description} onChange={(e) => setPost({...post, description: e.target.value})} multiline maxRows={15}/>
                                    ) : (
                                        <Typography variant="body1" style={{maxHeight: "100%", overflowY: "auto"}}>{post.description}</Typography>
                                    )}
                                </Card>
                            </Box>
                            <Box style={{alignSelf: "flex-end"}}>
                                {edit && (
                                    <Button variant="contained" color="secondary" onClick={() => HandleDelete()} style = {{margin: 10, alignSelf: "flex-end"}}>
                                        Delete
                                    </Button>
                                )}
                                {!edit ? (
                                    <Button variant="contained" color="primary" onClick={() => setedit(true)} style = {{margin: 10, alignSelf: "flex-end"}}>
                                        Edit
                                    </Button> 
                                ) : (
                                    <Button variant="contained" color="primary" onClick={() => handleEditPost()} style = {{margin: 10, alignSelf: "flex-end"}}>
                                        Finish
                                    </Button>
                                )}
                                <Button variant="contained" color="secondary" onClick={() => setopenPost(false)} style = {{margin: 10, alignSelf: "flex-end"}}>
                                    Close
                                </Button>
                            </Box>
                        </Box>)
                    }
                    {createPost && (
                        <Box style={{ display: "flex", flexDirection: "column", margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", width: "25%"}}>
                            <Typography variant="h4">Create Post</Typography>
                            <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", alignItems: "center"}}>
                                <TextField id="title" label="Title" variant="outlined" style={{width: "95%", margin: "25px"}}/>
                                <TextField id="description" label="Description" variant="outlined" style={{width: "95%", margin: "25px"}} multiline minRows={20}/>
                                <FormControlLabel control={<Checkbox id="unlisted" name="unlisted" />} onChange={() => setUnlisted(!unlisted)} label="Unlisted" />
                                <FormControlLabel control={<Checkbox id="visibility" name="visibility" onChange={() => setVisibility(!visibility)} />} label="Visibility" />
                            </Box>
                            <Box style={{alignSelf: "flex-end"}}>
                                <Button variant="contained" color="primary" onClick={() => CreatePost(document.getElementById("title").value, document.getElementById("description").value)} style = {{margin: 10, alignSelf: "flex-end"}}>
                                    Create
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => setcreatePost(false)} style = {{margin: 10, alignSelf: "flex-end"}}>
                                    Cancel
                                </Button>
                            </Box>
                            
                        </Box>)
                    } 
                </Box>
            </Box>
        </Box>
    )
}

export default Posts;