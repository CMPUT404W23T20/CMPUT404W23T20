from rest_framework.test import APIRequestFactory
from django.urls import reverse,resolve
from django.test import TestCase
from rest_framework.test import APIClient,RequestsClient, APITestCase
from rest_framework.authtoken.models import Token
from social_distribution.models import Author, Follow, Post, Inbox
from django.contrib.auth.models import User
from rest_framework import status
import json
import uuid

class APITests(APITestCase):

    def create_authors(self):
        '''
        Initializing test values
        '''
        Author.objects.create(host = "http://127.0.0.1:8000/",displayName = "test1Display", username = "test1",
                               url = "http://127.0.0.1:8000/", github = "None", profileImage = "https://i.imgur.com/k7XVwpB.jpeg",
                              )
        Author.objects.create(host = "http://127.0.0.1:8000/",displayName = "test2Display", username = "test2",
                               url = "http://127.0.0.1:8000/", github = "None", profileImage = "https://i.imgur.com/k7XVwpB.jpeg",
                              )
    
    def create_get_request(self,url):
        '''
        Returns data from get request tests
        '''
        client = RequestsClient()
        request = client.get(url)
        content = request.content.decode("utf-8")
        try:
            content = json.loads(content)
        except:
            return None, request.status_code

        status_code = request.status_code
        return content,status_code
    
    def test_get_all_authors(self):
        '''
        Make sure that we return all authors in the database.
        '''
        path = "http://127.0.0.1:8000/service/authors"
        self.create_authors()
        content,status_code = self.create_get_request(path)
      

        print("Status code from test_get_authors:",status_code)

        self.assertTrue(status_code==200, "200 not found, instead you got {0}".format(status_code))

       
        for i in range(len(content)):
            self.assertIn(content[i]['username'], ("test1","test2"))
            self.assertIn(content[i]['displayName'], ("test1Display","test2Display"))
            self.assertEquals(content[i]['type'],"author")
        
    def test_get_individual_authors(self):
        '''
        Return an individual author and check if the ID in the path mathces the corresponding user
        '''
        self.create_authors()
        allAuthors = list(Author.objects.all().values())

        #get an existing author and see if their information is as expected
        author1 = str(allAuthors[0]['id'])
        author1User = str(allAuthors[0]['username'])
        path = "http://127.0.0.1:8000/service/authors/{0}".format(author1)
       

        content,status_code = self.create_get_request(path)
      
        
        self.assertTrue(status_code==200, "200 not found, instead you got {0}".format(status_code))
        self.assertEquals(content['id'],author1) #make sure it's not the other author's information we're retrieving
        self.assertEquals(content['username'],author1User)

        #remove author1 and see if a response is still returned
        Author.objects.filter(id = author1).delete()
        contentAfterDelete, new_code = self.create_get_request(path)
        self.assertLess(400,new_code) #make sure we're not getting less than a 400 response
      
    def test_post_author(self):
        '''
        This will test if someone can update an existing author's profile
        '''
        self.create_authors()
        authors = list(Author.objects.all().values())
        author1 =  authors[0]['id']
        path = "http://127.0.0.1:8000/service/authors/{0}".format(author1)
  
        
        
        factory = APIRequestFactory()
        request = factory.post(path, {'username': 'coolUserName'}, content_type='application/json')
       
        client = RequestsClient()
        request = client.get(path)
        #decode the response
        content = request.content.decode("utf-8")
        content = json.loads(content)
        #print(content)

    # Test for getting ou
    def test_get_followers(self):
        self.create_authors()
        allAuthors = list(Author.objects.all().values())

        
        author1 = str(allAuthors[0]['id'])
        author2 = str(allAuthors[1]['id'])
        path =  "http://127.0.0.1:8000/service/authors/{0}/followers/{1}".format(author1,author2)

        content,status_code = self.create_get_request(path)

        self.assertEquals(False,content)

    def test_delete_follower(self):
        self.create_authors()
        allAuthors = list(Author.objects.all().values())

        
        author1 = str(allAuthors[0]['id'])
        author2 = str(allAuthors[1]['id'])
        path =  "http://127.0.0.1:8000/service/authors/{0}/followers/{1}".format(author1,author2)

        # Create test follows
        self.follow1 = Follow.objects.create(
            author=Author.objects.get(id=author1),
            follower=Author.objects.get(id=author2),
            summary='Test User 2 is now following Test User 1'
        )

        response = self.client.delete(path)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if follower was deleted
        self.assertFalse(Follow.objects.filter(author=author1, follower=author2).exists())

    # Creates a post for an author
    def create_posts(self, author_id, post_count):
        author = Author.objects.get(id=author_id)
        for i in range(post_count):
            post = Post.objects.create(
                title=f'Test Post {i+1} by {author.displayName}',
                description=f'Test description for Post {i+1} by {author.displayName}',
                contentType='text/plain',
                author=author
            )
            post.save()
   
    # Getting all posts of an author 
    def test_get_posts(self):
        self.create_authors()
        allAuthors = list(Author.objects.all().values())

        authorId = str(allAuthors[0]['id'])
        
        # Create test posts
        self.create_posts(authorId, 3)
        
        path = f"http://127.0.0.1:8000/service/authors/{authorId}/posts"
        content, status_code = self.create_get_request(path)

        #print("Status code from TEST_GET_POSTS:\n",status_code)
        #print("CONTENT FOR GET POSTS: ", content)

        self.assertEqual(status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), 3)
    

    # Testing post for an 
    # Getting 405 error
    def test_create_posts(self):
    # Check authentication
        self.create_authors()
        allAuthors = list(Author.objects.all().values())

        authorId = str(allAuthors[0]['id'])
        author = Author.objects.get(id=authorId)

        user = User.objects.create_user('test1', 'test1@example.com', 'password')

        postId = str(uuid.uuid4())
        # Create test post data
        data = {
            "title": "Test",
            "description": "Test description for post",
            "contentType": "text/plain",
            "author": f"http://127.0.0.1:8000/service/author/{authorId}",
        }

        # Authentication
        token, created = Token.objects.get_or_create(user=user)
        headers = {'Authorization': f'Token {token.key}'}

        # Send the post request to create the post
        path = f"http://127.0.0.1:8000/service/authors/{authorId}/posts/"
        response = self.client.post(path, data=data, headers=headers)

        # Check if the post was created successfully
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if the created post exists in the database
        self.assertTrue(Post.objects.filter(title="Test", author=authorId).exists())
    
    # Getting 405 Error
    # If looking to delete a post, create one and extract the authorId in order to obtain the post

    def test_delete_post(self):
        # Create an author and a post
        self.create_authors()
        allAuthors = list(Author.objects.all().values())
        authorId = str(allAuthors[0]['id'])
        
        # Create post
        self.create_posts(authorId, 1)
        post = Post.objects.filter(author=authorId).first()
        postId = post.id

        user = User.objects.create_user('test1', 'test1@example.com', 'password')
        print(f"user: {user}")

        token, created = Token.objects.get_or_create(user=user)
        print(f"token: {token}")

        headers = {'Content-Type': 'application/json'}
    
        # Attempt to delete the post
        path = f"http://127.0.0.1:8000/service/authors/{authorId}/posts/{postId}"
        response = self.client.delete(path, headers=headers)

        print("DELETE RESPONSE ::: ", response.content)
        # Verify the response status code
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify that the post no longer exists in the database
        self.assertFalse(Post.objects.filter(id=postId).exists())


    def test_get_following(self):

        author1 = Author.objects.create(username='author1')
        author2 = Author.objects.create(username='author2')
        Follow.objects.create(follower=author1, author=author2)
        
        user = User.objects.create_user('test1', 'test1@example.com', 'password')
        token, created = Token.objects.get_or_create(user=user)
        
        headers = {'Authorization': f'Token {token.key}'}
        path =  "http://127.0.0.1:8000/service/authors/{0}/following/{1}".format(author1,author2)

        response = self.client.get(path, headers=headers)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Follow.objects.filter(author=author2, follower=author1).exists())


    def test_get_inbox(self):
        author = Author.objects.create(username='author1')
        post = Post.objects.create(
                title=f'Test Post',
                description=f'Test description for Post',
                contentType='text/plain',
                author=author
            )

        inbox = Inbox.objects.create(author=author)
        inbox.posts.add(post)
        inbox.save()

        path = f"http://127.0.0.1:8000/service/authors/{author.id}/inbox"

        response = self.client.get(path)

        print("GET INBOX ____________", response.data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['title'], 'Test Post')

        self.assertTrue('id' in response.data[0])
        self.assertTrue('type' in response.data[0])
        self.assertTrue('title' in response.data[0])

        
    def test_post_inbox(self):
        return None
    
    def test_delete_inbox(self):
        return None


    def test_get_comments(self):
        return None

    def test_post_comment(self):
        return None

    def test_get_likes(self):
        return None

   
