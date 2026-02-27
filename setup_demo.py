import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'olms.settings')

import django
django.setup()

from accounts.models import User
from courses.models import Course

# Update or create demo user with correct password
user, created = User.objects.get_or_create(
    email="demo@olms.test",
    defaults={'full_name': 'Demo User', 'role': 'STUDENT'}
)
user.set_password('password123')
user.save()
print(f"✓ User: {user.email} (password: password123)")

# Check courses
courses = Course.objects.all()
print(f"✓ Total courses available: {courses.count()}")
for c in courses:
    print(f"   - {c.title}")
