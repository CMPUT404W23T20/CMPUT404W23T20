import React from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography, MenuItem, InputLabel, ListItemText } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';
import { FormControl, Modal, getTextFieldUtilityClass } from '@mui/material';
import { getApiUrls } from '../utils/utils';
import CircularProgress from '@mui/material/CircularProgress';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

function Posts() {
    const [Posts, setPosts] = React.useState([]);
    const [followingPosts, setFollowingPosts] = React.useState([]);
    const [Comments, setComments] = React.useState([]);
    const [loadingFollowing, setLoadingFollowing] = React.useState(false);
    const [loadingPosts, setLoadingPosts] = React.useState(false);
    const [friends, setFriends] = React.useState([]);
    const [friend, setFriend] = React.useState([]);

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

        let path = `${getApiUrls()}/service/posts`;
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        let posts = response.data.items;
        // remove posts that are in allFollowingPosts by id
        posts = posts.filter((post) => {
            for (let i = 0; i < allFollowingPosts.length; i++) {
                if (post.id == allFollowingPosts[i].id) {
                    return false
                }
            }
            return true
        })

        console.log("posts", posts)
        setPosts(posts);
        setLoadingPosts(true)


        let commentList = []

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
        }

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

                }

            }


        }


        //getting all comments in the "Following" header

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

    const Repost = async (post) => {
        console.log(post)
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
                        <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px" }}>
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
                                                    </Box>
                                                </Box>)}
                                            </Box>
                                        </Card>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                        <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px" }}>
                            <Typography variant="h4">Public Posts</Typography>
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
                                    <Button variant="contained" color="primary" onClick={() => setOpenComments(true)} style={{ position: "absolute", bottom: "30px", right: "120px" }}>
                                        Comments
                                    </Button>
                                )}
                                <Button onClick = {() => {setRepostModal(true)}} style={{ position: "absolute", bottom: "30px", right: openComments ? "120px" : "250px" }} color='primary' variant='contained'>Repost</Button>
                            </Card>
                            {openComments && (
                                <Card style={{ marginRight: "10px", marginBottom: "10px", marginLeft: "10px", borderRadius: "10px", borderColor: "black", marginTop: "5px", flex: 1, overflowY: "scroll" }}>
                                    <TextField id="comment" label="Comment..." variant="outlined" style={{ width: "75%", margin: "25px" }} />
                                    <Button variant="contained" color="primary" onClick={() => postComment(document.getElementById("comment").value, post, `${post.author.id}`)} style={{ margin: 10, position: "relative", top: "25px" }}>Comment</Button>
                                    {(`${post.author.id}` === localStorage.getItem("id")) ? <Typography variant="h6" style={{ textAlign: "left", paddingLeft: 30, fontSize: 20 }}>Comments:</Typography> : <h2></h2>}                                        {Comments.map((comments) => (
                                        ((`${comments.post.id}` === `${post.id.split("/").pop()}`) && (`${post.author.id}` === localStorage.getItem("id"))) ?
                                            (<div style={{ display: 'flex', alignItems: 'center', wordWrap: "break-word" }}>
                                                <img src={comments.author.profileImage} alt="" style={{ borderRadius: "50%", marginLeft: 30, marginRight: 15, marginBottom: 10 }} width={55} height={55} />
                                                <Typography variant="h6" style={{ display: "inline-block", textAlign: "left", paddingLeft: 15, fontSize: 20 }}>
                                                    {comments.author.displayName}: {comments.comment}
                                                </Typography>
                                            </div>
                                            )
                                            : (<h2></h2>)
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