import React from 'react';
import { Box, Button, Card,List, ListItem, TextField, Typography } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';

function Posts() {
    const getposts = async () => {
        let path = "http://localhost:8000/api/posts/";
        let response = await axios.get(path);
        return response.data;
    }
    const [Posts, setPosts] = React.useState([]);
    React.useEffect(() => {
        getposts().then((data) => {
            setPosts(data);
        });
    }, []);

    const CreatePost = async (title, description) => { 
        await axios("http://localhost:8000/api/posts/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                title: title,
                description: description,
            }),
        });
    }


    const [createPost, setcreatePost] = React.useState([false]);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height : "100vh", width: "100vw", alignItems: "left", justifyContent: "left" }}>
                <Box style={{width: "170px"}}>
                <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh"}}>
                    <Box style={{display: "flex", flexDirection: "column",flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "10px"}}>
                        <Typography variant="h4">Posts</Typography>
                        <List style = {{ flex: 1, overflowY: "scroll"}}>
                            {Posts.map((post) => (
                                <ListItem key={post.id}>
                                    <Card style = {{ width: "100%", backgroundColor: "#66aeec"}}>
                                        <Box style = {{ paddingLeft: 2}}>
                                            <Typography variant="h5">{post.title}</Typography>
                                            <Typography variant="body2">{post.author}</Typography>
                                            <Typography variant="body1">{post.description}</Typography>
                                        </Box>
                                    </Card>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    {createPost && (
                        <Box style={{ display: "flex", flexDirection: "column", margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "10px", width: "25%"}}>
                            <Typography variant="h4">Create Post</Typography>
                            <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", alignItems: "center"}}>
                                <TextField id="title" label="Title" variant="outlined" style={{width: "95%", margin: "25px"}}/>
                                <TextField id="description" label="Description" variant="outlined" style={{width: "95%", margin: "25px"}} multiline minRows={20}/>
                            </Box>
                        </Box>)
                    }
                </Box>
            </Box>
            {/*create post button absolute position top right*/}
            <Box style={{position: "absolute", bottom: "20px", right: "20px"}}>
                <Button variant="contained" color="primary" onClick={createPost ? () => CreatePost(document.getElementById("title").value, document.getElementById("description").value) : () => setcreatePost(true)}>
                    {createPost ? "Done" : "Create Post"}
                </Button>
                <Button variant="contained" color="secondary" onClick={() => setcreatePost(false)} style={{marginLeft: "10px"}}>
                    Cancel
                </Button>
            </Box>  
        </Box>
    )
}

export default Posts;