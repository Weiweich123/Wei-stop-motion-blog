import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchJSON, API_BASE } from '../api'
import { showToast } from './Toast'

export default function EditPost({ user }) {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [image, setImage] = useState(null)
  const [currentImage, setCurrentImage] = useState('')
  const [removeImage, setRemoveImage] = useState(false)
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
    if (removeImage) {
      fd.append('removeImage', 'true')
    } else if (image) {
      fd.append('image', image)
    }

    const res = await fetchJSON(`/api/posts/${id}`, { method: 'PUT', body: fd })
    if (res.ok) {
      showToast(res.message || '文章更新成功！')
      nav(`/posts/${id}`)
    } else {
      showToast(res.error || '更新失敗', 'error')
    }
  }

  const handleRemoveImage = () => {
    setRemoveImage(true)
    setCurrentImage('')
    setImage(null)
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
        {currentImage && !removeImage && (
          <div style={{marginBottom: '12px'}}>
            <p style={{marginBottom: '8px'}}>目前的圖片:</p>
            <img src={`${API_BASE}${currentImage}`} alt="Current" style={{maxWidth: '200px', borderRadius: '8px', marginBottom: '8px', display: 'block'}} />
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              刪除圖片
            </button>
          </div>
        )}
        {removeImage && (
          <div style={{marginBottom: '12px', padding: '10px', background: '#fff3cd', borderRadius: '4px'}}>
            <span>圖片將在儲存後刪除</span>
            <button
              type="button"
              onClick={() => setRemoveImage(false)}
              style={{
                marginLeft: '10px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              取消
            </button>
          </div>
        )}
        {!removeImage && (
          <div className="form-row">
            <label>{currentImage ? '更換圖片 (選填):' : '上傳圖片 (選填):'}</label>
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
          </div>
        )}
        <button className="btn">更新文章</button>
      </form>
    </div>
  )
}
