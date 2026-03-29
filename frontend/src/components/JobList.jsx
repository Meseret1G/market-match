import { useState, useEffect } from 'react'
import api from '../api'

export default function JobList() {
  const [jobs, setJobs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  
  // Job Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    budget: '',
    experience_level: 'Entry'
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = () => {
    api.get('/jobs/')
      .then(res => setJobs(res.data))
      .catch(console.error)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingJob) {
        api.patch(`/jobs/${editingJob.id}/`, formData)
          .then(res => {
              setJobs(jobs.map(j => j.id === res.data.id ? res.data : j))
              resetForm()
          })
          .catch(console.error)
    } else {
        api.post('/jobs/', formData)
          .then(res => {
            setJobs([res.data, ...jobs])
            resetForm()
          })
          .catch(err => alert('Failed to post job: ' + JSON.stringify(err.response.data)))
    }
  }

  const resetForm = () => {
      setShowForm(false)
      setEditingJob(null)
      setFormData({
        title: '',
        description: '',
        required_skills: '',
        budget: '',
        experience_level: 'Entry'
      })
  }

  const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to terminate this project vacancy?')) {
          try {
              await api.delete(`/jobs/${id}/`)
              setJobs(jobs.filter(j => j.id !== id))
          } catch (e) {
              console.error(e)
          }
      }
  }

  const startEdit = (job) => {
      setEditingJob(job)
      setFormData({
          title: job.title,
          description: job.description,
          required_skills: job.required_skills,
          budget: job.budget,
          experience_level: job.experience_level
      })
      setShowForm(true)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: '3rem' }}>
        <div>
            <h2>Professional Work Studio</h2>
            <p style={{ color: 'var(--text-muted)' }}>Lifecycle management for your AI/Tech project vacancies.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Exit Studio' : 'Launch New Vacancy'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{marginBottom: '3rem', padding: '2.5rem'}}>
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingJob ? 'Refine Project Details' : 'Initialize New Project'}</h3>
            <div className="grid">
                <div className="form-group">
                <label>Job Title</label>
                <input type="text" required className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-group">
                <label>Budget Allocation ($)</label>
                <input type="number" required className="form-control" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                </div>
            </div>
            <div className="form-group">
              <label>Technical Description</label>
              <textarea required className="form-control" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Skill Arsenal (comma separated)</label>
              <input type="text" required placeholder="React, Python, OpenCV" className="form-control" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Expertise Requirement</label>
              <select className="form-control" value={formData.experience_level} onChange={e => setFormData({...formData, experience_level: e.target.value})}>
                <option value="Entry">Entry Level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert / Architect</option>
              </select>
            </div>
            <div className="flex-between" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={resetForm}>Discard Changes</button>
                <button type="submit" className="btn btn-primary">{editingJob ? 'Update Global Posting' : 'Publish to Market Feed'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        {jobs.length === 0 ? <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No active vacancies detected in this workspace.</p> : jobs.map(job => (
          <div key={job.id} className="glass-card" style={{ marginBottom: '1.5rem' }}>
             <div className="flex-between">
              <div>
                <h3 style={{ margin: 0 }}>{job.title}</h3>
                <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>{job.description.slice(0, 150)}...</p>
                <div>
                  {job.required_skills.split(',').map(skill => (
                    <span key={skill} className="badge">{skill.trim()}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '200px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>${job.budget}</div>
                <div className="flex-between" style={{ gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => startEdit(job)}>Edit</button>
                    <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(job.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
