from django.test import TestCase
from .models import Author

# Create your tests here.

class AuthorTest(TestCase):
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
