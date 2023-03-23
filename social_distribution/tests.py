from rest_framework.test import APIRequestFactory
from django.urls import reverse,resolve
from django.test import TestCase
from rest_framework.test import APIClient,RequestsClient, APITestCase
from rest_framework.authtoken.models import Token
from social_distribution.models import Author, Follow, Post
from django.contrib.auth.models import User
from rest_framework import status
import json
import uuid

class AuthorTests(TestCase):

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
        print(content)

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

        print("Status code from TEST_GET_POSTS:\n",status_code)
        #print("CONTENT FOR GET POSTS: ", content)

        self.assertEqual(status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), 3)
        
    
    def test_post_posts(self):
        #check authentication
        return None
    
    def test_delete_posts(self):
        return None
    


