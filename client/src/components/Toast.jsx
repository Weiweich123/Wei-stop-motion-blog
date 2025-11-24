import React, { useState, useEffect } from 'react'

let toastId = 0
const toastListeners = []

export function showToast(message, type = 'success') {
  toastListeners.forEach(listener => listener({ id: ++toastId, message, type }))
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const listener = (toast) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 3000)
    }
    toastListeners.push(listener)
    return () => {
      const idx = toastListeners.indexOf(listener)
      if (idx > -1) toastListeners.splice(idx, 1)
    }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
