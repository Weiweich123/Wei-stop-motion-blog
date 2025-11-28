import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchJSON, API_BASE } from '../api'
import { showToast } from './Toast'

// 將文字中的 URL 轉換成可點擊的連結
function linkifyContent(text) {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--lego-blue)', wordBreak: 'break-all' }}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export default function PostDetail({ user }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')

  const loadPost = async () => {
    const res = await fetchJSON(`/api/posts/${id}`)
    if (res.ok) {
      setPost(res.post)
      // Update meta tags for FB sharing
      updateMetaTags(res.post)
    }
    else {
      setError(true)
      showToast('無法載入文章', 'error')
    }
  }

  const updateMetaTags = (postData) => {
    // Update Open Graph meta tags for better FB sharing
    const metaTags = [
      { property: 'og:title', content: postData.title },
      { property: 'og:description', content: postData.content.substring(0, 200) + '...' },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: window.location.href },
    ]

    if (postData.image) {
      metaTags.push({ property: 'og:image', content: `${API_BASE}${postData.image}` })
    }

    metaTags.forEach(({ property, content }) => {
      let element = document.querySelector(`meta[property="${property}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('property', property)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    })
  }

  const loadComments = async () => {
    const res = await fetchJSON(`/api/posts/${id}/comments`)
    if (res.ok) setComments(res.comments)
  }

  useEffect(() => {
    const loadData = async () => {
      await loadPost()
      await loadComments()
      setLoading(false)
    }

    // 只執行一次
    loadData()
  }, [id])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!user) {
      showToast('請先登入才能留言', 'error')
      return
    }
    if (!commentContent.trim()) {
      showToast('留言內容不能為空', 'error')
      return
    }

    const res = await fetchJSON(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentContent })
    })

    if (res.ok) {
      showToast(res.message || '留言成功！')
      setCommentContent('')
      loadComments()
    } else {
      showToast(res.error || '留言失敗', 'error')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這篇文章嗎?')) return

    const res = await fetchJSON(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast(res.message || '文章已刪除！')
      nav('/')
    } else {
      showToast(res.error || '刪除失敗', 'error')
    }
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id)
    setEditingContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent('')
  }

  const handleSaveComment = async (commentId) => {
    if (!editingContent.trim()) {
      showToast('留言內容不能為空', 'error')
      return
    }

    const res = await fetchJSON(`/api/posts/${id}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editingContent })
    })

    if (res.ok) {
      showToast(res.message || '留言已更新！')
      setEditingCommentId(null)
      setEditingContent('')
      loadComments()
    } else {
      showToast(res.error || '更新失敗', 'error')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('確定要刪除這則留言嗎?')) return

    const res = await fetchJSON(`/api/posts/${id}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast(res.message || '留言已刪除！')
      loadComments()
    } else {
      showToast(res.error || '刪除失敗', 'error')
    }
  }

  if (loading) return (
    <div className="container">
      <div className="card"><p>載入中...</p></div>
    </div>
  )

  if (error || !post) return (
    <div className="container">
      <div className="card"><p>文章不存在</p></div>
    </div>
  )

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
  }

  const shareToLine = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(post.title)
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank', 'width=600,height=400')
  }

  return (
    <div className="container">
      <Link to="/" style={{
        color: '#2563eb',
        marginBottom: 16,
        display: 'inline-block',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: 8,
        fontWeight: 600,
        border: '1px solid #e2e8f0'
      }}>
        ← 回到首頁
      </Link>

      <div className="card pop-in" style={{ marginBottom: 24 }}>
        {post.image && <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />}

        <h1 style={{ marginTop: 0, marginBottom: 12 }}>{post.title}</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="muted" style={{ margin: 0, marginBottom: 4 }}>
              作者：<strong>{post.author?.displayName || post.author?.username}</strong>
            </p>
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="view-count" style={{ fontSize: '1rem', padding: '6px 16px' }}>
            <span>👁️</span>
            <span>{post.views || 0} 次瀏覽</span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {post.tags.map((tag, i) => (
              <Link key={i} to={`/?tag=${encodeURIComponent(tag)}`} style={{ textDecoration: 'none' }}>
                <span className="tag">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, marginBottom: 24, fontSize: '1.05rem' }}>
          {linkifyContent(post.content)}
        </div>

        {user && user.isAdmin && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 16, display: 'flex', gap: '8px' }}>
            <Link to={`/posts/${id}/edit`}>
              <button className="btn btn-secondary">✏️ 編輯文章</button>
            </Link>
            <button className="btn" onClick={handleDelete} style={{ background: '#dc2626' }}>
              🗑️ 刪除文章
            </button>
          </div>
        )}

        <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: 16 }}>
          <p style={{ marginBottom: 12, fontWeight: 600 }}>
            📤 分享這篇文章：
          </p>
          <div className="share-buttons">
            <button onClick={shareToFacebook} className="share-btn facebook">
              <span style={{ fontSize: '1.2rem' }}>📘</span>
              <span>分享到 Facebook</span>
            </button>
            <button onClick={shareToLine} className="share-btn line">
              <span style={{ fontSize: '1.2rem' }}>💬</span>
              <span>分享到 LINE</span>
            </button>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: 16 }}>
        💬 留言區 ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={submitComment} className="card" style={{ marginBottom: 24 }}>
          <textarea
            placeholder="寫下你的留言..."
            rows={3}
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <button className="btn">送出留言</button>
        </form>
      ) : (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="muted">
            請先<Link to="/login" style={{ color: '#2563eb', marginLeft: 4, marginRight: 4 }}>登入</Link>才能留言
          </p>
        </div>
      )}

      <div>
        {comments.length === 0 ? (
          <div className="card">
            <p className="muted">還沒有留言，成為第一個留言的人吧！✨</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <strong style={{ color: '#2563eb' }}>{comment.author?.displayName || comment.author?.username}</strong>
                  <span className="muted" style={{ marginLeft: 12, fontSize: '0.85rem' }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.isEdited && (
                    <span className="muted" style={{ marginLeft: 8, fontSize: '0.8rem', fontStyle: 'italic' }}>
                      (已編輯)
                    </span>
                  )}
                </div>
                {user && (user.id === comment.author?._id || user.isAdmin) && editingCommentId !== comment._id && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditComment(comment)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: 'var(--lego-blue)'
                      }}
                    >
                      ✏️ 編輯
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: 'var(--lego-red)'
                      }}
                    >
                      🗑️ 刪除
                    </button>
                  </div>
                )}
              </div>

              {editingCommentId === comment._id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    rows={3}
                    style={{ marginBottom: 8, width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={() => handleSaveComment(comment._id)}>
                      儲存
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancelEdit}>
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{linkifyContent(comment.content)}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
