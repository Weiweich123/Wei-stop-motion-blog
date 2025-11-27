import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJSON, API_BASE } from '../api'
import { showToast } from './Toast'

export default function Register({ onRegister }){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    const res = await fetchJSON('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username, email, displayName, password }) })
    if(res.ok){
      onRegister(res.user)
      showToast(res.message || '註冊成功！')
      nav('/')
    }
    else {
      setErr(res.error || 'Register failed')
      showToast(res.error || '註冊失敗', 'error')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`
  }

  return (
    <div className="container">
      <h2>註冊</h2>
      <form onSubmit={submit} className="card">
        {err && <div style={{color:'red', marginBottom:8}}>{err}</div>}
        <div className="form-row">
          <input type="text" placeholder="使用者名稱 (選填)" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div className="form-row">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <input type="text" placeholder="顯示名稱 (選填)" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        </div>
        <div className="form-row">
          <input type="password" placeholder="密碼" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button className="btn">註冊</button>
        <div style={{margin: '16px 0', textAlign: 'center', color: '#64748b'}}>或</div>
        <button type="button" className="btn btn-secondary" onClick={handleGoogleLogin}>
          使用 Google 註冊
        </button>
      </form>
    </div>
  )
}
