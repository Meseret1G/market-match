import { useState, useEffect } from 'react'
import api from '../api'
import { JobIcon, SearchIcon, TalentIcon } from './Icons'

export default function LandingPage() {
  const [jobs, setJobs] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('jobs')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab, search])

  const fetchData = async () => {
    try {
      if (activeTab === 'jobs') {
        const res = await api.get(`/jobs/?search=${search}`)
        setJobs(res.data)
      } else {
        const res = await api.get(`/profiles/?search=${search}`)
        setFreelancers(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section className="hero-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title">Scientific Talent Identifcation</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 3rem' }}>
            A sophisticated algorithmic marketplace connecting elite AI engineers with high-stakes technical projects. Verified results, quantified matching.
          </p>

          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#fff' }}>
            <div style={{ marginLeft: '1rem', color: 'var(--primary-dark)' }}><SearchIcon /></div>
            <input
              type="text"
              className="form-control"
              placeholder={activeTab === 'jobs' ? "Scan technical vacancies..." : "Find experts by tech stack..."}
              style={{ margin: 0, height: '56px', border: 'none', background: 'transparent', fontSize: '1.1rem', fontWeight: 600 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" style={{ padding: '0 2rem', height: '56px' }}>Search</button>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '4rem' }}>
          <button
            className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-outline'}`}
            style={{ minWidth: '240px', borderRadius: '16px' }}
            onClick={() => setActiveTab('jobs')}
          >
            <JobIcon /> &nbsp; Technical Vacancies
          </button>
          <button
            className={`btn ${activeTab === 'talents' ? 'btn-primary' : 'btn-outline'}`}
            style={{ minWidth: '240px', borderRadius: '16px' }}
            onClick={() => setActiveTab('talents')}
          >
            <TalentIcon /> &nbsp; Verified Experts
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '10rem' }}><p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-dark)' }}>Processing query results...</p></div>
        ) : (
          <div className="grid">
            {activeTab === 'jobs' ? (
              jobs.map(job => (
                <div key={job.id} className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Project ID {job.id.toString().padStart(4, '0')}</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--primary-dark)' }}>${job.budget}</strong>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{job.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', minHeight: '4.5rem' }}>{job.description.slice(0, 160)}...</p>
                  <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {job.required_skills.split(',').map(skill => (
                      <span key={skill} className="badge" style={{ background: '#f8fafc', fontWeight: 800 }}>{skill.trim()}</span>
                    ))}
                  </div>
                  <div className="flex-between" style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>AUTHORIZED CLIENT: @{job.client?.username}</span>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem' }} onClick={() => window.location.href = '/login'}>Apply Now</button>
                  </div>
                </div>
              ))
            ) : (
              freelancers.map(profile => (
                <div key={profile.id} className="glass-card" style={{ textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--bg-color)', border: '2px solid var(--primary-light)', borderRadius: '24px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)' }}>
                    <TalentIcon />
                  </div>
                  <h3 style={{ marginBottom: '0.25rem' }}>@{profile.user.username}</h3>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>{profile.experience_level} Tier Specialist</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Primary Arsenal: {profile.skills.slice(0, 50)}...</p>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem' }}>${profile.hourly_rate}<span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/HOUR</span></div>
                  <button className="btn btn-primary" style={{ width: '100%', borderRadius: '16px' }} onClick={() => window.location.href = '/login'}>Audit Profile</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
