import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function PublicProfile() {
  const { id } = useParams() // Profile ID 
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMe, setIsMe] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const meRes = await api.get('/users/me/')
        const profRes = await api.get(`/profiles/${id}/`)
        setProfile(profRes.data)
        setIsMe(meRes.data.id === profRes.data.user.id)
      } catch (err) {
        console.error("Profile not found", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) return <div className="container"><h3>Identifying Talent Profile...</h3></div>

  if (!profile) return <div className="glass-card" style={{ textAlign: 'center' }}><h2>Profile Disconnected</h2><p>This workspace could not be located.</p></div>

  const handleStartChat = () => {
      // Start a chat with this user
      navigate(`/chat/${profile.user.id}`)
  }

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
       <div className="flex-between" style={{ marginBottom: '3rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>@{profile.user.username}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Expert Status: {profile.experience_level}</p>
          </div>
          <div style={{ fontSize: '3.5rem' }}>✨</div>
       </div>

       <div className="grid" style={{ gap: '2rem', marginBottom: '3rem' }}>
           <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>Technical Arsenal</h4>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {profile.skills.split(',').map(skill => (
                        <span key={skill} className="badge" style={{ background: 'white', border: '1px solid #cbd5e1' }}>{skill.trim()}</span>
                    ))}
               </div>
           </div>
           
           <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>Economic Profile</h4>
               <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>${profile.hourly_rate} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ hour</span></p>
           </div>
       </div>

       {profile.portfolio_url && (
           <div style={{ marginBottom: '3.5rem' }}>
               <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '1rem' }}>Work Evidence</h4>
               <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-block' }}>Visit External Portfolio</a>
           </div>
       )}

       {!isMe && (
           <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
                <button className="btn btn-primary" style={{ width: '100%', height: '52px' }} onClick={handleStartChat}>
                    Initialize Project Communications
                </button>
           </div>
       )}
    </div>
  )
}
