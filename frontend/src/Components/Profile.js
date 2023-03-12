import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import Nav from './Nav';
import { margin } from '@mui/system';

function Profile() {

    const [author, setAuthor] = useState({});
    const authorId = localStorage.getItem("id")

    useEffect(() => {
        async function fetchAuthor() {
            let path = 'http://localhost:8000/service/authors/' + authorId 
            const response = await fetch(path);
            const data = await response.json();
            setAuthor(data);
        }
        fetchAuthor();

    }, [authorId]);


    const [numPosts, setNumPosts] = useState(0);
    useEffect(() => {

        let path = 'http://localhost:8000/service/authors/' + authorId + '/posts'
        fetch(path)
          .then(response => response.json())
          .then(data => {
            const userPosts = data.filter(post => post.author.id === authorId);
            setNumPosts(userPosts.length);
          });
      }, []);


      const [followers, setFollowers] = useState(0);
      useEffect(() => {
        let path = 'http://localhost:8000/service/authors/' + authorId + '/followers'
        fetch(path)
          .then(response => response.json())
          .then(data => {
            setFollowers(data.length);
          });
      }, []);

      const [following, setFollowing] = useState(0);
      useEffect(() => {
        let path = 'http://localhost:8000/service/authors/' + authorId + '/following'
        fetch(path)
          .then(response => response.json())
          .then(data => {
            setFollowing(data.length);
          });
      }, []);



      const handleClick = () => {
        window.location.href = 'http://localhost:3000/posts';
      }


    if (!author) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1>Profile</h1>
            <Nav/>
			<div style={{
                display: "flex",
                justifyContent: "center",
                margin:"18px 0px"
            }}>
				<div>
                    <img style={{width: "300px", height: "300px", borderRadius:"200px"}}
                    src={author.profileImage}
                    />
                    <h4>@{author.username}</h4>
                    <h4>Github: {author.github}</h4>
                    <div>
                    <h4>{followers} Followers</h4>
                    <h4>{following} Following</h4>
                    </div>
                    <u style={{color:"blue"}} onClick={handleClick}>{numPosts} Posts</u>
                </div>

                <div>
                    

                </div>


			</div>

        </div>
    )
}
