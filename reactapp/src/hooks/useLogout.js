import { useAuthContext } from './useAuthContext'

export const useLogout = () => {
  const { dispatch } = useAuthContext()

  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('user')

    // Dispatch logout
    dispatch({ type: 'LOGOUT' })
  }

  return { logout }
}
