import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api'
import { BellIcon, IdentityIcon, StudioIcon } from './Icons'

export default function Navbar() {
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  
  const isAuthenticated = !!localStorage.getItem('access_token')

  useEffect(() => {
    if (isAuthenticated) {
        api.get('/users/me/')
            .then(res => setUser(res.data))
            .catch(() => handleLogout())

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
    } else {
        setUser(null)
        setNotifications([])
    }
  }, [location.pathname, isAuthenticated])

  const fetchNotifications = async () => {
    try {
        const res = await api.get('/notifications/')
        setNotifications(res.data)
    } catch (err) {
        console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/'
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        MarketMatch
      </Link>
      
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Explore</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Network Feed</Link>
            {user?.is_client && (
                 <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} className={location.pathname === '/jobs' ? 'active' : ''}><StudioIcon /> Work Studio</Link>
            )}
            {user?.is_freelancer && (
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} className={location.pathname === '/profile' ? 'active' : ''}><IdentityIcon /> Professional Identity</Link>
            )}
            
            {/* Notification bell */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ position: 'relative', padding: '0.6rem', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center' }}
                  onClick={() => setShowNotifs(!showNotifs)}
                >
                    <BellIcon />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {showNotifs && (
                    <div className="notification-dropdown">
                        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Alerts</h4>
                            <Link to="/notifications" onClick={() => setShowNotifs(false)} style={{ color: 'var(--primary-dark)', fontSize: '0.75rem', fontWeight: 800 }}>History Hub</Link>
                        </div>
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No alerts found.</p> : notifications.slice(0, 5).map(notif => (
                                <div 
                                    key={notif.id} 
                                    className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                    onClick={() => { setShowNotifs(false); window.location.href='/notifications' }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{notif.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.message.slice(0, 60)}...</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button className="btn btn-outline" onClick={handleLogout} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 800 }}>
                Disconnect
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Sign In</Link>
            <Link to="/register" className="btn btn-primary" style={{ marginLeft: '1rem', padding: '0.6rem 1.4rem' }}>Launch Workspace</Link>
          </>
        )}
      </div>
    </nav>
  )
}
