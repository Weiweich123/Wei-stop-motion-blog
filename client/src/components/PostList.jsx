import React from 'react'

export default function PostList({ posts }){
  if(!posts || posts.length===0) return <div className="muted">尚無文章</div>
  return (
    <div className="posts">
      {posts.map(p => (
        <div key={p._id} className="card">
          {p.image && <img className="post-img" src={p.image} alt="thumb" />}
          <h3>{p.title}</h3>
          <p className="muted">{new Date(p.createdAt).toLocaleString()}</p>
          <p>{p.content.slice(0,120)}{p.content.length>120?'...':''}</p>
        </div>
      ))}
    </div>
  )
}
