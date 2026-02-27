from django.db import models


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.IntegerField()
    level = models.CharField(max_length=50)
    instructor = models.IntegerField()
    category = models.IntegerField()
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class Module(models.Model):
    course = models.IntegerField()
    title = models.CharField(max_length=255)
    order = models.IntegerField()

    def __str__(self):
        return self.title


class Lecture(models.Model):
    module = models.IntegerField()
    title = models.CharField(max_length=255)
    content = models.TextField()

    def __str__(self):
        return self.title