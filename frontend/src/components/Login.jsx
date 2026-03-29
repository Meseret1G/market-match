import { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // Replaced hard-coded localhost with the dynamic API instance
      const res = await api.post('/token/', { username, password })
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      
      const parts = res.data.access.split('.')
      if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          localStorage.setItem('user_id', payload.user_id)
      }
      
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="glass-card" style={{ maxWidth: 400, margin: '5rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username</label>
          <input className="form-control" type="text" onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" type="password" onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
