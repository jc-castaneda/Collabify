import { usePostsContext } from '../hooks/usePostsContext'
import { useAuthContext } from '../hooks/useAuthContext'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const PostDetails = ({ post }) => {
  const { dispatchPost } = usePostsContext()
  const { user } = useAuthContext()

  const handleDelete = async () => {
    const response = await fetch('/api/posts/' + post._id, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })

    const json = await response.json()

    if (response.ok) {
      dispatchPost({ type: 'DELETE_POST', payload: json })
    }
  }

  return (
    <div className="post-details">
      <h4>{post.title}</h4>
      <p><strong>Artist: </strong>{post.artist}</p>
      <p><strong>Description: </strong>{post.description}</p>

      <audio controls src={post.audioURL}>
        Your browser does not support the audio element.
      </audio>

      <p>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>

      {user && user.username === post.artist && (
        <span className="material-symbols-outlined" onClick={handleDelete}>
          delete
        </span>
      )}
    </div>
  )
}

export default PostDetails
