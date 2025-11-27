import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJSON, API_BASE } from '../api'
import { showToast } from './Toast'

export default function Login({ onLogin }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    const res = await fetchJSON('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
    if(res.ok){
      onLogin(res.user)
      showToast(res.message || '登入成功！')
      nav('/')
    }
    else {
      setErr(res.error || 'Login failed')
      showToast(res.error || '登入失敗', 'error')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`
  }

  return (
    <div className="container">
      <h2>登入</h2>
      <form onSubmit={submit} className="card">
        {err && <div style={{color:'red', marginBottom:8}}>{err}</div>}
        <div className="form-row">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <input type="password" placeholder="密碼" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button className="btn">登入</button>
        <div style={{margin: '16px 0', textAlign: 'center', color: '#64748b'}}>或</div>
        <button type="button" className="btn btn-secondary" onClick={handleGoogleLogin}>
          使用 Google 登入
        </button>
      </form>
    </div>
  )
}
