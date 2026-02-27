from django.db import models
from django.contrib.auth import get_user_model
from courses.models import Course

User = get_user_model()

class Enrollment(models.Model):
    ENROLLMENT_STATUS = [
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments', null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=ENROLLMENT_STATUS,
        default='enrolled'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-enrolled_at']
    
    def __str__(self):
        return f"{self.user.email if self.user else 'Unknown'} - {self.course.title if self.course else 'Unknown'}"