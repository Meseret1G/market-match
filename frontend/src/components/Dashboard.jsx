import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { ChatIcon, TalentIcon, SearchIcon } from './Icons'

export default function Dashboard() {
  const [matches, setMatches] = useState([])
  const [clientJobs, setClientJobs] = useState([])
  const [jobMatches, setJobMatches] = useState({}) 
  const [applications, setApplications] = useState([]) 
  const [invitations, setInvitations] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  
  const [inviteStatus, setInviteStatus] = useState({})

  useEffect(() => {
    async function initDashboard() {
      try {
        const userRes = await api.get('/users/me/')
        setUserInfo(userRes.data)

        if (userRes.data.is_freelancer) {
          const matchRes = await api.get('/matches/')
          setMatches(matchRes.data)
          // Fallback: If no dedicated matches, fetch all available projects for the feed
          const jobsRes = await api.get('/jobs/')
          setClientJobs(jobsRes.data)
          
          const appRes = await api.get('/applications/')
          setApplications(appRes.data)
          const invRes = await api.get('/invitations/')
          setInvitations(invRes.data)
        } else if (userRes.data.is_client) {
          const jobsRes = await api.get('/jobs/')
          setClientJobs(jobsRes.data)
          const appRes = await api.get('/applications/')
          setApplications(appRes.data)
          const invRes = await api.get('/invitations/')
          setInvitations(invRes.data)
          const invMap = {}
          invRes.data.forEach(i => {
              invMap[`${i.job.id}-${i.freelancer.id}`] = i.status
          })
          setInviteStatus(invMap)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    initDashboard()
  }, [])

  const fetchCandidates = async (jobId) => {
    try {
      const res = await api.get(`/jobs/${jobId}/matches/`)
      setJobMatches({ ...jobMatches, [jobId]: res.data })
    } catch (err) {
      console.error(err)
    }
  }

  const handleInvite = async (jobId, freelancerId) => {
    try {
        const res = await api.post(`/jobs/${jobId}/invite/`, { freelancer_id: freelancerId })
        setInviteStatus({ ...inviteStatus, [`${jobId}-${freelancerId}`]: res.data.status })
    } catch (err) {
        console.error(err)
    }
  }

  const handleAppHandshake = async (appId, action) => {
     try {
         await api.post(`/applications/${appId}/${action}/`)
         setApplications(applications.map(a => a.id === appId ? { ...a, status: action === 'accept' ? 'Accepted' : 'Rejected' } : a))
     } catch (e) {
         console.error(e)
     }
  }

  const handleInvHandshake = async (invId, action) => {
      try {
          await api.post(`/invitations/${invId}/${action}/`)
          setInvitations(invitations.map(i => i.id === invId ? { ...i, status: action === 'accept' ? 'Accepted' : 'Rejected' } : i))
          const invRes = await api.get('/invitations/')
          const invMap = {}
          invRes.data.forEach(i => {
              invMap[`${i.job.id}-${i.freelancer.id}`] = i.status
          })
          setInviteStatus(invMap)
      } catch (e) {
          console.error(e)
      }
  }

  if (loading) return <div className="container" style={{ margin: '10rem auto', textAlign: 'center' }}><p>Synchronizing Global Data...</p></div>

  if (userInfo?.is_client) {
    return (
      <div>
        <div style={{ marginBottom: '3rem' }}>
            <h1>Command Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Project management and talent acquisition hub.</p>
        </div>

        {/* Messaging Hub Shortcut */}
        <div className="glass-card" style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--primary-dark)', background: '#fff' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--primary-dark)' }}><ChatIcon /></div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Project Channels</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure discussions with verified experts.</p>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {applications.filter(a => a.status === 'Accepted').map(a => (
                      <Link key={a.id} to={`/chat/${a.freelancer.user.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', fontWeight: 800 }}>@{a.freelancer.user.username}</Link>
                  ))}
                  {invitations.filter(i => i.status === 'Accepted').map(i => (
                      <Link key={i.id} to={`/chat/${i.freelancer.user.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', fontWeight: 800 }}>@{i.freelancer.user.username}</Link>
                  ))}
             </div>
        </div>

        {/* Applicants section */}
        <section style={{ marginBottom: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Incoming Applications</h3>
            {applications.filter(a => a.status === 'Pending').length === 0 ? <p className="glass-card" style={{ textAlign: 'center', color: '#94a3b8' }}>No pending applications detected.</p> : (
               <div className="grid">
                   {applications.filter(a => a.status === 'Pending').map(app => (
                        <div key={app.id} className="glass-card">
                             <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                 <strong>@{app.freelancer.user.username}</strong>
                                 <span className="badge">Budget Match OK</span>
                             </div>
                             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Applied for: {app.job.title}</p>
                             <div className="flex-between">
                                <Link to={`/profiles/${app.freelancer.id}`} className="btn btn-outline" style={{ fontSize: '0.8rem', border: 'none', padding: 0 }}>Audit Specs</Link>
                                <div className="flex-between" style={{ gap: '0.5rem' }}>
                                    <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => handleAppHandshake(app.id, 'accept')}>Approve</button>
                                    <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#ef4444' }} onClick={() => handleAppHandshake(app.id, 'reject')}>Decline</button>
                                </div>
                             </div>
                        </div>
                   ))}
               </div>
            )}
        </section>

        <section>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Neural Identification</h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                {clientJobs.map(job => (
                    <div key={job.id} className="glass-card" style={{ marginBottom: '1.5rem' }}>
                        <div className="flex-between">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{job.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Automated vetting active for this project index.</p>
                            </div>
                            <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => fetchCandidates(job.id)}><SearchIcon /> Scan Best Talent</button>
                        </div>

                        {jobMatches[job.id] && (
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                                {jobMatches[job.id].map(match => (
                                    <div key={match.id} style={{ minWidth: '320px', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div className="flex-between">
                                            <strong>@{match.freelancer.user.username}</strong>
                                            <span className="badge badge-green">{(match.match_score * 10).toFixed(1)} AI MATCH</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '1rem 0' }}>{match.freelancer.skills.slice(0, 60)}...</p>
                                        <div>
                                            {inviteStatus[`${job.id}-${match.freelancer.id}`] ? (
                                                <div style={{ width: '100%' }}>
                                                     {inviteStatus[`${job.id}-${match.freelancer.id}`] === 'Accepted' ? (
                                                         <Link to={`/chat/${match.freelancer.user.id}`} className="btn btn-primary" style={{ width: '100%' }}>Discuss Handshake</Link>
                                                     ) : (
                                                         <button disabled className="btn btn-outline" style={{ width: '100%' }}>Invitation Active</button>
                                                     )}
                                                </div>
                                            ) : (
                                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleInvite(job.id, match.freelancer.id)}>Transmit Outreach</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1>Talent Workspace</h1>
        <p style={{ color: 'var(--text-muted)' }}>Project opportunities and identified market handshakes.</p>
      </div>

       {/* Messaging Hub Shortcut for Freelancers */}
       <div className="glass-card" style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--primary-dark)', background: '#fff' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ color: 'var(--primary-dark)' }}><ChatIcon /></div>
                 <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Active Discussion Grid</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirmed project channels for your identity.</p>
                 </div>
             </div>
             <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {applications.filter(a => a.status === 'Accepted').map(a => (
                      <Link key={a.id} to={`/chat/${a.job.client.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', fontWeight: 800 }}>@{a.job.client.username}</Link>
                  ))}
                  {invitations.filter(i => i.status === 'Accepted').map(i => (
                      <Link key={i.id} to={`/chat/${i.job.client.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', fontWeight: 800 }}>@{i.job.client.username}</Link>
                  ))}
             </div>
        </div>

      <section style={{ marginBottom: '4rem' }}>
           <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Executive Direct Invitations</h3>
             {invitations.filter(i => i.status === 'Pending').length === 0 ? <p className="glass-card" style={{ color: '#94a3b8', textAlign: 'center' }}>No executive outreach detected.</p> : (
                  <div className="grid">
                       {invitations.filter(i => i.status === 'Pending').map(inv => (
                            <div key={inv.id} className="glass-card">
                                 <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                     <strong>@{inv.job.client.username}</strong>
                                     <span className="badge badge-green">HI-PRIORITY</span>
                                 </div>
                                 <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Invited to lead project: <strong>{inv.job.title}</strong></p>
                                 <div className="flex-between" style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '1.25rem' }}>
                                     <strong>${inv.job.budget}</strong>
                                     <div className="flex-between" style={{ gap: '0.5rem' }}>
                                        <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={() => handleInvHandshake(inv.id, 'accept')}>Authorize</button>
                                        <button className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', color: '#ef4444' }} onClick={() => handleInvHandshake(inv.id, 'reject')}>Decline</button>
                                     </div>
                                 </div>
                            </div>
                       ))}
                  </div>
             )}
      </section>

      <section>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Optimized Marketplace Feed</h3>
        <div className="grid">
          {/* Hybrid Feed: Specific Matches taking priority over general jobs */}
          {(matches.length > 0 ? matches : clientJobs).map((item) => {
            const job = item.job || item; // Item might be a Match or a Job
            const score = item.match_score ? (item.match_score * 10).toFixed(1) : '8.2'; // Generic score for public feed
            
            return (
              <div key={item.id} className="glass-card">
                 <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{job.title}</h3>
                    <span className="badge">{score} MATH MATCH</span>
                 </div>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '3.5rem' }}>{job.description?.slice(0, 150)}...</p>
                 <div className="flex-between" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                      <strong style={{ fontSize: '1.3rem' }}>${job.budget}</strong>
                      {applications.some(a => a.job.id === job.id) ? (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                               <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>TRANSFERRED - {applications.find(a => a.job.id === job.id).status.toUpperCase()}</span>
                               {applications.find(a => a.job.id === job.id).status === 'Accepted' && (
                                   <Link to={`/chat/${job.client.id}`} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Hub</Link>
                               )}
                           </div>
                      ) : (
                          <button className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => {
                              api.post('/applications/', { job: job.id }).then(res => setApplications([...applications, res.data]))
                          }}>Launch Application</button>
                      )}
                 </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  )
}
