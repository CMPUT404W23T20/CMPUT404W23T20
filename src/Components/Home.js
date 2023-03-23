import React from 'react';
import { Box, Button, Card,List, ListItem, TextField, Typography } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import { getTextFieldUtilityClass } from '@mui/material';
import { getApiUrls } from '../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';

function Posts() {
    const [Posts, setPosts] = React.useState([]);
    const [followingPosts,setFollowingPosts] = React.useState([]);

    const [loadingFollowing, setLoadingFollowing] = React.useState(false);
    const [loadingPosts, setLoadingPosts] = React.useState(false);
 
    const getFeed =  async() =>{
        /* 1.get all our friends put into a list
           2.enter the id of friend's posts then put all visibilty = friends in another list */
        
        let following = await axios.get(`${getApiUrls()}/service/authors/${localStorage.getItem("id")}/following`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        let followingList = following.data
        let allFollowingPosts = []
        let username = "Group20"
        let password = "jn8VWYcZDrLrkQDcVsRi"
        let authG6 = "Basic " + btoa(username + ":" + password);
        for (let fpost = 0; fpost < followingList.length; fpost++){ //for loop to get Following's posts
            let followee = followingList[fpost]
            let id = followee.id.split("/").pop();
            let path = followee.host+"/service/authors/"+id+"/posts";
            if (followee.host == "https://social-distribution-media.herokuapp.com"){
                path = followee.host+"/api/authors/"+id+"/posts";
            }
            if (followee.host == "https://group-13-epic-app.herokuapp.com/"){
                path = followee.host+"api/authors/"+id+"/posts/";
            }
            console.log("path",path)
            let followingPosts = await axios.get(path, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": (followee.host == path) ? localStorage.getItem("token") : (followee.host == "https://social-distribution-media.herokuapp.com") ? authG6 : (followee.host == "https://group-13-epic-app.herokuapp.com/") ? "Basic R3JvdXAxMzp0ZXN0dGVzdHRlc3Q=" : "" 
                }
            }).catch((error) => {
                console.log("error",error)
            });
            // add all posts to allFollowingPosts if request was successful
            if (followingPosts != undefined) allFollowingPosts = allFollowingPosts.concat(followingPosts.data.items ? followingPosts.data.items : followingPosts.data)
        }
        console.log("followingPosts",allFollowingPosts)
        setFollowingPosts(allFollowingPosts)
        setLoadingFollowing(true)

        let path = `${getApiUrls()}/service/posts`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        let posts = response.data;
        // remove posts that are in allFollowingPosts by id
        posts = posts.filter((post) => {
            for (let i = 0; i < allFollowingPosts.length; i++){
                if (post.id == allFollowingPosts[i].id){
                    return false
                }
            }
            return true
        })
        
        console.log("posts",posts)
        setPosts(posts);
        setLoadingPosts(true)
    }


    React.useEffect(() => {
        getFeed()
        
    }, []);
    

    const [openPost, setopenPost] = React.useState(false);
    const [post, setPost] = React.useState([{}]);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height : "100vh", width: "100vw", alignItems: "left", justifyContent: "left"}}>
                <Box style={{width: "170px"}}>
                <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh"}}>
                    <Box style={{display: "flex", flexDirection: "row",flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", backgroundColor: "#c3d3eb"}}>
                        <Box style = {{ display: "flex", flexDirection: "column", flex: 1, margin: "10px"}}>
                            <Typography variant="h4">Following's Posts</Typography>
                            <List style = {{ flex: 1, overflowY: "scroll", maxHeight: "100%"}}>
                                {!loadingFollowing && <CircularProgress />}
                                {loadingFollowing && followingPosts.map((post) => (
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
                        </Box>
                        <Box style = {{ display: "flex", flexDirection: "column", flex: 1, margin: "10px"}}>
                            <Typography variant="h4">Public Posts</Typography>
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
                        </Box>
                    </Box>
                    {openPost && (
                        <Box style={{flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", backgroundColor: "#c3d3eb"}}>
                            <Box style = {{backgroundColor: 'white', borderRadius: "5px", width: "96%", height: "96%", margin: "2%"}}>
                                <Typography variant="h2">{post.title}</Typography>
                                <Box>
                                    <img src= {(post.author.profileImage != "no profileImage" && post.author.profileImage != "") ? post.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt = "IMG" style = {{borderRadius:"50%"}} width="100px" height = "100px"/>
                                    <Box style = {{ display: "flex", flexDirection: "column", paddingLeft: "10px", alignItems: "cen", justifyContent: "left"}}>
                                        <Typography variant="body2">Author: {post.author.displayName}</Typography>
                                        <Typography variant="body2">Published: {post.published.substring(0,10)}</Typography>
                                        <Typography variant="body2">Node: {post.author.host}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h5">Description:</Typography>
                                <Typography variant="body2">{post.description}</Typography>
                                <Button variant="contained" color="secondary" onClick={() => setopenPost(false)} style={{ position: "absolute", bottom: "20px", right: "20px"}}>
                                    Close
                                </Button>
                            </Box>
                        </Box>
                        
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default Posts;