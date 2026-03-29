# AI-Powered Skill Matching Platform - Technical Write-up 

## System Architecture
The platform is built using a modern decoupled architecture:
- **Backend**: Django & Django REST Framework (DRF) serving REST APIs.
- **Frontend**: React + Vite (Functional Components, Hooks, React Router DOM), styled with custom modern dark-mode CSS logic preventing reliance on overly bulky external CSS frameworks.
- **Database Strategy**: Engineered to run on **PostgreSQL** in production with `pgvector` for embedding logic, defaulting to SQLite locally for rapid prototyping.
- **AI Matching Layer**: An isolated service layer (`matching/services.py`) handling all vector distance scoring and matching logic, decoupled strictly from Django Views.

## Authentication and Security
- **JWT (JSON Web Tokens)**: Stateless access token logic built with `djangorestframework-simplejwt`. The React client uses Axios interceptors to seamlessly handle `401 Unauthorized` requests by attempting automatic refresh token rotations.
- **RBAC (Role-Based Access Control)**: Enforced via Custom DRF Permissions:
  - `IsClient`: Only client roles can POST to `/jobs/`.
  - `IsFreelancer`: Only freelancers can apply.
  - `IsOwner`: Data mutation is scoped strictly at the object level (users modifying only their matched results or profiles).

## Matching Approach & Ranking

The matching engine merges several sub-scores into an aggregated **Final Score**:
`final_score = w1 * semantic_similarity + w2 * keyword_similarity + w3 * experience_score + w4 * future_signals`

**1. Semantic Matching (Sentence Embeddings)**
- Leverages `sentence_transformers` (`all-MiniLM-L6-v2`).
- Rather than parsing exact strings, it maps conceptual similarity. "Python Expert" vs "Django Engineer" matches favorably because they exist contextually near each other in the vector space, mitigating vocabulary silos.

**2. Keyword NLP TF-IDF (Term Frequency)**
- Exact matching using `scikit-learn`. Gives a baseline signal if the exact text requirements overlap (e.g. AWS).

**3. Experience Multipliers**
- Reduces the match weighting heavily if a user is drastically underqualified for a given job requirement, serving an immediate mathematical penalty to the floating point score.

##  Scaling Strategy & Trade-offs

1. **Memory vs. Request Latency**: Loading HuggingFace models consumes significant memory per worker process. **Solution**: Load the model globally during Django `AppConfig.ready()`, not locally inside requests.
2. **Asynchronous Processing**: Currently, matches are generated synchronously. **Solution**: Future iterations will offload `generate_matches_for_job` using **Celery + Redis**, unblocking the main web thread from heavy ML routines.
3. **Vector Database / Approximate Nearest Neighbors (ANN)**: Linear scanning `O(N)` over thousands of users for similarities doesn't scale. We intend to use Pinecone or `pgvector` database algorithms (HNSW) to calculate the initial Candidate Generation step in under 100ms regardless of dataset size.
4. **Implicit Feedback**: In subsequent versions, we can record Client interactions ('Rejected', 'Accepted', 'Interviews') on Match objects to dynamically reinforce and adjust the `WEIGHTS` globally across the recommendation distribution.
