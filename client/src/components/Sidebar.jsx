import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJSON } from '../api'

export default function Sidebar() {
  const [popularPosts, setPopularPosts] = useState([])
  const [allTags, setAllTags] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingTags, setLoadingTags] = useState(true)

  useEffect(() => {
    loadPopularPosts()
    loadTags()
  }, [])

  const loadPopularPosts = async () => {
    const res = await fetchJSON('/api/posts/popular/top?limit=5')
    if (res.ok) setPopularPosts(res.posts)
    setLoadingPosts(false)
  }

  const loadTags = async () => {
    const res = await fetchJSON('/api/posts')
    if (res.ok) {
      const tags = new Set()
      res.posts.forEach(post => {
        if (post.tags) post.tags.forEach(tag => tags.add(tag))
      })
      setAllTags(Array.from(tags))
    }
    setLoadingTags(false)
  }

  return (
    <div className="sidebar">
      {/* Popular Posts */}
      <div className="sidebar-card">
        <h3>
          <span>🔥</span> 熱門文章
        </h3>
        {loadingPosts ? (
          <p className="muted">載入中...</p>
        ) : popularPosts.length === 0 ? (
          <p className="muted">尚無熱門文章</p>
        ) : (
          <div>
            {popularPosts.map((post, index) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  padding: '12px 0',
                  borderBottom: index < popularPosts.length - 1 ? '1px solid #e5e7eb' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.paddingLeft = '8px'}
                onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #e3000f 0%, #c20010 100%)',
                      color: '#fff',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {index + 1}
                    </span>
                    <h4 style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {post.title}
                    </h4>
                  </div>
                  <div className="view-count" style={{ marginLeft: 32 }}>
                    <span>👁️</span>
                    <span>{post.views || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="sidebar-card">
        <h3>
          <span>🎨</span> 主題
        </h3>
        {loadingTags ? (
          <p className="muted">載入中...</p>
        ) : allTags.length === 0 ? (
          <p className="muted">尚無主題</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allTags.map(tag => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                style={{ textDecoration: 'none' }}
              >
                <span className="tag">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
