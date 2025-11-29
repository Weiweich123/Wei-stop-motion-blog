import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchJSON } from '../api'
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

export default function DiscussionDetail({ user }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [discussion, setDiscussion] = useState(null)
  const [comments, setComments] = useState([])
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [isEditingDiscussion, setIsEditingDiscussion] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDiscContent, setEditDiscContent] = useState('')

  const loadDiscussion = async () => {
    const res = await fetchJSON(`/api/discussions/${id}`)
    if (res.ok) {
      setDiscussion(res.discussion)
      setEditTitle(res.discussion.title)
      setEditDiscContent(res.discussion.content)
    } else {
      setError(true)
      showToast('無法載入討論', 'error')
    }
  }

  const loadComments = async () => {
    const res = await fetchJSON(`/api/discussions/${id}/comments`)
    if (res.ok) setComments(res.comments)
  }

  useEffect(() => {
    const loadData = async () => {
      await loadDiscussion()
      await loadComments()
      setLoading(false)
    }
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

    const res = await fetchJSON(`/api/discussions/${id}/comments`, {
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

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('確定要刪除這篇討論嗎?')) return

    const res = await fetchJSON(`/api/discussions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast(res.message || '討論已刪除！')
      nav('/discussions')
    } else {
      showToast(res.error || '刪除失敗', 'error')
    }
  }

  const handleSaveDiscussion = async () => {
    const res = await fetchJSON(`/api/discussions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, content: editDiscContent })
    })

    if (res.ok) {
      showToast(res.message || '討論已更新！')
      setIsEditingDiscussion(false)
      loadDiscussion()
    } else {
      showToast(res.error || '更新失敗', 'error')
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

    const res = await fetchJSON(`/api/discussions/${id}/comments/${commentId}`, {
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

    const res = await fetchJSON(`/api/discussions/${id}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast(res.message || '留言已刪除！')
      loadComments()
    } else {
      showToast(res.error || '刪除失敗', 'error')
    }
  }

  if (loading) return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div className="loading-spinner"></div>
        <p className="muted" style={{ marginTop: 16 }}>載入討論中...</p>
      </div>
    </div>
  )

  if (error || !discussion) return (
    <div className="container">
      <div className="card"><p>討論不存在</p></div>
    </div>
  )

  const canEdit = user && (user._id === discussion.author?._id || user.isAdmin)

  return (
    <div className="container">
      <Link to="/discussions" style={{
        color: '#2563eb',
        marginBottom: 16,
        display: 'inline-block',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: 8,
        fontWeight: 600,
        border: '1px solid #e2e8f0'
      }}>
        ← 回到討論區
      </Link>

      <div className="card pop-in" style={{ marginBottom: 24 }}>
        {isEditingDiscussion ? (
          <div>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ marginBottom: 12, fontSize: '1.5rem', fontWeight: 'bold' }}
            />
            <textarea
              value={editDiscContent}
              onChange={e => setEditDiscContent(e.target.value)}
              rows={8}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={handleSaveDiscussion}>儲存</button>
              <button className="btn btn-secondary" onClick={() => setIsEditingDiscussion(false)}>取消</button>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ marginTop: 0, marginBottom: 12 }}>
              {discussion.title}
              {discussion.isEdited && <span className="muted" style={{ fontSize: '0.75rem', marginLeft: 8 }}>(已編輯)</span>}
            </h1>

            <div style={{ marginBottom: 16 }}>
              <p className="muted" style={{ margin: 0, marginBottom: 4 }}>
                發起者：<strong>{discussion.author?.displayName || discussion.author?.username}</strong>
              </p>
              <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                {new Date(discussion.createdAt).toLocaleString()}
              </p>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, marginBottom: 24, fontSize: '1.05rem' }}>
              {linkifyContent(discussion.content)}
            </div>

            {canEdit && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setIsEditingDiscussion(true)}>
                  ✏️ 編輯討論
                </button>
                <button className="btn" onClick={handleDeleteDiscussion} style={{ background: '#dc2626' }}>
                  🗑️ 刪除討論
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <h3 style={{ marginBottom: 16 }}>
        💬 回覆 ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={submitComment} className="card" style={{ marginBottom: 24 }}>
          <textarea
            placeholder="寫下你的回覆..."
            rows={3}
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <button className="btn">送出回覆</button>
        </form>
      ) : (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="muted">
            請先<Link to="/login" style={{ color: '#2563eb', marginLeft: 4, marginRight: 4 }}>登入</Link>才能回覆
          </p>
        </div>
      )}

      <div>
        {comments.length === 0 ? (
          <div className="card">
            <p className="muted">還沒有回覆，成為第一個回覆的人吧！✨</p>
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
                {user && editingCommentId !== comment._id && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {user._id === comment.author?._id && (
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
                    )}
                    {(user._id === comment.author?._id || user.isAdmin) && (
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
                    )}
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
