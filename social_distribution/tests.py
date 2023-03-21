from django.test import TestCase
from .models import Author, Post, Follow, Comment, Like
import uuid
from django.urls import reverse
from django.utils import timezone
# Create your tests here.

"""class AuthorTest(TestCase):
    def createAuthors(self):
        Author.objects.create(host = "123",displayName = "test1", username = "test1",
                               url = "123.com", github = "None", profileImage = "https://www.istockphoto.com/resources/images/RoyaltyFree/Hero-813062534_2000x650.jpg",
                               password = "test1")
        
        Author.objects.create(host = "123",displayName = "test2", username = "test2",
                               url = "123.com", github = "None", profileImage = "https://www.istockphoto.com/resources/images/RoyaltyFree/Hero-813062534_2000x650.jpg",
                               password = "test2")

    def created(self):
        user1 =Author.objects.get(displayName = "test1")
        user2 = Author.objects.get(displayName  = "test2")
        self.assertEqual(user1.username == "test1")
        self.assertEqual(user2.username=="test2")

"""


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





