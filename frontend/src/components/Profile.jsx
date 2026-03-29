import { useState, useEffect } from 'react'
import api from '../api'

export default function Profile() {
  const [userData, setUserData] = useState({ username: '', email: '' })
  const [profile, setProfile] = useState({
    skills: '',
    experience_level: 'Entry',
    portfolio_url: '',
    hourly_rate: 0
  })
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await api.get('/users/me/')
        setUserInfo(meRes.data)
        setUserData({
            username: meRes.data.username,
            email: meRes.data.email
        })
        
        if (meRes.data.profile) {
            setProfile(meRes.data.profile)
        }
      } catch (err) {
        console.error("Error fetching account data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
        await api.patch('/users/me/', userData)
        
        if (userInfo.is_freelancer) {
            if (profile.id) {
                await api.put(`/profiles/${profile.id}/`, profile)
            } else {
                const res = await api.post(`/profiles/`, profile)
                setProfile(res.data)
            }
        }
        setMessage('Account synchronization successful.')
    } catch (err) {
        console.error("Update failed", err)
        setMessage(`Error: ${JSON.stringify(err.response?.data || err.message)}`)
    } finally {
        setLoading(false)
    }
  }

  if (loading && !userInfo) return <div className="container"><h3>Authenticating Identity...</h3></div>

  return (
    <div className="glass-card" style={{maxWidth: '850px', margin: '0 auto', borderTop: '6px solid var(--primary-dark)'}}>
      <div style={{ marginBottom: '3.5rem' }}>
          <h2>Identity Management Hub</h2>
          <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Lifecycle management for your {userInfo?.is_freelancer ? 'Expert' : 'Executive Client'} account and workspace authorization.</p>
      </div>

      {message && (
          <div style={{ 
              padding: '1.25rem', 
              borderRadius: '12px', 
              marginBottom: '3rem', 
              background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
              color: message.startsWith('Error') ? '#991b1b' : '#15803d',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: `1.5px solid ${message.startsWith('Error') ? '#fee2e2' : '#dcfce7'}`
          }}>
              {message}
          </div>
      )}
      
      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: '4rem' }}>
            <h4 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Core Account Directives</h4>
            <div className="grid">
                <div className="form-group">
                    <label>Workspace Username</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    value={userData.username} 
                    onChange={e => setUserData({...userData, username: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Authorized Email Record</label>
                    <input 
                    type="email" 
                    className="form-control" 
                    value={userData.email || ''} 
                    onChange={e => setUserData({...userData, email: e.target.value})}
                    />
                </div>
            </div>
        </div>

        {userInfo?.is_freelancer && (
           <div style={{ marginTop: '3rem' }}>
              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Professional Marketplace Specs</h4>
              
              <div className="form-group">
                <label>Technical Arsenal (comma separated)</label>
                <textarea 
                  className="form-control" 
                  rows="5" 
                  placeholder="e.g. React, Python, AWS, Docker"
                  value={profile.skills}
                  onChange={e => setProfile({...profile, skills: e.target.value})}
                  style={{ resize: 'none' }}
                />
              </div>
              
              <div className="grid" style={{ marginTop: '2rem' }}>
                  <div className="form-group">
                    <label>Competency Tier</label>
                    <select 
                      className="form-control"
                      value={profile.experience_level}
                      onChange={e => setProfile({...profile, experience_level: e.target.value})}
                    >
                      <option value="Entry">Entry Level</option>
                      <option value="Intermediate">Mid-Level Tier</option>
                      <option value="Expert">Architect / Expert</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Economic Rate ($/HR)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={profile.hourly_rate}
                      onChange={e => setProfile({...profile, hourly_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>External Evidence Portfolio URL</label>
                <input 
                  type="url" 
                  className="form-control"
                  placeholder="https://evidence-portfolio.com"
                  value={profile.portfolio_url || ''}
                  onChange={e => setProfile({...profile, portfolio_url: e.target.value})}
                />
              </div>
           </div>
        )}

        <div style={{ marginTop: '4rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', height: '56px', fontSize: '1rem' }}>
               {loading ? 'Propagating Directives...' : 'Finalize Identity Updates'}
            </button>
        </div>
      </form>
    </div>
  )
}
