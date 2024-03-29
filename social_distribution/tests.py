from rest_framework.test import APIRequestFactory
from django.urls import reverse
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient,RequestsClient, APITestCase
from rest_framework.authtoken.models import Token
from social_distribution.models import Author, Follow, Post, Inbox,Comment, Like
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

    # Test for getting out
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
    # Getting 400 error
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
            "author": f"{authorId}",
        }

        # Authentication
        token, created = Token.objects.get_or_create(user=user)
        headers = {'Authorization': f'Bearer {token.key}'}

        # Send the post request to create the post
        path = f"http://127.0.0.1:8000/service/authors/{authorId}/posts/{postId}"
        
        #response = self.client.post(path, data=data, headers=headers)

        # Check if the post was created successfully
        #self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if the created post exists in the database
        #self.assertTrue(Post.objects.filter(title="Test", author=authorId).exists())
    
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
        #response = self.client.delete(path, headers=headers)

        #print("DELETE RESPONSE ::: ", response.content)
        # Verify the response status code
        #self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify that the post no longer exists in the database
        #self.assertFalse(Post.objects.filter(id=postId).exists())


    def test_get_following(self):

        author1 = Author.objects.create(username='author1')
        author2 = Author.objects.create(username='author2')
        Follow.objects.create(follower=author1, author=author2)
        
        user = User.objects.create_user('test1', 'test1@example.com', 'password')
        token, created = Token.objects.get_or_create(user=user)
        
        headers = {'Authorization': f'Bearer {token.key}'}
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
        author = Author.objects.create(username='author1')

        # create a post

        # create a inbox

        # post request

        # assert 
        path = f"http://127.0.0.1:8000/service/authors/{author.id}/"
        return None
    
    def test_delete_inbox(self):
        author = Author.objects.create(username='author1')

        # create a post

        # create an inbox

        # add post to inbox

        # delete request

        # assert
        
        path = f"http://127.0.0.1:8000/service/authors/{author.id}/"
        return None

    def test_get_comments(self):
        author = Author.objects.create(username='author1')

        # create a post

        # create a comment underneath that post

        # save it to db

        # get request

        path = f"http://127.0.0.1:8000/service/authors/{author.id}/"
        return None

    def test_post_comment(self):
        author = Author.objects.create(username='author1')
        path = f"http://127.0.0.1:8000/service/authors/{author.id}/"
        return None

    def test_get_likes(self):
        author = Author.objects.create(username='author1')
        # create post

        # create a like object

        path = f"http://127.0.0.1:8000/service/authors/{author.id}/"
        return None

   
class AuthorModelTest(TestCase):
    @classmethod
    def setUpTestData(self):
        # Create an Author object for testing
        self.author = Author.objects.create(
            displayName="Test Author",
            username="testauthor",
            github="testauthor",
            password="testpassword", 
            profileImage = "https://www.istockphoto.com/resources/images/RoyaltyFree/Hero-813062534_2000x650.jpg"
        )

    def test_author_id(self):
        self.assertIsNotNone(self.author.id)
        self.assertIsInstance(self.author.id, uuid.UUID)

    def test_author_displayName(self):
        self.assertEqual(self.author.displayName, "Test Author")

    def test_author_username(self):
        self.assertEqual(self.author.username, "testauthor")

    def test_author_github(self):
        self.assertEqual(self.author.github, "testauthor")

    def test_author_password(self):
        self.assertEqual(self.author.password, "testpassword")
    
    def test_author_profileImg(self):
        self.assertEqual(self.author.profileImage, "https://www.istockphoto.com/resources/images/RoyaltyFree/Hero-813062534_2000x650.jpg" )


class FollowModelTest(TestCase):
    @classmethod
    def setUpTestData(self):
        # Create two Author objects for testing
        self.follower = Author.objects.create(
            displayName="Test Follower",
            username="testfollower",
            github="testfollower",
            password="testpassword"
        )
        self.author = Author.objects.create(
            displayName="Test Author",
            username="testauthor",
            github="testauthor",
            password="testpassword"
        )

        # Create a Follow object for testing
        self.follow = Follow.objects.create(
            summary="Test Follow",
            follower=self.follower,
            author=self.author
        )

    def test_follow_id(self):
        self.assertIsNotNone(self.follow.id)
        self.assertIsInstance(self.follow.id, uuid.UUID)

    def test_follow_summary(self):
        self.assertEqual(self.follow.summary, "Test Follow")

    def test_follow_follower(self):
        self.assertEqual(self.follow.follower, self.follower)

    def test_follow_author(self):
        self.assertEqual(self.follow.author, self.author)


class PostModelTest(TestCase):

    def setUp(self):
        self.author = Author.objects.create(displayName='Test Author', username='test_author')
        self.post = Post.objects.create(
            title='Test Post',
            description='This is a test post',
            author=self.author,
        )

    def test_post_content(self):
        post = Post.objects.get(id=self.post.id)
        self.assertEqual(post.title, 'Test Post')
        self.assertEqual(post.description, 'This is a test post')
        self.assertEqual(post.author, self.author)

    def test_post_list_view(self):
        response = self.client.get(reverse('post_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Post')
        self.assertTemplateUsed(response, 'post_list.html')

    def test_post_detail_view(self):
        response = self.client.get(reverse('post_detail', args=[str(self.post.id)]))
        no_response = self.client.get('/post/12345/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(no_response.status_code, 404)
        self.assertContains(response, 'Test Post')
        self.assertTemplateUsed(response, 'post_detail.html')

class LikeModelTestCase(TestCase):

    def setUp(self):
        self.author = Author.objects.create(displayName="Test Author", username="test_author")
        self.post = Post.objects.create(title="Test Post", author=self.author)
        self.comment = Comment.objects.create(comment="Test Comment", author=self.author)
        self.like = Like.objects.create(author=self.author, post=self.post, comment=self.comment)

    def test_like_creation(self):
        self.assertTrue(isinstance(self.like, Like))
        self.assertEqual(str(self.like), self.like.author.displayName + " liked a post/comment.")

    def test_like_relationships(self):
        self.assertEqual(self.like.author, self.author)
        self.assertEqual(self.like.post, self.post)
        self.assertEqual(self.like.comment, self.comment)


class CommentModelTest(TestCase):
    @classmethod
    def setUpTestData(self):
        # Set up non-modified objects used by all test methods
        self.author = Author.objects.create(
            displayName='Test Author',
            username='testauthor'
        )
        self.post = Post.objects.create(
            title='Test Post',
            author=self.author
        )
        self.comment = Comment.objects.create(
            author=self.author,
            comment='Test Comment',
            contentType='text/plain',
            published=timezone.now(),
            post=self.post
        )

    def test_comment(self):
        self.assertEqual(Comment.comment, 'test_comment')

    def test_comment_author(self):
        comment = Comment.objects.get(id=self.comment.id)
        self.assertEqual(comment.author, self.author)

    def test_comment_content_type(self):
        comment = Comment.objects.get(id=self.comment.id)
        self.assertEqual(comment.contentType, 'text/plain')

    def test_comment_published(self):
        comment = Comment.objects.get(id=self.comment.id)
        self.assertIsNotNone(comment.published)

    def test_comment_post(self):
        comment = Comment.objects.get(id=self.comment.id)
        self.assertEqual(comment.post, self.post)