import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchJSON } from '../api'
import { showToast } from './Toast'

export default function NavBar({ user, onUserChange }) {
  const nav = useNavigate()

  const logout = async () => {
    const res = await fetchJSON('/api/auth/logout', { method: 'POST' })
    if (res.ok) {
      showToast(res.message || '登出成功！')
    } else {
      showToast('登出失敗', 'error')
    }
    onUserChange(null)
    nav('/')
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">🧱 CH峻瑋的停格動畫部落格</Link>

        <div className="nav-links">
          <Link to="/discussions">討論區</Link>
          {user ? (
            <>
              <span style={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                Hi, {user.displayName || user.username}
                {user.isAdmin && (
                  <span style={{
                    background: 'linear-gradient(135deg, var(--lego-yellow), var(--lego-red))',
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-xs)'
                  }}>👑 Admin</span>
                )}
              </span>
              {user.isAdmin && <Link to="/create">發表文章</Link>}
              {user.isAdmin && <Link to="/admin">管理面板</Link>}
              <Link to="/profile">個人頁面</Link>
              <button className="btn btn-secondary" onClick={logout} style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                登出
              </button>
            </>
          ) : (
            <>
              <Link to="/login">登入</Link>
              <Link to="/register">註冊</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
