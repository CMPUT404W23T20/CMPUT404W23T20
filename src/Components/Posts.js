import React from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import { getApiUrls } from '../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';

function Posts() {
    const [Comments, setComments] = React.useState([]);

    const getposts = async () => {
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/posts`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        let posts = response.data.items;
        console.log(response.data);
        let commentList = []

        //get all comments in the "Public Posts" header
        if (posts == undefined) posts = [];
        for (let i = 0; i < posts.length; i++){

            let commentListPath = `${getApiUrls()}`+"/service/authors/" + posts[i].author.id+ "/posts/" +posts[i].id+"/comments";
            let comments = await axios.get(commentListPath, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+localStorage.getItem("token")
            }
            });
            let commentDataList = comments.data.items

            for (let i = 0; i < commentDataList.length; i++ ){
                commentList.push(commentDataList[i])  
            }
        }


        //getting all comments in the "Following" header
        console.log("comments: ", commentList)
        setComments(commentList)
        return posts;
    }
    const [Posts, setPosts] = React.useState([]);
    React.useEffect(() => {
        getposts().then((data) => {
            setPosts(data);
            setLoadingPosts(true);
        });
    }, []);

    const CreatePost = async (title, description) => {
        console.log(visibility ? "FRIENDS" : "PUBLIC")
        console.log(unlisted)
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/posts`        ;
        let data = {
            title: title,
            description: description,
            unlisted: unlisted,
            visibility: visibility ? "FRIENDS" : "PUBLIC" 
        }
        let token = "Bearer " + localStorage.getItem("token");
        console.log(token);
        let postResponse = await axios.post(path, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });
        console.log(postResponse.data);

        // get followers
        path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/followers`;
        let followersResponse = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });
        console.log(followersResponse.data);

        // send post to inbox of followers
        for (let follower of followersResponse.data.items) {
            path =`${getApiUrls()}/service/authors/${follower.id}/inbox`;
            await axios.post(path, postResponse.data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });
        }

        setcreatePost(false);
        getposts().then((data) => {
            setPosts(data);
        }
        );
    }

    const HandleDelete = async () => {
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/posts/${post.id}`;
        let response = await axios.delete(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        setopenPost(false);
        getposts().then((data) => {
            setPosts(data);
        }
        );
    }

    const handleEditPost = async () => {
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/posts/${post.id}`;
        let data = {
            title: post.title,
            description: post.description,
        }
        await axios.put(path, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
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
    const [loadingPosts, setLoadingPosts] = React.useState(false);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", alignItems: "left", justifyContent: "left" }}>
                <Box style={{ width: "170px" }}>
                    <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh" }}>
                    <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", backgroundColor: "#c3d3eb" }}>
                        <Typography variant="h4">Posts</Typography>
                        <List style = {{ flex: 1, overflowY: "scroll", maxHeight: "100%"}}>
                            {!loadingPosts && <CircularProgress />}
                            {loadingPosts && Posts.map((post) => (
                                <ListItem key={post.id} onClick = {() => {setopenPost(true); setPost(post)}}>
                                    <Card style = {{ width: "100%"}}>
                                        <Box style = {{ paddingLeft: 2}}>
                                            {(post.type === 'post') && (<Box style = {{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px"}}>
                                                <img src= {(post.author.profileImage != "no profileImage" && post.author.profileImage != "") ? post.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt = "IMG" style = {{borderRadius:"50%"}} width="100px" height = "100px"/>
                                                <Box style = {{ display: "flex", flexDirection: "column", paddingLeft: "10px"}}>
                                                    <Typography variant="h5">Title: {post.title}</Typography>
                                                    <Typography variant="body2">Author: {post.author.displayName}</Typography>
                                                    <Typography variant="body2">Published: {post.published.substring(0,10)}</Typography>
                                                    <Typography variant="body2">Node: {post.author.host}</Typography>
                                                </Box>
                                            </Box>)}
                                        </Box>
                                    </Card>
                                </ListItem>
                            ))}
                        </List>
                        {!createPost &&
                            <Button variant="contained" color="primary" onClick={() => setcreatePost(true)} style={{ margin: 10, alignSelf: "flex-end" }}>
                                Create Post
                            </Button>
                        }
                    </Box>
                    {openPost && (
                        <Box style={{ flex: 1, display: "flex", flexDirection: "column", margin: "10px", borderColor: "grey", borderStyle: "solid", backgroundColor: "#c3d3eb" }}>
                            {edit ? (
                                <TextField id="title" label="Title" variant="outlined" style={{ width: "95%", margin: "25px" }} value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
                            ) : (
                                <Typography variant="h4">{post.title}</Typography>
                            )}
                            <Card style = {{ marginRight: "10px",marginBottom: "10px",marginLeft: "10px", borderRadius: "10px", borderColor: "black",marginTop: "5px",flex:1, overflowY: "scroll"}}>
                                <Card style={{ width: "100%", height: "100%", borderRadius: "4px", boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)" }}>
                                    {edit ? (
                                        <TextField id="description" label="Description" variant="outlined" style={{ width: "95%", margin: "25px" }} value={post.description} onChange={(e) => setPost({ ...post, description: e.target.value })} multiline maxRows={15} />
                                    ) : (
                                        <Typography variant="body1" style={{ maxHeight: "100%", overflowY: "auto" }}>{post.description}</Typography>
                                    )}
                                </Card>
                            </Card>
                            <Box style={{ alignSelf: "flex-end" }}>
                                {edit && (
                                    <Button variant="contained" color="secondary" onClick={() => HandleDelete()} style={{ margin: 10, alignSelf: "flex-end" }}>
                                        Delete
                                    </Button>
                                )}
                                {!edit ? (
                                    <Button variant="contained" color="primary" onClick={() => setedit(true)} style={{ margin: 10, alignSelf: "flex-end" }}>
                                        Edit
                                    </Button>
                                ) : (
                                    <Button variant="contained" color="primary" onClick={() => handleEditPost()} style={{ margin: 10, alignSelf: "flex-end" }}>
                                        Finish
                                    </Button>
                                )}
                                <Button variant="contained" color="secondary" onClick={() => setopenPost(false)} style={{ margin: 10, alignSelf: "flex-end" }}>
                                    Close
                                </Button>
                            </Box>
                            <Card style = {{ marginRight: "10px",marginBottom: "10px",marginLeft: "10px", borderRadius: "10px", borderColor: "black",marginTop: "5px",flex:1, overflowY: "scroll"}}>
                                {(`${post.author.id}`=== localStorage.getItem("id")) ? <Typography variant="h6" style = {{textAlign:"left", paddingLeft:30,fontSize:20}}>Comments:</Typography> :<h2></h2> }                                        {Comments.map((comments) => (
                                        ((`${comments.post.id}` === `${post.id.split("/").pop()}`) && (`${post.author.id}`=== localStorage.getItem("id"))) ? 
                                        ( <div style = {{display:'flex',alignItems:'center',wordWrap:"break-word"}}>
                                            <img src= {comments.author.profileImage} alt = "" style = {{borderRadius:"50%",marginLeft:30,marginRight:15,marginBottom:10}} width={55} height = {55}/>
                                            <Typography variant="h6" style = {{display: "inline-block",textAlign:"left", paddingLeft:15,fontSize:20}}>
                                                {comments.author.displayName}: {comments.comment}
                                            </Typography>
                                        </div>
                                        ) 
                                        :(<h2></h2>)   
                                    ))}
                            </Card>
                        </Box>)
                    }
                    {createPost && (
                        <Box style={{ display: "flex", flexDirection: "column", margin: "10px", borderColor: "grey", borderStyle: "solid", width: "25%", backgroundColor: "#c3d3eb" }}>
                            <Typography variant="h4">Create Post</Typography>
                            <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", alignItems: "center", backgroundColor: "white", borderRadius: "5px" }}>
                                <TextField id="title" label="Title" variant="outlined" style={{ width: "95%", margin: "25px" }} />
                                <TextField id="description" label="Description" variant="outlined" style={{ width: "95%", margin: "25px" }} multiline minRows={20} />
                                <FormControlLabel control={<Checkbox id="unlisted" name="unlisted" />} onChange={() => setUnlisted(!unlisted)} label="Unlisted" />
                                <FormControlLabel control={<Checkbox id="visibility" name="visibility" onChange={() => setVisibility(!visibility)} />} label="Friends Only" />
                            </Box>
                            <Box style={{ alignSelf: "flex-end" }}>
                                <Button variant="contained" color="primary" onClick={() => CreatePost(document.getElementById("title").value, document.getElementById("description").value)} style={{ margin: 10, alignSelf: "flex-end" }}>
                                    Create
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => setcreatePost(false)} style={{ margin: 10, alignSelf: "flex-end" }}>
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