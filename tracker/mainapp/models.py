from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Any custom fields you might want to add to the user model
    pass

class Question(models.Model):
    title = models.CharField(max_length=200)
    number = models.PositiveIntegerField(unique=True)
    description = models.TextField()
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    tags = models.CharField(max_length=200)
    first_attempt = models.DateTimeField(auto_now_add=True)
    last_attempt = models.DateTimeField(auto_now=True)
    solved_first_time = models.BooleanField()
    attempts = models.PositiveIntegerField(default=1)

class Note(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Progress(models.Model):
    STATUS_CHOICES = [
        ('solved', 'Solved'),
        ('unsolved', 'Unsolved'),
        ('in_progress', 'In Progress'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    completion_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'question')
