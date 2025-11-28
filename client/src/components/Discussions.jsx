import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJSON } from '../api'

function DiscussionCard({ discussion }) {
  return (
    <Link to={`/discussions/${discussion._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ marginBottom: 16, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 8, color: 'var(--text-primary)' }}>
          {discussion.title}
          {discussion.isEdited && <span className="muted" style={{ fontSize: '0.75rem', marginLeft: 8 }}>(已編輯)</span>}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {discussion.author?.displayName || discussion.author?.username}
          </p>
          <div className="view-count" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
            <span>💬</span>
            <span>{discussion.commentCount || 0}</span>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, marginBottom: 8 }}>
          {discussion.content.slice(0, 150)}{discussion.content.length > 150 ? '...' : ''}
        </p>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          {new Date(discussion.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </Link>
  )
}

export default function Discussions({ user }) {
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await fetchJSON('/api/discussions')
    if (res.ok) {
      setDiscussions(res.discussions)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>💬 討論區</h2>
        {user && (
          <Link to="/discussions/new">
            <button className="btn">✏️ 發起討論</button>
          </Link>
        )}
      </div>

      {!user && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--soft-beige)' }}>
          <p style={{ margin: 0 }}>
            💡 <Link to="/login" style={{ color: 'var(--lego-blue)' }}>登入</Link> 後即可發起討論或留言
          </p>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="loading-spinner"></div>
          <p className="muted" style={{ marginTop: 16 }}>載入討論中...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div className="card">
          <p className="muted">還沒有討論，快來發起第一個討論吧！🎉</p>
        </div>
      ) : (
        discussions.map(d => <DiscussionCard key={d._id} discussion={d} />)
      )}
    </div>
  )
}
