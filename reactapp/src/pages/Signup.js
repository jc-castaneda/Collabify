import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const Signup = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    bio: '',
    skills: '',
    interests: '',
    user_type: 'Producer'
  })

  const [error, setError] = useState(null)
  const { dispatch } = useAuthContext()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      ...form,
      skills: form.skills.split(',').map(s => s.trim()),
      interests: form.interests.split(',').map(i => i.trim())
    }

    const response = await fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const json = await response.json()

    if (!response.ok) {
      setError(json.error || 'Signup failed')
    } else {
      localStorage.setItem('user', JSON.stringify(json))
      dispatch({ type: 'LOGIN', payload: json })
      window.location.href = '/'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h3>Sign Up</h3>
      <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
      <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" />
      <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma-separated)" />
      <input name="interests" value={form.interests} onChange={handleChange} placeholder="Interests (comma-separated)" />
      <select name="user_type" value={form.user_type} onChange={handleChange}>
        <option value="Producer">Producer</option>
        <option value="Engineer">Engineer</option>
        <option value="Listener">Listener</option>
      </select>
      <button type="submit" className="signup-button">Sign Up</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>

  )
}

export default Signup
