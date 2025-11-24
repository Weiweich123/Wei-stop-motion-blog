import React, { useState } from 'react'
import { fetchJSON } from '../api'
import { useNavigate } from 'react-router-dom'
import { showToast } from './Toast'

export default function CreatePost({ user }){
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [image, setImage] = useState(null)
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  if(!user) return <div className="container"><p>請先登入才能發表文章。</p></div>
  if(!user.isAdmin) return <div className="container"><p>只有管理員可以發表文章。</p></div>

  const submit = async e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', title)
    fd.append('content', content)
    fd.append('tags', tags)
    if(image) fd.append('image', image)
    const res = await fetch('/api/posts/create', { method: 'POST', body: fd, credentials: 'include' })
    const data = await res.json()
    if(data.ok){
      setMsg('發表成功')
      showToast('文章發表成功！')
      nav('/')
    }
    else {
      setMsg(data.error || '發表失敗')
      showToast(data.error || '發表失敗', 'error')
    }
  }

  return (
    <div className="container">
      <h2>發表新文章</h2>
      <form onSubmit={submit} className="card">
        <div className="form-row">
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>標題</label>
          <input placeholder="輸入文章標題" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="form-row">
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>內容</label>
          <textarea placeholder="輸入文章內容" rows={8} value={content} onChange={e=>setContent(e.target.value)} />
        </div>
        <div className="form-row">
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            主題 <span className="muted" style={{ fontWeight: 400 }}>(用逗號分隔，例如：樂高, 停格動畫, 教學)</span>
          </label>
          <input placeholder="例如：樂高, 停格動畫, 教學" value={tags} onChange={e=>setTags(e.target.value)} />
          <p className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
            💡 主題可以幫助讀者快速找到相關文章，建議加入 1-3 個主題
          </p>
        </div>
        <div className="form-row">
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>縮圖圖片（選填）</label>
          <input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)} />
        </div>
        <button className="btn">發表文章</button>
        {msg && <p className="muted">{msg}</p>}
      </form>
    </div>
  )
}
