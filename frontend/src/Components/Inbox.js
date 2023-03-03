import React from 'react';
import { Box, Button, Card,List, ListItem, TextField, Typography } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';

function Posts() {
    const get_all_posts = async () => {
        let path = "http://localhost:8000/api/inbox/";
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
        get_all_posts().then((data) => {
            setPosts(data);
        });
    }, []);

    const [openPost, setopenPost] = React.useState(false);
    const [post, setPost] = React.useState([{}]);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height : "100vh", width: "100vw", alignItems: "left", justifyContent: "left" }}>
                <Box style={{width: "170px"}}>
                <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh"}}>
                    <Box style={{display: "flex", flexDirection: "column",flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px"}}>
                        <Typography variant="h4">Inbox</Typography>
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
                    </Box>
                    {openPost && (
                        <Box style={{ flex: 1,display: "flex", flexDirection: "column", margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px"}}>
                            <Box style={{flex: 1, margin: "5px"}}>
                                <Card style = {{ width: "100%", height: "100%", borderRadius: "4px", boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)"}}>
                                    <TextField id="description" label="Description" variant="outlined" style={{width: "95%", margin: "25px"}} value={post.description} onChange={(e) => setPost({...post, description: e.target.value})} multiline maxRows={15}/>
                                </Card>
                            </Box>
                        </Box>)
                    }
                </Box>
            </Box>
        </Box>
    )
}

export default Posts;