import React from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography, MenuItem, InputLabel, ListItemText  } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import { getApiUrls } from '../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';
import { TypeSpecimenOutlined } from '@mui/icons-material';
import jwt_decode from "jwt-decode";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { FormControl, Modal, getTextFieldUtilityClass } from '@mui/material';



function Inbox() {
    const [loading, setLoading] = React.useState(true);
    const [friends, setFriends] = React.useState([]);
    const [friend, setFriend] = React.useState([]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setFriend(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const getFriends = async () => {
        // gets all friends for use in creating posts
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/friends`;
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
        console.log("repost", post)
        console.log("sending to", friend)
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
    const get_inbox_items = async () => {
        setLoading(true);
        // get inbox items
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/inbox`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        let responseItems = response.data.items;
        console.log(responseItems);
        // get all posts in postsURLs and replace with post object
        for (let i = 0; i < responseItems.length; i++) {
            if (responseItems[i].type === "postURL") {
                console.log(responseItems[i].url);
                let path = responseItems[i].url;
                let postResponse = await axios.get(path, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }).catch((error) => {
                    // skip this post
                    console.log(error);
                });
                // replace postURL with post object
                if (postResponse) {
                    let source = responseItems[i].source;
                    responseItems[i] = postResponse.data;
                    responseItems[i].source = source;
                }
            }
        }
        // check if follow request is already accepted
        for (let i = 0; i < responseItems.length; i++) {
            if (responseItems[i].type === "follow") {
                let path = `${getApiUrls()}/service/authors/${responseItems[i].follower.id}/followers/${localStorage.getItem("id")}`;
                let response = await axios.get(path, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }).catch((error) => {
                    console.log(error);
                });
                if (response.data) {
                    // pop this item from the inbox
                    responseItems.splice(i, 1);
                    i--;
                }
            }
        }
        // get all source authors data
        for (let i = 0; i < responseItems.length; i++) {
            if (responseItems[i].type === "post") {
                if (!responseItems[i].source.includes(responseItems[i].origin)) {
                    let response = await axios.get(responseItems[i].source, {
                        headers: {
                            "Content-Type": "application/json",
                        }
                    }).catch((error) => {
                        console.log(error);
                    });
                    if (response && response.data) {
                        responseItems[i].source = response.data;
                    }
                }
            }
        }
        console.log(responseItems);
        setLoading(false);
        return response.data.items
    }

    const handleClear = async () => {
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/inbox`;
        let response = await axios.delete(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        get_inbox_items().then((data) => {
            setItems(data);
        });
    }

    const acceptFollow = async (follower) => {
        // add follow back to the follower
        let userId = localStorage.getItem("id");
        let path = `${getApiUrls()}/service/authors/${userId}/followers/${follower.id}`;
        let response = await axios.put(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        // refresh inbox
        setItems( await get_inbox_items());
        return response.data;
    }

    const [items, setItems] = React.useState([]);
    React.useEffect(() => {
        get_inbox_items().then((data) => {
            setItems(data);
        });
        getFriends();
    }, []);

    const [comments, setComments] = React.useState([]);
    const [loadingPost, setLoadingPost] = React.useState(false);

    const handleOpenPost = async (post) => {
        setopenPost(true);
        setLoadingPost(true);
        // get all information on post
        setComments([])
        let path
        let response
        // if https://t20-social-distribution.herokuapp.com is in the origin of the post, then we need to get the post from the local host
        if (post.origin.includes("t20-social-distribution.herokuapp.com")) {
            path = `${getApiUrls()}/service/authors/${post.author.id ? post.author.id : post.author}/posts/${post.id}`;
            console.log(path)
        } else {
            path = post.id
        }
        response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        post = response.data;
        setPost(post);

        // get comments on post
        let id = post.author.id.split("/").pop()
        if (id === localStorage.getItem("id")) {
            path = `${getApiUrls()}/service/authors/${post.author.id}/posts/${post.id}/comments`;
            response = await axios.get(path, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            setComments(response.data.items);
        }
        setLoadingPost(false);
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
                    post: object.post.id
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
    }



    const [openPost, setopenPost] = React.useState(false);
    const [post, setPost] = React.useState();
    const [repostModal, setRepostModal] = React.useState(false);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", alignItems: "left", justifyContent: "left" }}>
                <Box style={{ width: "170px" }}>
                    <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh" }}>
                    <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px", backgroundColor: "#c3d3eb" }}>
                        <Typography variant="h4">Inbox</Typography>
                        <List style={{ flex: 1, overflowY: "scroll", maxHeight: "100%" }}>
                            {loading && <CircularProgress />}
                            {!loading && items.map((item) => (
                                <ListItem key={item.id}>
                                    {item.type === "post" && (<Card style={{ width: "100%" }} onClick={() => { handleOpenPost(item) }}>
                                        <Box style={{ paddingLeft: 2 }}>
                                            {(item.type === 'post') && (<Box style={{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px" }}>
                                                <img src={(item.author.profileImage != "no profileImage" && item.author.profileImage != "") ? item.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ borderRadius: "50%" }} width="100px" height="100px" />
                                                <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px" }}>
                                                    <Typography variant="h5">Title: {item.title}</Typography>
                                                    {(item.source != item.origin) && (item.source != "No source") && (item.source != null) && (item.source && item.source.displayName) && (<Typography variant="body2">Sent By: {item.source.displayName}</Typography>)}
                                                    <Typography variant="body2">Author: {item.author.displayName}</Typography>
                                                    <Typography variant="body2">Published: {item.published.substring(0, 10)}</Typography>
                                                    <Typography variant="body2">Node: {item.author.host}</Typography>
                                                    <Typography variant="body2">Likes: {item.likes}</Typography>
                                                    
                                                </Box>
                                            </Box>)}
                                            <Button  variant="contained" title = "like" color="secondary" startIcon={<FavoriteIcon />} onClick ={() => likeObject(item)}    style={{position: "absolute", bottom: "30px", right: "400px"}}>
                                                        Like
                                            </Button>  
                                        </Box>
                                    </Card>)}
                                    {item.type === "comment" && (<Card style={{ width: "100%" }} onClick={() => { handleOpenPost(item.post) }}>
                                        <Box style={{ paddingLeft: 2 }}>
                                            <Box style={{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px" }}>
                                                <img src={(item.author.profileImage != "no profileImage" && item.author.profileImage != "") ? item.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ borderRadius: "50%" }} width="100px" height="100px" />
                                                <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px" }}>
                                                    <Typography variant="h5">Comment: {item.comment}</Typography>
                                                    <Typography variant="body2">Author: {item.author.displayName}</Typography>
                                                    <Typography variant="body2">Published: {item.published.substring(0, 10)}</Typography>
                                                    <Typography variant="body2">Node: {item.author.host}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Card>)}
                                    {item.type == "followRequest" && (<Card style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between" }} onClick={() => setopenPost(false)}>
                                        <Box style={{ paddingLeft: 2 }}>
                                            <Box style={{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px" }}>
                                                <img src={(item.follower.profileImage != "no profileImage" && item.follower.profileImage != "") ? item.follower.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ borderRadius: "50%" }} width="100px" height="100px" />
                                                <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px" }}>
                                                    <Typography variant="h5">Follow Request</Typography>
                                                    <Typography variant="body2">Author: {item.follower.displayName}</Typography>
                                                    <Typography variant="body2">Node: {item.follower.host}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Button id={item.follower} style={{ margin: 42, alignSelf: "flex-end", backgroundColor: "lightblue" }} onClick={() => acceptFollow(item.follower)} variant="contained">
                                            Accept
                                        </Button>
                                    </Card>)}    
                                    {item.type.toLowerCase() === "like" && (
                                                <Card style = {{ width: "100%"}} onClick={() => { handleOpenPost(item.post) }}> 
                                                    <Box style = {{ paddingLeft: 2}}>
                                                        <Box style = {{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px"}}>
                                                        <img src= {(item.author.profileImage != "no profileImage" && item.author.profileImage != "") ? item.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt = "IMG" style = {{borderRadius:"50%"}} width="100px" height = "100px"/>   
                                                        <Box style = {{ display: "flex", flexDirection: "column", paddingLeft: "10px"}} >
                                                            <Typography variant="h5">{item.summary}</Typography>
                                                             {(`${item.objectLiked}`==="Comment") ? (<Typography>Comment: "{item.comment.comment}"</Typography>): 
                                                                <Box>
                                                                    <Typography variant="body2">Author: {item.author.displayName}</Typography>
                                                                    <Typography variant="body2">Node: {item.author.host}</Typography>
                                                                </Box>
                                                                
                                                             }
                                                        </Box>
                                                        </Box>
                                                        
                                                    </Box>
                                                   
                                                </Card>
                                        )}
                                </ListItem>
                            ))}
                        </List>
                        <Button variant="contained" color="secondary" onClick={() => handleClear()} style={{ margin: 10, alignSelf: "flex-end" }}>
                            Clear
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => get_inbox_items().then((data) => { setItems(data); })} style={{ margin: 10, alignSelf: "flex-end" }}>
                            Refresh
                        </Button>
                    </Box>
                    {openPost && (
                        <Box style={{ flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", backgroundColor: "#c3d3eb", display: "flex", flexDirection: "column", overflowY: "scroll" }}>
                            {loadingPost && <CircularProgress />}
                            {!loadingPost && <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                <Card style={{ marginRight: "10px", marginBottom: "10px", marginLeft: "10px", borderRadius: "10px", borderColor: "black", marginTop: "5px", flex: 1 }}>
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
                                    </div>
                                    <Button variant="contained" color="secondary" onClick={() => setopenPost(false)} style={{ position: "absolute", bottom: "30px", right: "30px" }}>
                                        Close
                                    </Button>
                                    <Button onClick = {() => {setRepostModal(true)}} style={{ position: "absolute", bottom: "30px", right: "120px" }} color='primary' variant='contained'>Repost</Button>
                                </Card>
                                {(comments.length > 0) && <Card style={{ marginRight: "10px", marginBottom: "10px", marginLeft: "10px", borderRadius: "10px", borderColor: "black", marginTop: "5px", flex: 1, overflowY: "scroll" }}>
                                    <Typography variant="h6" style={{ textAlign: "left", paddingLeft: 30, fontSize: 20 }}>Comments:</Typography>
                                    {comments.map((comments) => (
                                        <div style={{ display: 'flex', alignItems: 'center', wordWrap: "break-word" }}>
                                            <img src={comments.author.profileImage} alt="" style={{ borderRadius: "50%", marginLeft: 30, marginRight: 15, marginBottom: 10 }} width={55} height={55} />
                                            <Typography variant="h6" style={{ display: "inline-block", textAlign: "left", paddingLeft: 15, fontSize: 20 }}>
                                                {comments.author.displayName}: {comments.comment}
                                            </Typography>
                                        </div>
                                    ))}
                                </Card>}
                            </Box>}
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

export default Inbox;


