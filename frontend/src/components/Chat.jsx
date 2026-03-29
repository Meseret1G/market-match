import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function Chat() {
  const { userId } = useParams() 
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [me, setMe] = useState(null)
  const [partner, setPartner] = useState(null)
  const scrollRef = useRef(null)
  const meRef = useRef(null)

  useEffect(() => {
    async function initChat() {
      try {
        const meRes = await api.get('/users/me/')
        setMe(meRes.data)
        meRef.current = meRes.data
        
        // Initial fetch
        await fetchMessages(meRes.data.id)
        
        const interval = setInterval(() => {
            fetchMessages(meRef.current?.id)
        }, 3000)
        
        return () => clearInterval(interval)
      } catch (e) {
        console.error(e)
      }
    }
    initChat()
  }, [userId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async (currentMeId) => {
    if (!currentMeId) return
    try {
      const res = await api.get('/messages/')
      const filtered = res.data.filter(m => 
        (m.sender.id === parseInt(userId) && m.receiver.id === currentMeId) || 
        (m.sender.id === currentMeId && m.receiver.id === parseInt(userId))
      )
      
      // Update partner if known
      if (filtered.length > 0 && !partner) {
         const p = filtered[0].sender.id === currentMeId ? filtered[0].receiver : filtered[0].sender
         setPartner(p)
      }
      
      // Only update state if length changed or first load to prevent flash
      setMessages(filtered)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    try {
      const res = await api.post('/messages/', {
        receiver_id: parseInt(userId),
        content: newMsg
      })
      // The interval will pick up the new message, but we can append for instant feedback
      setMessages([...messages, { ...res.data, sender: me }])
      setNewMsg('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="glass-card" style={{ height: '75vh', padding: 0, display: 'flex', flexDirection: 'column', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ marginRight: '1rem', textDecoration: 'none', color: 'var(--text-muted)' }}>← Hub</Link>
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', marginRight: '1rem' }}></div>
            <h4 style={{ margin: 0 }}>Project Discussion: {partner ? `@${partner.username}` : 'Handshaking...'}</h4>
         </div>
         {partner && <Link to={`/profiles/${partner.id}`} style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View Expert Profile</Link>}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f8fafc' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '8rem' }}>
             <p style={{ fontSize: '1.1rem' }}>Initiating secure history synchronization...</p>
             <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Historical discussion records will appear here shortly.</p>
          </div>
        ) : messages.map(m => (
          <div 
            key={m.id} 
            style={{ 
              marginBottom: '1.5rem', 
              textAlign: m.sender.id === me?.id ? 'right' : 'left' 
            }}
          >
            <div 
              style={{ 
                display: 'inline-block', 
                padding: '1rem 1.5rem', 
                borderRadius: m.sender.id === me?.id ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: m.sender.id === me?.id ? 'var(--primary)' : 'white',
                color: m.sender.id === me?.id ? 'white' : 'var(--text-main)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                maxWidth: '75%',
                fontSize: '0.95rem',
                border: m.sender.id === me?.id ? 'none' : '1px solid #e2e8f0'
              }}
            >
              {m.content}
              <div style={{ fontSize: '0.65rem', marginTop: '0.6rem', opacity: 0.6, fontWeight: 600 }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ padding: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', background: 'white' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Transmit project update..." 
          style={{ flex: 1, height: '52px', margin: 0 }}
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ height: '52px', padding: '0 2.5rem' }}>Send</button>
      </form>
    </div>
  )
}
