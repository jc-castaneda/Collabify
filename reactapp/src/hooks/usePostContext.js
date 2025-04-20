import { useContext } from 'react'
import { PostContext } from '../context/PostContext'

export const usePostsContext = () => {
  const context = useContext(PostContext)

  if (!context) {
    throw Error('usePostsContext must be used inside a PostContextProvider')
  }

  return context
}
