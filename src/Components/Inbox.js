import React from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography, MenuItem, InputLabel, ListItemText } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
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
import MuiMarkdown from 'mui-markdown';




function Inbox() {
    const [loading, setLoading] = React.useState(true);
    const [friends, setFriends] = React.useState([]);
    const [friend, setFriend] = React.useState([]);
    const [Likes, setLikes] = React.useState([]);
    const [commentPosted, setCommentPosted] = React.useState(false);


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
        // if friend is empty, send to all friends
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
            if (responseItems[i].type === "followRequest") {
                let path = `${getApiUrls()}/service/authors/${responseItems[i].follower.id}/followers/${localStorage.getItem("id")}`;
                let response = await axios.get(path, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }).catch((error) => {
                    console.log(error);
                });
                console.log(response)
                if (response.data) {
                    // pop this item from the inbox
                    responseItems.splice(i, 1);
                    i--;
                }
            }
        }
        // get all source authors data
        let likeList = []
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
                let likesPath
                // if https://t20-social-distribution.herokuapp.co is in the origin, then it is a local post
                if (responseItems[i].origin.includes("https://t20-social-distribution.herokuapp.co")) {
                    likesPath = `${getApiUrls()}` + "/service/authors/" + responseItems[i].source.id + "/posts/" + responseItems[i].id + "/likes";
                } else {
                    likesPath = responseItems[i].id + "/likes";
                }
                let likes = await axios.get(likesPath, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                });
                let likeCount = 0;
                if (likes && likes.data && likes.data.items) {
                    likeCount = likes.data.items.length;
                }
                let obj = {}
                obj[`${responseItems[i].id}`] = likeCount //store the like count as an array of dictionaries
                likeList.push(obj)
            }
        }
        console.log("look at these likes:", likeList)
        console.log(responseItems);

        setLikes(likeList)
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
        setItems(await get_inbox_items());
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
        //console.log(id, localStorage.getItem("id"))
        //if (id === localStorage.getItem("id")) {
        if (post.origin.includes("t20-social-distribution.herokuapp.com")) {
            path = `${getApiUrls()}/service/authors/${post.author.id}/posts/${post.id}/comments`;
        } else {
            path = post.id + "/comments";
        }
        response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        console.log(response)
        if (response && response.data && response.data.items) setComments(response.data.items);
        else {
            if (response && response.data && response.data.comments) setComments(response.data.comments);
        }
        //}
        setLoadingPost(false);
    }
    const userInfo = () => {
        let token = localStorage.getItem("token")
        if (token === null) {
            console.log("Not logged in");

        }
        var decoded = JSON.stringify(jwt_decode(token));

        var decode_info = JSON.parse(decoded)
        //console.log(decode_info)
        return decode_info;

    };
    //check if you've already sent a like object 
    //avoid duplicates
    const likeExists = async (object) => {
        let path = `${getApiUrls()}/service/authors/` + localStorage.getItem("id") + "/liked";
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        }).catch((error) => {
            console.log(error);
        });
        let items = response.data.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].object === object) {
                return true;
            }
        }
        return false;

    }
    const likeObject = async (object) => {
        /* Make 2 posts requests for a local post
         1) Add to the author's "liked" url
         2) Post to inbox (only this for foreign posts)
        */

        //check if like already exists
        let existingLike = false
        if (object.author.host === "https://t20-social-distribution.herokuapp.com") {
            const objectURL = (object.type === "post") ? object.origin : object.post.origin + "/comments/" + object.id
            existingLike = await (likeExists(objectURL))
        }
        else { //checking using id of foreign comment/post
            const objectLikeExists = object.id;
            existingLike = await (likeExists(objectLikeExists))
        }

        if (existingLike === true) { //person has already liked this
            return //don't got through with the rest of this function
        }

        //local to local like 
        let author = userInfo()
        let path = `${getApiUrls()}/service/authors/` + author.user_id + "/liked";
        let objectType = (object.type === "post") ? "Post" : "Comment"
        let objectOrigin = (objectType === "Post") ? object.origin : object.post.origin + "/comments/" + object.id

        if (object.author.host === "https://t20-social-distribution.herokuapp.com") {
            let data = {}
            if (object.type.toLowerCase() === "post") { //liked post
                data = {
                    author: localStorage.getItem("id"),
                    post: object.id,
                    summary: `${author.username} likes your ${object.type}`,
                    objectLiked: objectType,
                    object: objectOrigin,
                }
            }
            else { //liked comment
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
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            let inboxPath = `${getApiUrls()}/service/authors/${object.author.id}/inbox`; //send this to inbox of whoever posted
            await axios.post(inboxPath, postLike.data, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }).catch((error) => {
                console.log(error);
            });

        }
        else { //foreign node

            let inboxPath = object.author.id + "/inbox";
            if (object.author.host == "https://group-13-epic-app.herokuapp.com/") {
                inboxPath = object.author.id + "/inbox/" //send to inbox
            }

            let foreignLikeData = {
                author: `${getApiUrls()}/service/authors/` + localStorage.getItem("id"),
                object: object.id,
                type: "Like",
            }

            let username = "Group20"
            let password = "jn8VWYcZDrLrkQDcVsRi"
            let authG6 = "Basic " + btoa(username + ":" + password);

            await axios.post(inboxPath, foreignLikeData, { //send this to commentor's inbox
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": (object.author.host == path) ? "Bearer " + localStorage.getItem("token") : (object.author.host == "https://social-distribution-media.herokuapp.com/api") ? authG6 : (object.author.host == "https://cmput404-group6-instatonne.herokuapp.com") ? "Basic R3JvdXAyMDpncm91cDIwY21wdXQ0MDQ=" : ""

                }
            }).catch((error) => {
                console.log(error);
            });


            if (object.type.toLowerCase() === "comment") {
                let inboxPath = `${object.author.host}/service/authors/${object.author.id}/inbox`; //send this to inbox of whoever posted
                await axios.post(inboxPath, foreignLikeData, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                }).catch((error) => {
                    console.log(error);
                });

            }


        }
        get_inbox_items();

    }

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

        handleOpenPost(post);
        setCommentPosted(true);
        //clear the input box after sending comment*/
        document.getElementById("comment").value = ""
        document.getElementById("postedComment").style.display = "Block"

        setTimeout(
            function () {
                setCommentPosted(false);
            }, 5000);
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
                        <List style={{ flex: 1, overflowY: "auto", maxHeight: "100%" }}>
                            {loading && <CircularProgress />}
                            {!loading && items.map((item) => (
                                <ListItem key={item.id}>
                                    {item.type === "post" && (
                                        <Card style={{ width: "100%" }} onClick={() => { handleOpenPost(item) }}>
                                            <Box style={{ paddingLeft: 2 }}>
                                                {item.type === 'post' && (
                                                    <Box style={{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px" }}>
                                                        <Avatar src={(item.author.profileImage != "no profileImage" && item.author.profileImage != "") ? item.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="Avatar" style={{ width: 70, height: 70 }} />
                                                        <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px" }}>
                                                            <Typography variant="h5">Title: {item.title}</Typography>
                                                            {(item.source != item.origin) && (item.source != "No source") && (item.source != null) && (item.source && item.source.displayName) && (<Typography variant="body2">Sent By: {item.source.displayName}</Typography>)}
                                                            <Typography variant="body2" style={{ fontWeight: 600 }} >Author: {item.author.displayName}</Typography>
                                                            <Typography variant="body2" style={{ color: "gray" }} >Published: {item.published.substring(0, 10)}</Typography>
                                                            <Typography variant="body2" style={{ color: "gray" }} >Node: {item.author.host}</Typography>
                                                            {Likes.map((likes) => (likes[item.id]) ?
                                                                <Typography variant="body2" style={{ color: "gray" }}  >Likes: {likes[item.id]}</Typography> : null)}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Card>
                                    )}
                                    {item.type === "comment" && (
                                        <Card style={{ width: "100%" }} onClick={() => { handleOpenPost(item.post) }}>
                                            <Box style={{ paddingLeft: 10, paddingTop: 10, paddingBottom: 10 }}>
                                                <Box style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                    <Avatar src={(item.author.profileImage != "no profileImage" && item.author.profileImage != "") ? item.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ width: 70, height: 70 }} />
                                                    <Box style={{ display: "flex", flexDirection: "column", paddingLeft: 10 }}>
                                                        <Typography variant="h5">Comment: {item.comment}</Typography>
                                                        <Typography variant="body2" style={{ fontWeight: 600 }}>{item.author.displayName}</Typography>
                                                        <Typography variant="body2" style={{ color: "gray" }}>{item.published.substring(0, 10)}</Typography>
                                                        <Typography variant="body2" style={{ color: "gray" }}>Node: {item.author.host}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Card>
                                    )}

                                    {item.type == "followRequest" && (
                                        <Card style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "10px" }} onClick={() => setopenPost(false)}>
                                            <Box style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                <Avatar src={(item.follower.profileImage != "no profileImage" && item.follower.profileImage != "") ? item.follower.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="Avatar" style={{ marginRight: "10px" }} />
                                                <Box>
                                                    <Typography variant="h5">Follow Request</Typography>
                                                    <Typography variant="body2">Author: {item.follower.displayName}</Typography>
                                                    <Typography variant="body2">Node: {item.follower.host}</Typography>
                                                </Box>
                                            </Box>
                                            <Button id={item.follower} style={{ backgroundColor: "lightblue" }} onClick={() => acceptFollow(item.follower)} variant="contained">
                                                Accept
                                            </Button>
                                        </Card>
                                    )}

                                    {item.type.toLowerCase() === "like" && (
                                        <Card style={{ width: "100%" }} onClick={() => { handleOpenPost(item.post) }}>
                                            <Box style={{ paddingLeft: 2 }}>
                                                <Box style={{ display: "flex", flexDirection: "row", marginTop: "10px", marginLeft: "10px" }}>
                                                    <Avatar src={(item.author.profileImage != "no profileImage" && item.author.profileImage != "") ? item.author.profileImage : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"} alt="IMG" style={{ width: 70, height: 70 }} />

                                                    <Box style={{ display: "flex", flexDirection: "column", paddingLeft: "10px" }} >
                                                        <Typography variant="h5">{item.summary}</Typography>
                                                        {(`${item.objectLiked}` === "Comment") ? (
                                                            <Box>

                                                                <Typography variant="body2" style={{ fontWeight: 600 }} >{item.author.displayName}</Typography>
                                                                <Typography variant="body2" style={{ color: "gray" }} >Node: {item.author.host}</Typography>
                                                                <Typography variant="body2" style={{ color: "gray" }}  >Comment: "{item.comment.comment}"</Typography>
                                                            </Box>
                                                        ) : (
                                                            <Box>
                                                                <Typography variant="body2" style={{ fontWeight: 600 }}  >{item.author.displayName}</Typography>
                                                                <Typography variant="body2" style={{ color: "gray" }}  >Node: {item.author.host}</Typography>
                                                            </Box>
                                                        )}
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
                        <Box style={{ flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", backgroundColor: "#c3d3eb", display: "flex", flexDirection: "column", overflowY: "auto" }}>
                            {loadingPost && <CircularProgress />}
                            {!loadingPost && <Box style={{ flex: 1, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
                                <Card style={{
                                    margin: "20px",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                    backgroundColor: "#fff",
                                    overflowY: "auto", 
                                    flex: 2
                                }}>
                                    <Typography variant="h4" style={{ marginBottom: "20px" }}>
                                        {post.title}
                                    </Typography>
                                    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>
                                        <img
                                            src={
                                                (post.author.profileImage !== "no profileImage" && post.author.profileImage !== "")
                                                    ? post.author.profileImage
                                                    : "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solid_white.svg/2048px-Solid_white.svg.png"
                                            }
                                            alt="Author Profile"
                                            style={{
                                                borderRadius: "50%",
                                                width: "50px",
                                                height: "50px",
                                                marginRight: "10px"
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="body2" style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                                                {post.author.displayName}
                                            </Typography>
                                            <Typography variant="body2" style={{ fontSize: "12px", color: "#999", marginBottom: "5px" }}>
                                                {post.published.substring(0, 10)} | {post.author.host}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {post.contentType === "text/markdown" ? (
                                        <MuiMarkdown>{post.description}</MuiMarkdown>
                                    ) : (
                                        <Typography variant="body1" style={{ marginBottom: "20px" }}>
                                            {post.description}
                                        </Typography>
                                    )}

                                    {(post.content && post.content.includes("base64")) ? (
                                        <Card style={{
                                            margin: "20px",
                                            padding: "20px",
                                            borderRadius: "10px",
                                            borderColor: "black",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}>
                                            <img
                                                src={post.content}
                                                alt="Post Image"
                                                style={{
                                                    width: "100%",
                                                    borderRadius: "10px"
                                                }}
                                            />
                                        </Card>) : (post.contentType === "text/markdown" ? (
                                        <MuiMarkdown>{post.content}</MuiMarkdown>
                                    ) : (
                                        <Typography variant="body1" style={{ marginBottom: "20px" }}>
                                            {post.content}
                                        </Typography>
                                    ))}
                                    {post.image_data && (
                                        <Card style={{
                                            margin: "20px",
                                            padding: "20px",
                                            borderRadius: "10px",
                                            borderColor: "black",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}>
                                            <img
                                                src={`data:image/png;base64,${post.image_data}`}
                                                alt="Post Image"
                                                style={{
                                                    width: "100%",
                                                    borderRadius: "10px"
                                                }}
                                            />
                                        </Card>
                                    )}
                                    <div
                                        id="postedComment"
                                        style={{
                                            display: "none",
                                            borderRadius: "25px",
                                            backgroundColor: "#bce3c0",
                                            width: "40%",
                                            margin: "20px auto",
                                            padding: "10px",
                                            textAlign: "center",
                                        }}
                                    ></div>
                                    <Button variant="contained" color="secondary" onClick={() => setopenPost(false)} style={{ position: "absolute", bottom: "30px", right: "30px" }}>
                                        Close
                                    </Button>
                                    <Button onClick={() => { setRepostModal(true) }} style={{ position: "absolute", bottom: "30px", right: "120px" }} color='primary' variant='contained'>Repost</Button>
                                    <Button variant="contained" title="like" color="secondary" startIcon={<FavoriteIcon />} onClick={() => likeObject(post)} style={{ position: "absolute", bottom: "30px", right: "500" }}>
                                        Like
                                    </Button>
                                </Card>
                                <Card style={{ marginRight: "10px", marginBottom: "10px", marginLeft: "10px", borderRadius: "10px", borderColor: "black", marginTop: "5px", flex: 1, overflowY: "auto" }}>
                                    <Typography variant="h6" style={{ textAlign: "left", paddingLeft: 30, fontSize: 20 }}>Comments:</Typography>
                                    <TextField id="comment" label="Comment..." variant="outlined" style={{ width: "70%" }} />
                                    <Button variant="contained" color="primary" onClick={() => postComment(document.getElementById("comment").value, post, `${post.author.id}`)} style={{ position: "relative", top: "7px" }}>Comment</Button>
                                    {(comments.length > 0) && comments.map((comments) => (
                                        <div style={{ display: 'flex', alignItems: 'center', wordWrap: "break-word" }}>
                                            <img src={comments.author.profileImage} alt="" style={{ borderRadius: "50%", marginLeft: 30, marginRight: 15, marginBottom: 10 }} width={55} height={55} />
                                            <Typography variant="h6" style={{ display: "inline-block", textAlign: "left", paddingLeft: 15, fontSize: 20 }}>
                                                {comments.author.displayName}: {comments.comment}
                                            </Typography>
                                        </div>
                                    ))}
                                </Card>
                            </Box>}
                        </Box>
                    )}
                </Box>
            </Box>
            <Modal open={repostModal} onClose={() => { setRepostModal(false); setFriend([]) }} style={{ display: "flex", alignItems: "center", justifyContent: "center" }} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
                <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                    <Card style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="h4">Repost</Typography>
                        <FormControl style={{ width: "100%", margin: "10px" }}>
                            <InputLabel htmlFor="repostTitle">friend</InputLabel>
                            <Select id="repostTitle" label="friend" renderValue={(selected) => selected.join(', ')} multiple MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } } }} onChange={handleChange} value={friend}>
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


