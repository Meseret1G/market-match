from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import Match, FreelancerProfile, Job
import numpy as np

# Configurable weights for Final Score
WEIGHTS = {
    'semantic': 0.5,
    'keyword': 0.3,
    'experience': 0.2,
    'future': 0.0
}

def get_basic_match_score(job, freelancer):
    # TF-IDF Cosine Similarity of requirements vs actual skills
    req_skills = job.required_skills.replace(',', ' ').lower()
    user_skills = freelancer.skills.replace(',', ' ').lower()
    corpus = [req_skills, user_skills]
    
    keyword_score = 0.0
    try:
        tfidf = TfidfVectorizer().fit_transform(corpus)
        cosine_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])
        keyword_score = max(0.0, float(cosine_sim[0][0]))
    except Exception:
        pass
    
    return keyword_score

def get_semantic_match_score(job, freelancer):
    try:
        from sentence_transformers import SentenceTransformer
        # Note: In production, load this model once in app memory (e.g. apps.py), instead of locally.
        model = SentenceTransformer('all-MiniLM-L6-v2')
        ext_reqs = job.description + " " + job.required_skills
        ext_prof = freelancer.skills + " " + freelancer.experience_level
        embeddings = model.encode([ext_reqs, ext_prof])
        sim = cosine_similarity([embeddings[0]], [embeddings[1]])
        return max(0.0, float(sim[0][0]))
    except ImportError:
        return 0.0

def get_experience_score(job, freelancer):
    exp_mapping = {'Entry': 1, 'Intermediate': 2, 'Expert': 3}
    j_exp = exp_mapping.get(job.experience_level, 1)
    f_exp = exp_mapping.get(freelancer.experience_level, 1)
    
    if f_exp < j_exp:
        return 0.5 # Underqualified
    elif f_exp == j_exp:
        return 1.0 # Perfect match
    else:
        return 1.1 # Overqualified slight boost

def compute_final_score(job, freelancer):
    keyword = get_basic_match_score(job, freelancer)
    semantic = get_semantic_match_score(job, freelancer)
    
    # Fallback to keyword if semantic model unavailable
    if semantic == 0.0:
        WEIGHTS['keyword'] += WEIGHTS['semantic']
        WEIGHTS['semantic'] = 0.0

    exp = get_experience_score(job, freelancer)
    
    final_score = (
        (WEIGHTS['semantic'] * semantic) +
        (WEIGHTS['keyword'] * keyword) +
        (WEIGHTS['experience'] * exp) +
        (WEIGHTS['future'] * 0.0) # Future signals placeholder
    )
    return min(float(final_score), 10.0)

def generate_matches_for_job(job):
    # In production, this should be executed asynchronously via Celery
    freelancers = FreelancerProfile.objects.all()
    for fl in freelancers:
        score = compute_final_score(job, fl)
        if score > 0.1: # Threshold to ignore terrible matches
            Match.objects.update_or_create(
                job=job, freelancer=fl,
                defaults={'match_score': score}
            )
