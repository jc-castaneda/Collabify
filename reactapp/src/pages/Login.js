import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { dispatch } = useAuthContext()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await fetch('http://localhost:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const json = await response.json()

    if (!response.ok) {
      setError(json.error || 'Login failed')
    } else {
      localStorage.setItem('user', JSON.stringify(json))
      dispatch({ type: 'LOGIN', payload: json })
      window.location.href = '/'
    }
  }

  return (
  <form onSubmit={handleSubmit} className="form-container">
    <h3>Login</h3>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button type="submit" className="login-button">Log In</button>
    {error && <div className="error">{error}</div>}
  </form>

  )
}

export default Login
