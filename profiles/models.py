from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from sorl.thumbnail import ImageField


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    
    image = ImageField(upload_to='profiles', default='profiles/default_user.jpg')
    banner_image = ImageField(upload_to='profiles', default='profiles/default_user.jpg')

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a new profile object when Django user is created
    """

    if created:
        Profile.objects.create(user=instance)