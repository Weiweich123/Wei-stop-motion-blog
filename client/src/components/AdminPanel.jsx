import React, { useEffect, useState } from 'react'
import { fetchJSON } from '../api'
import { showToast } from './Toast'

export default function AdminPanel({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.isAdmin) {
      loadUsers()
    }
  }, [user])

  const loadUsers = async () => {
    const res = await fetchJSON('/api/admin/users')
    if (res.ok) {
      setUsers(res.users)
    } else {
      showToast(res.error || '無法載入使用者列表', 'error')
    }
    setLoading(false)
  }

  const toggleAdmin = async (userId, username, currentIsAdmin) => {
    const res = await fetchJSON(`/api/admin/users/${userId}/toggle-admin`, {
      method: 'POST'
    })

    if (res.ok) {
      showToast(res.message)
      loadUsers()
    } else {
      showToast(res.error || '操作失敗', 'error')
    }
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <h2>❌ 需要管理員權限</h2>
          <p>只有管理員可以訪問此頁面。</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2 style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', marginBottom: 20 }}>
        👑 管理員面板
      </h2>

      <div className="card">
        <h3 style={{ marginBottom: 16, color: 'var(--lego-red)' }}>
          使用者管理 ({users.length} 位使用者)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>使用者名稱</th>
                <th style={{ padding: 12, textAlign: 'left' }}>註冊時間</th>
                <th style={{ padding: 12, textAlign: 'center' }}>身份</th>
                <th style={{ padding: 12, textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: 12, fontWeight: u.isAdmin ? 'bold' : 'normal' }}>
                    {u.username}
                    {u._id === user.id && <span className="muted"> (你)</span>}
                  </td>
                  <td style={{ padding: 12 }} className="muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    {u.isAdmin ? (
                      <span style={{
                        background: 'linear-gradient(135deg, #e3000f 0%, #c20010 100%)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        👑 管理員
                      </span>
                    ) : (
                      <span style={{
                        background: '#e5e7eb',
                        color: '#6b7280',
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: '0.85rem'
                      }}>
                        一般使用者
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    {u._id === user.id ? (
                      <span className="muted">—</span>
                    ) : (
                      <button
                        onClick={() => toggleAdmin(u._id, u.username, u.isAdmin)}
                        className={u.isAdmin ? 'btn btn-red' : 'btn btn-green'}
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        {u.isAdmin ? '移除管理員' : '設為管理員'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
