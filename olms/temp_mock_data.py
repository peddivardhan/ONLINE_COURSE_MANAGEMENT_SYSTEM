import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'olms.settings')
django.setup()

from accounts.models import User
from courses.models import Course, Module, Lecture
from reviews.models import Review

# Create users safely
try:
    admin = User.objects.get(email='admin@example.com')
except User.DoesNotExist:
    admin = User.objects.create_superuser('admin@example.com', 'Admin User', 'password')
    print("Created Admin User")

try:
    inst = User.objects.get(email='instructor@example.com')
except User.DoesNotExist:
    inst = User.objects.create_user('instructor@example.com', 'Demo Instructor', 'password', role='INSTRUCTOR')
    print("Created Instructor User")

# Create Courses
c1, created = Course.objects.get_or_create(title='Advanced React & Next.js Pro', defaults={'description': 'Master modern frontend development.', 'price': 99, 'level': 'Advanced', 'instructor': inst.id, 'category': 1})
if created: print("Created Course c1")
c2, created = Course.objects.get_or_create(title='🔴 Live: Ultimate Python Bootcamp', defaults={'description': 'Live interactive learning every weekend. Join the broadcast.', 'price': 199, 'level': 'Beginner', 'instructor': inst.id, 'category': 2})
if created: print("Created Course c2")
c3, created = Course.objects.get_or_create(title='UI/UX Design Masterclass', defaults={'description': 'Learn Figma and design principles.', 'price': 49, 'level': 'Intermediate', 'instructor': inst.id, 'category': 1})
if created: print("Created Course c3")

# Create Modules
m1, _ = Module.objects.get_or_create(course=c1.id, title='Introduction to Next.js', order=1)
m2, _ = Module.objects.get_or_create(course=c2.id, title='Week 1: Python Basics (Live VOD)', order=1)

# Create Video Lectures (iframe embeds)
Lecture.objects.get_or_create(module=m1.id, title='What is Server-Side Rendering?', defaults={'content': "<div style='position: relative; padding-bottom: 56.25%; height: 0;'><iframe src='https://www.youtube.com/embed/Sklc_fQBmcs' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;' frameborder='0' allowfullscreen></iframe></div><p class='mt-4 text-muted'>In this lecture, we discuss the core features of SSR.</p>"})
Lecture.objects.get_or_create(module=m2.id, title='Python Variables & Types', defaults={'content': "<div style='position: relative; padding-bottom: 56.25%; height: 0;'><iframe src='https://www.youtube.com/embed/Z1Yd7upQsXY' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;' frameborder='0' allowfullscreen></iframe></div>"})

# Create Reviews
Review.objects.get_or_create(course=c1.id, defaults={'student': admin.id, 'rating': 5, 'comment': 'This course is absolutely life changing! The video quality is top notch.'})
Review.objects.get_or_create(course=c2.id, defaults={'student': admin.id, 'rating': 4, 'comment': 'Love the live sessions, very interactive.'})

print('Sample data populated successfully!')
