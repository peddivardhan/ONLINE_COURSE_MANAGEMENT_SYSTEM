from django.db import models


class Review(models.Model):
    student = models.IntegerField()
    course = models.IntegerField()
    rating = models.IntegerField()
    comment = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)