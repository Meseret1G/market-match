import { useState, useEffect } from 'react'
import api from '../api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/')
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true })
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="container"><h3>Retrieving History...</h3></div>

  return (
    <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <h2>Notification History</h2>
        <span className="badge">{notifications.filter(n => !n.is_read).length} Unread</span>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>No historical alerts found.</p>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item-full ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => !notif.is_read && markRead(notif.id)}
              style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              <div className="flex-between">
                <h4 style={{ margin: 0, color: notif.is_read ? 'var(--text-muted)' : 'var(--text-main)' }}>{notif.title}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(notif.created_at).toLocaleString()}</span>
              </div>
              <p style={{ marginTop: '0.5rem', color: notif.is_read ? '#94a3b8' : '#64748b' }}>{notif.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
