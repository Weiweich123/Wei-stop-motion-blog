import React, { useState } from 'react'
import { fetchJSON } from '../api'
import { showToast } from './Toast'

export default function Profile({ user, onUserUpdate }){
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '')

  if(!user) return <div className="container"><p>請先登入。</p></div>

  const handleUpdate = async (e) => {
    e.preventDefault()
    const res = await fetchJSON('/api/auth/profile', {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ displayName })
    })
    if(res.ok){
      onUserUpdate(res.user)
      showToast(res.message || '名稱更新成功！')
      setIsEditing(false)
    } else {
      showToast(res.error || '更新失敗', 'error')
    }
  }

  return (
    <div className="container">
      <h2>個人頁面</h2>
      <div className="card">
        <p><strong>使用者名稱：</strong>{user.username}</p>
        <p><strong>Email：</strong>{user.email || '未設定'}</p>
        <p><strong>顯示名稱：</strong>{user.displayName || user.username}</p>
        <p><strong>建立時間：</strong>{user.createdAt ? new Date(user.createdAt).toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '未知'}</p>

        {!isEditing ? (
          <button className="btn" onClick={() => setIsEditing(true)}>編輯名稱</button>
        ) : (
          <form onSubmit={handleUpdate} style={{marginTop: '16px'}}>
            <div className="form-row">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="輸入新的顯示名稱"
                required
              />
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button type="submit" className="btn">儲存</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>取消</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
