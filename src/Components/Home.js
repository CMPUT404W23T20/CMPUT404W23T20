import React from 'react';
import { Box, Button, Card,List, ListItem, TextField, Typography } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import { getTextFieldUtilityClass } from '@mui/material';
import { getApiUrls } from '../utils/utils';

function Posts() {
    const [Posts, setPosts] = React.useState([]);
    const [followingPosts,setFollowingPosts] = React.useState([]);
    const [Comments, setComments] = React.useState([]);
 
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
        let auth = "Basic " + btoa(username + ":" + password);
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
                    "Authorization": (followee.host == path) ? localStorage.getItem("token") : (followee.host == "https://social-distribution-media.herokuapp.com") ? auth : (followee.host == "https://group-13-epic-app.herokuapp.com/") ? "" : "" 
                }
            }).catch((error) => {
                console.log("error",error)
            });
            // add all posts to allFollowingPosts if request was successful
            if (followingPosts != undefined) allFollowingPosts = allFollowingPosts.concat(followingPosts.data.items ? followingPosts.data.items : followingPosts.data)
        }
        console.log("followingPosts",allFollowingPosts)
        setFollowingPosts(allFollowingPosts)

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
  
        setPosts(posts);

        let commentList = []

        //get all comments in the "Public Posts" header
        for (let i = 0; i < posts.length; i++){

            let commentListPath = `${getApiUrls()}`+"/service/authors/" + posts[i].author.id+ "/posts/" +posts[i].id+"/comments";
            let comments = await axios.get(commentListPath, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        let commentDataList = comments.data
        console.log("my comments", commentDataList)
        for (let i = 0; i < commentDataList.length; i++ ){
            commentList.push(commentDataList[i])  
        }
        }

        for (let i = 0; i < allFollowingPosts.length; i++){
            //getting comments for LOCAL posts
            if (allFollowingPosts[i].author.host == "https://t20-social-distribution.herokuapp.com"){

                let commentListPath = `${getApiUrls()}`+"/service/authors/" + allFollowingPosts[i].author.id+ "/posts/" + allFollowingPosts[i].id+"/comments";
                let comments = await axios.get(commentListPath, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                        }
                    });
                let commentDataList = comments.data
                for (let i = 0; i < commentDataList.length; i++ ){
                    commentList.push(commentDataList[i])  
                }
                
            }


        }

        




        //getting all comments in the "Following" header
        console.log("all comments",commentList)
        setComments(commentList)    
    }

    React.useEffect(() => {
        getFeed()
        
    }, []);
    

    const postComment = async(comment, postId, authorId) =>{
        console.log("comment: ",comment,postId,authorId)
        let path = `${getApiUrls()}`+"/service/authors/"+authorId+ "/posts/"+postId+"/comments";
        let data = {
            author: localStorage.getItem("id"),
            comment: comment,
            post: postId
        }
        let postComment = await axios.post(path, data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        //clear the input box after sending comment*/
        document.getElementById("comment").value = ""
        getFeed()
    }

    const loadComments = () =>{
        return console.log("length",Comments.length)
    }


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
                        <Typography variant="h4">Home</Typography>
                        <List style = {{ flex: 1, overflowY: "scroll"}}>
                            <Typography variant="h5">Following's Posts</Typography>
                            {followingPosts.map((post) => (
                                <ListItem key={post.id} onClick = {() => {setopenPost(true); setPost(post); loadComments();}}>
                                    <Card style = {{ width: "100%", backgroundColor: "#8fd1f2"}}>
                                        <Box style = {{ paddingLeft: 2}}>
                                            <Typography variant="h5">{post.title}</Typography>
                                            <Typography variant="body2">{post.author.displayName}</Typography>
                                            <Typography variant="body1" style={{maxHeight: "200px", overflowY: "auto"}}>{post.description}</Typography>
                                        </Box>
                                    </Card>
                                </ListItem>
                            ))}
                        
                            <Typography variant="h4">Public Posts</Typography>
                            {Posts.map((post) => (
                                <ListItem key={post.id} onClick = {() => {setopenPost(true); setPost(post)}}>
                                    <Card style = {{ width: "100%", backgroundColor: "#8fd1f2"}}>
                                        <Box style = {{ paddingLeft: 2}}>
                                            <Typography variant="h5">{post.title}</Typography>
                                            <Typography variant="body2">{post.author.displayName}</Typography>
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
                                         
                                    {Comments.map((comments) => (
                                       (`${comments.post.id}` === `${post.id.split("/").pop()}`) ? 
                                        (<h2>{comments.author.displayName}: {comments.comment}</h2>):(<h2></h2>)   
                                    ))}
                                     <TextField id="comment" label="Comment..." variant="outlined" style={{width: "75%", margin: "25px"}}/>
                                     <Button variant="contained" color="primary" onClick ={() => postComment(document.getElementById("comment").value,`${post.id}`,`${post.author.id}`)}   style={{ margin: 10,position:"relative",top:"25px"}}>Comment</Button>
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


