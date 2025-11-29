import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import CreatePost from './components/CreatePost'
import EditPost from './components/EditPost'
import PostDetail from './components/PostDetail'
import AdminPanel from './components/AdminPanel'
import Discussions from './components/Discussions'
import CreateDiscussion from './components/CreateDiscussion'
import DiscussionDetail from './components/DiscussionDetail'
import Toast from './components/Toast'
import { fetchJSON } from './api'

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const loadProfile = async () => {
    const res = await fetchJSON('/api/auth/profile', { method: 'GET' })
    if (res.ok) setUser(res.user)
    else setUser(null)
    setAuthLoading(false)
  }

  useEffect(() => { loadProfile() }, [])

  return (
    <div>
      <Toast />
      <NavBar user={user} authLoading={authLoading} onUserChange={setUser} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail user={user} />} />
          <Route path="/posts/:id/edit" element={<EditPost user={user} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onRegister={setUser} />} />
          <Route path="/profile" element={<Profile user={user} onUserUpdate={setUser} />} />
          <Route path="/create" element={<CreatePost user={user} />} />
          <Route path="/admin" element={<AdminPanel user={user} />} />
          <Route path="/discussions" element={<Discussions user={user} />} />
          <Route path="/discussions/new" element={<CreateDiscussion user={user} />} />
          <Route path="/discussions/:id" element={<DiscussionDetail user={user} />} />
        </Routes>
      </div>
    </div>
  )
}
