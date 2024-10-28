import React, { useEffect, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthService from './login'

const REFRESH_THRESHOLD = 120 * 60 * 1000 // 120 minutes en millisecondes

const withAuth = (
  WrappedComponent: React.ComponentType,
  requireAuth: boolean = true,
) => {
  return (props: any) => {
    const location = useLocation()

    const checkAuthAndRefreshToken = useCallback(async () => {
      const token = localStorage.getItem('token')
      const expiration = localStorage.getItem('expiration')

      if (!token || !expiration) {
        if (requireAuth) {
          console.log(
            "Pas de token ou d'expiration trouvé. Redirection vers la page de connexion.",
          )
          AuthService.logout()
          return false
        }
        return true
      }

      const expirationTime = new Date(expiration).getTime()
      const currentTime = new Date().getTime()
      const timeLeft = expirationTime - currentTime

      console.log(
        `Route ${
          location.pathname
        } - Temps restant de validité du token : ${Math.round(
          timeLeft / 60000,
        )} minutes`,
      )

      if (timeLeft < REFRESH_THRESHOLD) {
        console.log(
          'Le token expirera bientôt. Tentative de rafraîchissement...',
        )
        try {
          await AuthService.refreshToken()
          console.log('Token rafraîchi avec succès')
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du token:', error)
          if (requireAuth) {
            AuthService.logout()
            return false
          }
        }
      }

      return true
    }, [location.pathname, requireAuth])

    useEffect(() => {
      checkAuthAndRefreshToken()
    }, [checkAuthAndRefreshToken])

    if (requireAuth && !AuthService.isAuthenticated()) {
      return <Navigate to='/login' state={{ from: location }} replace />
    }

    return <WrappedComponent {...props} />
  }
}

export default withAuth
