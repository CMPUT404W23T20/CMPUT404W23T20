import React from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography, MenuItem, InputLabel, ListItemText } from '@material-ui/core';
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Nav from './Nav';
import axios from 'axios';
import { FormControl, Modal, getTextFieldUtilityClass } from '@mui/material';
import { getApiUrls } from '../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';
import jwt_decode from "jwt-decode";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

function Posts() {
    const [Posts, setPosts] = React.useState([]);
    const [followingPosts, setFollowingPosts] = React.useState([]);
    const [Comments, setComments] = React.useState([]);
    const [publicComments, setPublicComments] = React.useState([]);
    const [Likes,setLikes] = React.useState([]);
    const [loadingFollowing, setLoadingFollowing] = React.useState(false);
    const [loadingPosts, setLoadingPosts] = React.useState(false);
    const [friends, setFriends] = React.useState([]);
    const [friend, setFriend] = React.useState([]);

    const getFriends = async () => {
        // gets all friends for use in creating posts
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/followers`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        let friends = response.data.items;
        setFriends(friends);
    }

    const handleRepost = async (post) => {
        post.source = `${getApiUrls()}/service/authors/` + localStorage.getItem("id")
        // if no friends selected, send to all friends
        if (friend.length == 0) {
            for (let i = 0; i < friends.length; i++) {
                friend.push(friends[i].displayName)
            }
        }
        // send to all friend with display name in friend
        for (let i = 0; i < friend.length; i++) {
            // get id of friend in friends with display name = friend[i]
            let id = ""
            for (let j = 0; j < friends.length; j++) {
                if (friends[j].displayName == friend[i]) {
                    id = friends[j].id
                    break
                }
            }
            // send post to friend
            let path = `${getApiUrls()}/service/authors/${id}/inbox`;
            let response = await axios.post(path, post, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    });
            console.log(response)
        }
    }

    const handleChange = (event) => {
        const {
          target: { value },
        } = event;
        setFriend(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
      };

    const getFeed = async () => {
        /* 1.get all our friends put into a list
           2.enter the id of friend's posts then put all visibilty = friends in another list */

        let following = await axios.get(`${getApiUrls()}/service/authors/${localStorage.getItem("id")}/following`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        /*
        let followingList = following.data.items
        let allFollowingPosts = []
        let username = "Group20"
        let password = "jn8VWYcZDrLrkQDcVsRi"
        let authG6 = "Basic " + btoa(username + ":" + password);
        for (let fpost = 0; fpost < followingList.length; fpost++) { //for loop to get Following's posts
            let followee = followingList[fpost]
            let id = followee.id.split("/").pop();
            let path = followee.host + "/service/authors/" + id + "/posts";
            if (followee.host == "https://social-distribution-media.herokuapp.com/api") {
                path = followee.host + "/authors/" + id + "/posts";
            }
            if (followee.host == "https://group-13-epic-app.herokuapp.com/") {
                path = followee.host + "api/authors/" + id + "/posts";
            }
            if (followee.host == "https://cmput404-group6-instatonne.herokuapp.com") {
                id = id.replace(/-/g, '');
                path = followee.host + "/authors/" + id + "/posts";
            }
            if (followee.host == "https://distributed-social-net.herokuapp.com/") {
                id = id.replace(/-/g, '');
                path = followee.host + "service/authors/" + id + "/posts";
            }
            console.log("path",path)
            // for when group 6 has authorization working
            // (followee.host == "https://cmput404-group6-instatonne.herokuapp.com") ? "Basic R3JvdXAyMDpncm91cDIwY21wdXQ0MDQ=" : ""
            let followingPosts = await axios.get(path, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": (followee.host == path) ? "Bearer " + localStorage.getItem("token") : (followee.host == "https://social-distribution-media.herokuapp.com/api") ? authG6 : (followee.host == "https://cmput404-group6-instatonne.herokuapp.com") ? "Basic R3JvdXAyMDpncm91cDIwY21wdXQ0MDQ=" : ""
                }
            }).catch((error) => {
                console.log("error", error)
            });
            // add all posts to allFollowingPosts if request was successful
            if (followingPosts != undefined) allFollowingPosts = allFollowingPosts.concat(followingPosts.data.items ? followingPosts.data.items : followingPosts.data)
        }
        console.log("followingPosts", allFollowingPosts)
        setFollowingPosts(allFollowingPosts)
        setLoadingFollowing(true)
        */
        // get all local public posts
        let path = `${getApiUrls()}/service/posts`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        let posts = response.data.items;

        // remove posts that are in allFollowingPosts by id
        /*
        posts = posts.filter((post) => {
            for (let i = 0; i < allFollowingPosts.length; i++) {
                if (post.id == allFollowingPosts[i].id) {
                    return false
                }
            }
            return true
        })
        */


        console.log("posts", posts)
        setPosts(posts);
        setLoadingPosts(true)


        let commentList = []
        let publicComments = []
        let publicLikeList = []

        //get all comments in the "Public Posts" header
        for (let i = 0; i < posts.length; i++) {

            let commentListPath = `${getApiUrls()}` + "/service/authors/" + posts[i].author.id + "/posts/" + posts[i].id + "/comments";
            let comments = await axios.get(commentListPath, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });
            let commentDataList = comments.data.items
            if (commentDataList == undefined) commentDataList = []
    
            for (let i = 0; i < commentDataList.length; i++) {
                    commentList.push(commentDataList[i])
            }


            //get likes 

            let likesPath = `${getApiUrls()}` + "/service/authors/" + posts[i].author.id + "/posts/" + posts[i].id + "/likes";
            let likes = await axios.get(likesPath, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });
            let likeCount= likes.data.items.length
            let obj = {}
            obj[`${posts[i].id}`] = likeCount //store the like count as an array of dictionaries
            publicLikeList.push(obj)
        }

        /*
        for (let i = 0; i < allFollowingPosts.length; i++) {
            //getting comments for LOCAL posts
            if (typeof allFollowingPosts[i].author !== 'undefined') { //running into weird bug at :3000 host w/out this
                if (allFollowingPosts[i].author.host === "https://t20-social-distribution.herokuapp.com") {
                    let commentListPath = `${getApiUrls()}` + "/service/authors/" + allFollowingPosts[i].author.id + "/posts/" + allFollowingPosts[i].id + "/comments";
                    let comments = await axios.get(commentListPath, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    });
                    let commentDataList = comments.data.items
                    for (let i = 0; i < commentDataList.length; i++) {
                        commentList.push(commentDataList[i])
                    }
                    let likesPath = `${getApiUrls()}` + "/service/authors/" + allFollowingPosts[i].author.id + "/posts/" + allFollowingPosts[i].id + "/likes";
                    let likes = await axios.get(likesPath, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    });
                    let likeCount= likes.data.items.length
                    let obj = {}
                    obj[`${allFollowingPosts[i].id}`] = likeCount
                    publicLikeList.push(obj)
                }
            }
        }
        */
        console.log("likes",publicLikeList)
        setLikes(publicLikeList)
        setComments(commentList)
    }

    React.useEffect(() => {
        if (localStorage.getItem("token") != null) {
            getFeed()
            getFriends()
        }
    }, []);

    const [commentPosted, setCommentPosted] = React.useState(false);
    const postComment = async (comment, post, authorId) => {
        let id = post.author.id.split("/").pop()
        let path = `${getApiUrls()}` + "/service/authors/" + authorId + "/posts/" + post.id + "/comments";

        if (post.author.host == "https://social-distribution-media.herokuapp.com/api") {
            path = post.author.id + "/inbox"
        }
        if (post.author.host == "https://group-13-epic-app.herokuapp.com/") {
            path = post.author.id + "/inbox/" //send to inbox
        }
        if (post.author.host == "https://cmput404-group6-instatonne.herokuapp.com") { //have not verified this group to check if path is correct
            path = post.author.id + "/inbox";
        }
        if (post.author.host == "https://distributed-social-net.herokuapp.com/") {
            path = post.author.id + "/inbox"
        }

        if (post.author.host === "https://t20-social-distribution.herokuapp.com") { //sending this comment to a local post
            let data = {
                author: localStorage.getItem("id"),
                comment: comment,
                post: post.id
            }

            //post to comments
            let postComment = await axios.post(path, data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            //post to inbox
            path = `${getApiUrls()}/service/authors/${post.author.id}/inbox`;
            await axios.post(path, postComment.data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }).catch((error) => {
                console.log(error);
            });
        }
        else { //comment to a foreign node
            let data = {
                "type": "comment",
                "author": "https://t20-social-distribution.herokuapp.com/service/authors/" + localStorage.getItem("id"),  //author of this comment
                "contentType": "text/plain",
                "comment": comment, //comment user made
                "post": post.id, //author of the post
            }

            let username = "Group20"
            let password = "jn8VWYcZDrLrkQDcVsRi"
            let authG6 = "Basic " + btoa(username + ":" + password);

            await axios.post(path, data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": (post.author.host == path) ? "Bearer " + localStorage.getItem("token") : (post.author.host == "https://social-distribution-media.herokuapp.com/api") ? authG6 : (post.author.host == "https://cmput404-group6-instatonne.herokuapp.com") ? "Basic R3JvdXAyMDpncm91cDIwY21wdXQ0MDQ=" : ""

                }
            }).catch((error) => {
                console.log(error);
            });
            console.log(data)


        }


        setCommentPosted(true);
        getFeed()
        //clear the input box after sending comment*/
        document.getElementById("comment").value = ""
        document.getElementById("postedComment").style.display = "Block"

        setTimeout(
            function () {
                setCommentPosted(false);
            }, 5000);
    }

    const userInfo = () =>{           
        let token = localStorage.getItem("token")
        if (token === null ){
            console.log("Not logged in");
         
        }
        var decoded = JSON.stringify(jwt_decode(token));
       
        var decode_info= JSON.parse(decoded)
        //console.log(decode_info)
        return decode_info;
        
    };

    //check if you've already sent a like object 
    //avoid duplicates
    const [likedAlready, setLikedAlready] = React.useState(false);
    const likeExists = async(object) =>{
        let path = `${getApiUrls()}/service/authors/`+localStorage.getItem("id") + "/liked";
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+localStorage.getItem("token")
            }
            }).catch((error) => {
                console.log(error);
             });
        let items = response.data.items
        for (let i = 0; i < items.length; i++){
            if (items[i].object === object){
                return true;
            }
        }
        return false;
        
    }
    const likeObject= async(object) =>{
        /* Make 2 posts requests for a local post
         1) Add to the author's "liked" url
         2) Post to inbox (only this for foreign posts)
        */

       //check if like already exists
        let existingLike = false
        if (object.author.host === "https://t20-social-distribution.herokuapp.com"){
            const objectURL = (object.type === "post") ? object.origin : object.post.origin +"/comments/" + object.id
            existingLike = await(likeExists(objectURL))
        }
        else{ //checking using id of foreign comment/post
            const objectLikeExists = object.id;
            existingLike = await(likeExists(objectLikeExists))
        }
        
        if (existingLike === true){ //person has already liked this
            setLikedAlready(true)
            return //don't got through with the rest of this function
        }
    
        //local to local like 
        let author =userInfo()
        let path = `${getApiUrls()}/service/authors/`+author.user_id+ "/liked";
        let objectType = (object.type ==="post")? "Post":"Comment"
        let objectOrigin = (objectType === "Post") ? object.origin : object.post.origin +"/comments/" + object.id

        if (object.author.host === "https://t20-social-distribution.herokuapp.com"){
            let data ={}
            if (object.type.toLowerCase() === "post") { //liked post
                 data = { 
                    author: localStorage.getItem("id"),
                    post:object.id,
                    summary: `${author.username} likes your ${object.type}`,
                    objectLiked: objectType,
                    object: objectOrigin,             
                }
            }
            else{ //liked comment
                data = { 
                    author: localStorage.getItem("id"),
                    comment: object.id,
                    summary: `${author.username} likes your ${object.type}`,
                    objectLiked: objectType,
                    object: objectOrigin,    
                }
            }
            

            let postLike = await axios.post(path, data, {  //send this to author liked
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer "+localStorage.getItem("token")
                }
            });
    
            let inboxPath = `${getApiUrls()}/service/authors/${object.author.id}/inbox`; //send this to inbox of whoever posted
                    await axios.post(inboxPath, postLike.data, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer "+localStorage.getItem("token")
                        }
                    }).catch((error) => {
                        console.log(error);
                });

        }
        else{ //foreign node

            let inboxPath = object.author.id+"/inbox";
            if ( object.author.host == "https://group-13-epic-app.herokuapp.com/"){
                inboxPath = object.author.id+"/inbox/" //send to inbox
             }

            let foreignLikeData = {
            author:`${getApiUrls()}/service/authors/`+ localStorage.getItem("id"),
            object: object.id,
            type: "Like",
          }
          
          let username = "Group20"
          let password = "jn8VWYcZDrLrkQDcVsRi"
          let authG6 = "Basic " + btoa(username + ":" + password);

          await axios.post(inboxPath, foreignLikeData, { //send this to commentor's inbox
            headers: {
                "Content-Type": "application/json",
                "Authorization" : (object.author.host == path) ? "Bearer " + localStorage.getItem("token") : (object.author.host == "https://social-distribution-media.herokuapp.com/api") ? authG6 : (object.author.host == "https://cmput404-group6-instatonne.herokuapp.com") ? "Basic R3JvdXAyMDpncm91cDIwY21wdXQ0MDQ=" : ""

            }
            }).catch((error) => {
            console.log(error);
            });


            if (object.type.toLowerCase() === "comment"){
               
                let inboxPath = `https://t20-social-distribution.herokuapp.com/service/authors/${object.author.id}/inbox`; //send this to inbox of whoever posted
                await axios.post(inboxPath, foreignLikeData, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer "+localStorage.getItem("token")
                    }
                }).catch((error) => {
                    console.log(error);
                });

            }
        }
        setLikedAlready(true)
        getFeed()
    }
    
    const [openPost, setopenPost] = React.useState(false);
    const [post, setPost] = React.useState([{}]);
    const [openComments, setOpenComments] = React.useState(false);
    const [selectedFriends, setSelectedFriends] = React.useState();
    const [repostModal, setRepostModal] = React.useState(false);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", alignItems: "left", justifyContent: "left" }}>
                <Box style={{ width: "170px" }}>
                    <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh" }}>
                    <Box style={{ display: "flex", flexDirection: "row", flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", backgroundColor: "#c3d3eb" }}>
                        {/*<Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px" }}>
                            <Typography variant="h4">Following's Public Posts</Typography>
                            <List style={{ flex: 1, overflowY: "scroll", maxHeight: "100%" }}>
                                {!loadingFollowing && <CircularProgress />}
                                {loadingFollowing && followingPosts.map((post) => (
                                    <ListItem key={post.id} onClick={() => { setopenPost(true); setPost(post) }}>
                                        <Card style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
                                            <Box style={{ paddingLeft: 2 }}>
                                                {(post.type === 'post') && (<Box style={{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px" }}>
                                                    <img src={(post.author.profileImage != "no profileImage" && post.author.profileImage != "") ? post.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ borderRadius: "50%" }} width="100px" height="100px" />
                                                    <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px" }}>
                                                        <Typography variant="h5">Title: {post.title}</Typography>
                                                        <Typography variant="body2">Author: {post.author.displayName}</Typography>
                                                        <Typography variant="body2">Published: {post.published.substring(0, 10)}</Typography>
                                                        <Typography variant="body2">Node: {post.author.host}</Typography>
                                                        {Likes.map((likes,index) => (likes[post.id]) ?
                                                        <Typography variant="body2">Likes: {likes[post.id]} </Typography>:<div style={{ display: "none"}}></div>)}
                                                    </Box>
                                                </Box>)}
                                            </Box>
                                        </Card>
                                    </ListItem>
                                ))}
                            </List>
                                </Box>*/}
                        <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px" }}>
                            <Typography variant="h4">Local Public Posts</Typography>
                            <List style={{ flex: 1, overflowY: "scroll", maxHeight: "100%" }}>
                                {!loadingPosts && <CircularProgress />}
                                {loadingPosts && Posts.map((post) => (
                                    
                                    <ListItem key={post.id} onClick={() => { setopenPost(true); setPost(post) }}>
                                        <Card style={{ width: "100%" }}>
                                            <Box style={{ paddingLeft: 2 }}>
                                                {(post.type === 'post') && (<Box style={{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px" }}>
                                                    <img src={(post.author.profileImage != "no profileImage" && post.author.profileImage != "") ? post.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ borderRadius: "50%" }} width="100px" height="100px" />
                                                    <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px" }}>
                                                        <Typography variant="h5">Title: {post.title}</Typography>
                                                        <Typography variant="body2">Author: {post.author.displayName}</Typography>
                                                        <Typography variant="body2">Published: {post.published.substring(0, 10)}</Typography>
                                                        <Typography variant="body2">Node: {post.author.host}</Typography>
                                                        {Likes.map((likes) => (likes[post.id]) ?
                                                        <Typography variant="body2">Likes: {likes[post.id]} </Typography>:<div style={{ display: "none"}}></div>)}
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
                        <Box style={{ flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", backgroundColor: "#c3d3eb", display: "flex", flexDirection: "column" }}>
                            <Card style={{ marginRight: "10px", marginBottom: "10px", marginLeft: "10px", borderRadius: "10px", borderColor: "black", marginTop: "5px", flex: 1, overflowY: "scroll" }}>
                                <Typography variant="h2">{post.title}</Typography>
                                <Box>
                                    <img src={(post.author.profileImage != "no profileImage" && post.author.profileImage != "") ? post.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ borderRadius: "50%" }} width="100px" height="100px" />
                                    <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px", alignItems: "cen", justifyContent: "left" }}>
                                        <Typography variant="body2">Author: {post.author.displayName}</Typography>
                                        <Typography variant="body2">Published: {post.published.substring(0, 10)}</Typography>
                                        <Typography variant="body2">Node: {post.author.host}</Typography>     
                                    </Box>
                                </Box>
                                <Typography variant="h5">Description:</Typography>
                                <Typography variant="body2">{post.description}</Typography>
                                {post.image_data ? (
                                    <Card style={{ marginRight: "10px", marginBottom: "10px", marginLeft: "10px", borderRadius: "10px", borderColor: "black", marginTop: "5px", flex: 1 }}>
                                        <img src={`data:image/png;base64,${post.image_data}`} alt="Post Image" style={{ width: "100%" }} />
                                    </Card>
                                ) : null}
                                <div id="postedComment" style={{ display: "none", borderRadius: "25px", backgroundColor: "#bce3c0", width: "40%", margin: "10px", paddingLeft: "5%", marginLeft: "30%" }}>
                                    <Typography variant="h6" style={{ textAlign: "left", fontSize: 15 }}>
                                        {commentPosted ? "Your comment has been sent!" : ""}
                                    </Typography>
                                </div>
                                <Button variant="contained" color="secondary" onClick={() => openComments ? setOpenComments(false) : setopenPost(false)} style={{ position: "absolute", bottom: "30px", right: "30px" }}>
                                    Close
                                </Button>
                                {!openComments && (
                                    <div>
                                        <Button variant="contained" color="primary" onClick={() => setOpenComments(true)} style={{ position: "absolute", bottom: "30px", right: "120px"}}>
                                        Comments
                                       </Button> 
                                       <Button variant="contained" title = "like"color="secondary" startIcon={<FavoriteBorderIcon />} onClick ={() => likeObject(post)}style={{position: "absolute", bottom: "30px", right: "400px"}}   >  
                                        Like
                                        </Button> 
                                    </div>
                                    
                                )}
                                <Button onClick = {() => {setRepostModal(true)}} style={{ position: "absolute", bottom: "30px", right: openComments ? "120px" : "250px" }} color='primary' variant='contained'>Repost</Button>
                            </Card>
                            {openComments && (
                                <Card style = {{ marginRight: "10px",marginBottom: "10px",marginLeft: "10px", borderRadius: "10px", borderColor: "black",marginTop: "5px",flex:1, overflowY: "scroll"}}>
                                    <TextField id="comment" label="Comment..." variant="outlined" style={{width: "75%", margin: "25px"}}/>            
                                    <Button variant="contained" color="primary" onClick ={() => postComment(document.getElementById("comment").value,post,`${post.author.id}`)}   style={{ margin: 10,position:"relative",top:"25px"}}>Comment</Button>
                                    {(`${post.author.id}`=== localStorage.getItem("id")) ? <Typography variant="h6" style = {{textAlign:"left", paddingLeft:30,fontSize:20}}>Comments:</Typography> :<h2></h2> }                                       
                                         {Comments.map((comments) => (
                                            (((`${comments.post.id}` === `${post.id.split("/").pop()}`) && (`${post.visibility}`=== "PUBLIC")) ? 
                                            ( <div style = {{display:'flex',alignItems:'center',wordWrap:"break-word"}}>
                                                <img src= {comments.author.profileImage} alt = "" style = {{borderRadius:"50%",marginLeft:30,marginRight:15,marginBottom:10}} width={55} height = {55}/>
                                                <Typography variant="h6" style = {{display: "inline-block",textAlign:"left", paddingLeft:15,fontSize:20}}>
                                                    {comments.author.displayName}: {comments.comment}
                                                </Typography>
                                               
                                               <IconButton id = "heartButton" variant="outlined" color = "secondary" aria-label="likeComment" onClick ={() => likeObject(comments)}   style = {{ marginLeft:15}}>
                                                    <FavoriteBorderIcon />
                                                </IconButton>
                                                    
                                            </div>
                                            )
                                            : (<h2></h2>))
                                            
                                    ))}

                                 
                                      
                                </Card>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
            <Modal open={repostModal} onClose={() => {setRepostModal(false); setFriend([])}} style={{ display: "flex", alignItems: "center", justifyContent: "center" }} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
                <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                    <Card style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="h4">Repost</Typography>
                        <FormControl style={{ width: "100%", margin: "10px" }}>
                            <InputLabel htmlFor="repostTitle">friend</InputLabel>
                            <Select id="repostTitle" label="friend" renderValue={(selected) => selected.join(', ')} multiple MenuProps = {{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } } }} onChange ={handleChange} value={friend}>
                                {friends.map((friendItem) => (
                                    <MenuItem key={friendItem.id} value={friendItem.displayName}>
                                        <Checkbox checked={friend.indexOf(friendItem.displayName) > -1} />
                                        <ListItemText primary={friendItem.displayName} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" onClick={() => handleRepost(post)} style={{ margin: 10, position: "relative", top: "25px" }}>Repost</Button>
                    </Card>
                </Box>
            </Modal>
        </Box>
    )
}

export default Posts;