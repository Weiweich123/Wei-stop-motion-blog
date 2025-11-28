import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJSON } from '../api'
import { showToast } from './Toast'

export default function CreateDiscussion({ user }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      showToast('請填寫標題和內容', 'error')
      return
    }

    const res = await fetchJSON('/api/discussions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    })

    if (res.ok) {
      showToast(res.message || '發文成功！')
      nav(`/discussions/${res.discussion._id}`)
    } else {
      showToast(res.error || '發文失敗', 'error')
    }
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h2>請先登入</h2>
          <p>你需要登入才能發起討論。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>發起討論</h2>
      <form onSubmit={submit} className="card">
        <div className="form-row">
          <input
            placeholder="討論標題"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <textarea
            placeholder="討論內容..."
            rows="8"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>
        <button className="btn">發佈討論</button>
      </form>
    </div>
  )
}
