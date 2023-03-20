

import React from 'react';
import { Box, Button, Card, List, ListItem, TextField, Typography } from '@material-ui/core';
import Nav from './Nav';
import axios from 'axios';

let PATH = "https://t20-social-distribution.herokuapp.com"

function Inbox() {
    const get_inbox_items = async () => {
        let path = PATH+ "/service/authors/" + localStorage.getItem("id") + "/inbox";
        let response = await axios.get(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        console.log(response.data);
        return response.data.items
    }

    const handleClear = async () => {
        let path = PATH+"/service/authors/" + localStorage.getItem("id") + "/inbox";
        let response = await axios.delete(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });
        console.log(response.data);
        get_inbox_items().then((data) => {
            setItems(data);
        });
    }

    const followBack = async (follower) => {
        let userId = localStorage.getItem("id");
        let path =PATH+ `/service/authors/${follower.id}/followers/${userId}`;
        let response = await axios.put(path, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        path =PATH+ "/service/authors/" + follower.id + "/inbox";
        await axios.post(path, response.data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        return response.data;
    }

    const [Items, setItems] = React.useState([]);
    React.useEffect(() => {
        get_inbox_items().then((data) => {
            setItems(data);
        });
    }, []);

    const [openItem, setopenItem] = React.useState(false);
    const [item, setItem] = React.useState([{}]);
    return (
        <Box>
            <Box className="App" style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", alignItems: "left", justifyContent: "left" }}>
                <Box style={{ width: "170px" }}>
                    <Nav />
                </Box>
                <Box style={{ display: "flex", flexDirection: "row", backgroundColor: "white", flex: 1, height: "100vh" }}>
                    <Box style={{ display: "flex", flexDirection: "column", flex: 1, margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px" }}>
                        <Typography variant="h4">Inbox</Typography>
                        <List style={{ flex: 1, overflowY: "scroll" }}>
                            {Items.map((item) => (
                                <ListItem key={item.id} onClick={() => { if (item.type === "post") { setItem(item); setopenItem(true); } }}>
                                    <Card style={{ width: "100%", backgroundColor: "#66aeec" }}>
                                        <Box style={{ paddingLeft: 2 }}>
                                            {item.type === "post" && (
                                                <Box style={{ margin: 10 }}>
                                                    <Typography variant="h5">Post</Typography>
                                                    <Typography variant="h6">{item.title}</Typography>
                                                    <Typography variant="body2">{item.author.displayName}</Typography>
                                                    <Typography variant="body1" style={{ maxHeight: "200px", overflowY: "auto" }}>{item.description}</Typography>
                                                </Box>

                                            )}
                                            {item.type === "comment" && (
                                                <Box>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: 10 }}>
                                                        <Typography variant="h5">Comment</Typography>
                                                        <Typography variant="body2">{item.author.displayName}</Typography>
                                                        <Typography variant="body1" style={{ maxHeight: "200px", overflowY: "auto" }}>{item.comment}</Typography>
                                                    </div>
                                                </Box>
                                            )}
                                            {item.type === "follow" && (
                                                <Box>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: 10 }}>
                                                        <span>
                                                            <Typography variant="h5">Follow</Typography>
                                                            <Typography variant="body2">{item.summary}</Typography>
                                                        </span>
                                                        <Button
                                                            id={item.follower}
                                                            style={{
                                                                backgroundColor: "white", float: "right",
                                                                marginLeft: 25, fontSize: 15, minWidth: 90
                                                            }} onClick={() => followBack(item.follower)}>
                                                            Follow Back
                                                        </Button>
                                                    </div>
                                                </Box>
                                            )}
                                            {item.type === "like" && (
                                                <Box>
                                                    <Typography variant="h5">{item.author.displayName + " liked your post " + item.post.title}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Card>
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
                    {openItem && (
                        <Box style={{ flex: 1, display: "flex", flexDirection: "column", margin: "10px", borderColor: "grey", borderStyle: "solid", borderRadius: "5px" }}>
                            <Box style={{ flex: 1, margin: "5px" }}>
                                <Card style={{ width: "100%", height: "100%", borderRadius: "4px", boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)" }}>
                                    <TextField id="description" label="Description" variant="outlined" style={{ width: "95%", margin: "25px" }} value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} multiline maxRows={15} />
                                </Card>
                            </Box>
                        </Box>)
                    }
                </Box>
            </Box>
        </Box>
    )
}

export default Inbox;