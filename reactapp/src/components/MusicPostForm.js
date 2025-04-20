import { useState } from 'react'
import { usePostsContext } from '../hooks/usePostsContext'
import { useAuthContext } from '../hooks/useAuthContext'

const MusicPostForm = () => {
  const { dispatch } = usePostsContext()
  const { user } = useAuthContext()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('audio', audioFile)
    formData.append('artist', user?.username) // assuming your token includes username

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formData
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Something went wrong')
      } else {
        dispatch({ type: 'CREATE_POST', payload: json })
        setTitle('')
        setDescription('')
        setAudioFile(null)
        setError(null)
      }
    } catch (err) {
      setError('Server error or network issue')
    }

    setIsLoading(false)
  }

  return (
    <form className="music-post-form" onSubmit={handleSubmit}>
      <h3>Create a New Music Post</h3>

      <label>Title:</label>
      <input
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        required
      />

      <label>Description:</label>
      <textarea
        onChange={(e) => setDescription(e.target.value)}
        value={description}
        required
      ></textarea>

      <label>Audio File (.mp3 or .wav):</label>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudioFile(e.target.files[0])}
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Post Track'}
      </button>

      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default MusicPostForm
