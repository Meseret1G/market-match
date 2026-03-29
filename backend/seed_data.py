import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from matching.models import User, FreelancerProfile, Job, Match
from matching.services import generate_matches_for_job

def run_seed():
    print("Seeding database...")
    
    # Create Clients
    c1, _ = User.objects.get_or_create(username='tech_inc', is_client=True)
    c1.set_password('password123')
    c1.save()
    
    c2, _ = User.objects.get_or_create(username='startup_flow', is_client=True)
    c2.set_password('password123')
    c2.save()
    
    # Create Freelancers
    f1, _ = User.objects.get_or_create(username='react_wizard', is_freelancer=True)
    f1.set_password('password123')
    f1.save()
    FreelancerProfile.objects.get_or_create(
        user=f1,
        skills='React, JavaScript, CSS, HTML, Vite, Tailwind',
        experience_level='Expert',
        hourly_rate=80.00
    )
    
    f2, _ = User.objects.get_or_create(username='django_master', is_freelancer=True)
    f2.set_password('password123')
    f2.save()
    FreelancerProfile.objects.get_or_create(
        user=f2,
        skills='Python, Django, REST Framework, PostgreSQL, Redis',
        experience_level='Expert',
        hourly_rate=95.00
    )
    
    f3, _ = User.objects.get_or_create(username='junior_dev', is_freelancer=True)
    f3.set_password('password123')
    f3.save()
    FreelancerProfile.objects.get_or_create(
        user=f3,
        skills='JavaScript, React, Bootstrap',
        experience_level='Entry',
        hourly_rate=25.00
    )

    f4, _ = User.objects.get_or_create(username='ai_researcher', is_freelancer=True)
    f4.set_password('password123')
    f4.save()
    FreelancerProfile.objects.get_or_create(
        user=f4,
        skills='Python, PyTorch, Machine Learning, Data Science, AI',
        experience_level='Expert',
        hourly_rate=150.00
    )

    # Create Jobs
    j1, _ = Job.objects.get_or_create(
        client=c1,
        title='Senior Frontend Architect',
        description='We need a React expert to build a high-performance web dashboard with Vite and Tailwind CSS.',
        required_skills='React, JavaScript, CSS',
        experience_level='Expert',
        budget=5000.00
    )
    
    j2, _ = Job.objects.get_or_create(
        client=c1,
        title='AI Integration Specialist',
        description='Integrate large language models and machine learning pipelines into our existing infrastructure.',
        required_skills='Python, PyTorch, Machine Learning',
        experience_level='Expert',
        budget=12000.00
    )
    
    j3, _ = Job.objects.get_or_create(
        client=c2,
        title='Django Backend Developer',
        description='Looking for a developer to build RESTful APIs using Python and Django.',
        required_skills='Python, Django',
        experience_level='Intermediate',
        budget=3500.00
    )

    # Generate matches for seeded jobs
    print("Generating matches...")
    for job in Job.objects.all():
        generate_matches_for_job(job)

    print("Success! Database seeded.")

if __name__ == '__main__':
    run_seed()
