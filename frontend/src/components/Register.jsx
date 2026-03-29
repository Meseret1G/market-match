import { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', role: 'freelancer'
  })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const is_freelancer = formData.role === 'freelancer'
      const is_client = formData.role === 'client'
      
      // Sanitized hard-coded localhost for the dynamic API instance
      await api.post('/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        is_freelancer: is_freelancer,
        is_client: is_client
      })
      navigate('/login')
    } catch (err) {
      setError('Registration failed. Username may exist.')
    }
  }

  return (
    <div className="glass-card" style={{ maxWidth: 400, margin: '5rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>Create Account</h2>
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Username</label>
          <input className="form-control" type="text" onChange={e => setFormData({...formData, username: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-control" type="email" onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select className="form-control" onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
