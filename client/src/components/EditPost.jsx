import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchJSON } from '../api'
import { showToast } from './Toast'

export default function EditPost({ user }) {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [image, setImage] = useState(null)
  const [currentImage, setCurrentImage] = useState('')
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    const loadPost = async () => {
      const res = await fetchJSON(`/api/posts/${id}`)
      if (res.ok) {
        setTitle(res.post.title)
        setContent(res.post.content)
        setTags(res.post.tags.join(', '))
        setCurrentImage(res.post.image)
      } else {
        showToast('無法載入文章', 'error')
        nav('/')
      }
      setLoading(false)
    }
    loadPost()
  }, [id, nav])

  const submit = async e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', title)
    fd.append('content', content)
    fd.append('tags', tags)
    if (image) fd.append('image', image)

    const res = await fetchJSON(`/api/posts/${id}`, { method: 'PUT', body: fd })
    if (res.ok) {
      showToast(res.message || '文章更新成功！')
      nav(`/posts/${id}`)
    } else {
      showToast(res.error || '更新失敗', 'error')
    }
  }

  if (loading) return <div className="container">載入中...</div>
  if (!user || !user.isAdmin) return <div className="container"><p>只有管理員可以編輯文章。</p></div>

  return (
    <div className="container">
      <h2>編輯文章</h2>
      <form onSubmit={submit} className="card">
        <div className="form-row">
          <input placeholder="標題" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-row">
          <textarea placeholder="內容" rows="8" value={content} onChange={e => setContent(e.target.value)} required />
        </div>
        <div className="form-row">
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            主題 <span className="muted" style={{ fontWeight: 400 }}>(用逗號分隔,例如:樂高, 停格動畫, 教學)</span>
          </label>
          <input placeholder="例如:樂高, 停格動畫, 教學" value={tags} onChange={e => setTags(e.target.value)} />
        </div>
        {currentImage && (
          <div style={{marginBottom: '12px'}}>
            <p style={{marginBottom: '8px'}}>目前的圖片:</p>
            <img src={`http://localhost:5000${currentImage}`} alt="Current" style={{maxWidth: '200px', borderRadius: '8px'}} />
          </div>
        )}
        <div className="form-row">
          <label>更換圖片 (選填):</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </div>
        <button className="btn">更新文章</button>
      </form>
    </div>
  )
}
