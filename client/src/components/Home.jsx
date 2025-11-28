import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchJSON } from '../api'
import Sidebar from './Sidebar'

function PostCard({ post }) {
  return (
    <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="post-card-horizontal">
        {post.image && (
          <div className="post-card-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}
        <div className="post-card-body">
          <h3>{post.title}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              {post.author?.displayName || post.author?.username}
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="view-count" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                <span>👁️</span>
                <span>{post.views || 0}</span>
              </div>
              <div className="view-count" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                <span>💬</span>
                <span>{post.commentCount || 0}</span>
              </div>
            </div>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {post.tags.slice(0, 5).map((tag, i) => (
                <span key={i} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
            {post.content.slice(0, 200)}{post.content.length > 200 ? '...' : ''}
          </p>
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem', marginTop: 12 }}>
            {new Date(post.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function Home(){
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchParams] = useSearchParams()
  const tagFromUrl = searchParams.get('tag')

  const load = async ()=>{
    const res = await fetchJSON('/api/posts')
    if(res.ok) {
      setPosts(res.posts)
      if (tagFromUrl) {
        setFilteredPosts(res.posts.filter(post => post.tags && post.tags.includes(tagFromUrl)))
      } else {
        setFilteredPosts(res.posts)
      }
    }
  }

  useEffect(()=>{ load() }, [tagFromUrl])

  return (
    <div className="main-layout">
      <div>
        <h2 style={{ marginBottom: 24 }}>
          {tagFromUrl ? `主題：#${tagFromUrl}` : '最新文章'}
        </h2>

        {tagFromUrl && (
          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ margin: 0 }}>
              正在顯示主題「<strong>{tagFromUrl}</strong>」的文章 ({filteredPosts.length} 篇)
              <Link to="/" style={{ marginLeft: 12, color: 'var(--lego-blue)' }}>
                ← 返回全部文章
              </Link>
            </p>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="card">
            <p className="muted">還沒有文章，快來發表第一篇吧！</p>
          </div>
        ) : (
          <div className="posts-list">
            {filteredPosts.map(p => <PostCard key={p._id} post={p} />)}
          </div>
        )}
      </div>

      <Sidebar />
    </div>
  )
}
