import React from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import { getApiUrls } from '../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';


function Inbox() {
    const [loading, setLoading] = React.useState(true);
    const get_inbox_items = async () => {
        setLoading(true);
        let path = `${getApiUrls()}/service/authors/${localStorage.getItem("id")}/inbox`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        let responseItems = response.data.items;
        // get all posts in postsURLs and replace with post object
        for (let i = 0; i < responseItems.length; i++) {
            if (responseItems[i].type === "postURL") {
                console.log(responseItems[i].url);
                let path = responseItems[i].url;
                let postResponse = await axios.get(path, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                // replace postURL with post object
                responseItems[i] = postResponse.data;
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
        console.log(response.data);
        get_inbox_items().then((data) => {
            setItems(data);
        });
    }

    const followBack = async (follower) => {
        let userId = localStorage.getItem("id");
        let path = `${getApiUrls()}/service/authors/${follower.id}/followers/${userId}`;
        let response = await axios.put(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        path = `${getApiUrls()}/service/authors/${follower.id}/inbox`;
        await axios.post(path, response.data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        return response.data;
    }

    const [items, setItems] = React.useState([]);
    React.useEffect(() => {
        get_inbox_items().then((data) => {
            setItems(data);
        });
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

    const [openPost, setopenPost] = React.useState(false);
    const [post, setPost] = React.useState();
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
                                                    <Typography variant="body2">Author: {item.author.displayName}</Typography>
                                                    <Typography variant="body2">Published: {item.published.substring(0, 10)}</Typography>
                                                    <Typography variant="body2">Node: {item.author.host}</Typography>
                                                </Box>
                                            </Box>)}
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
                                    {item.type === "follow" && (<Card style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between" }} onClick={() => setopenPost(false)}>
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
                                        <Button id={item.follower} style={{ margin: 42, alignSelf: "flex-end", backgroundColor: "lightblue" }} onClick={() => followBack(item.follower)} variant="contained">
                                            Accept
                                        </Button>
                                    </Card>)}
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
        </Box>
    )
}

export default Inbox;