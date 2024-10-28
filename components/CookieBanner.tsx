import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useTranslation()

  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const part = parts.pop()
      if (part) return part.split(';').shift()
    }
    return null
  }

  useEffect(() => {
    const cookieConsent = getCookie('cookieConsent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const getCurrentTimestamp = () => {
    return new Date().toISOString()
  }

  const handleAccept = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: getCurrentTimestamp(),
    }

    setCookie('cookieConsent', JSON.stringify(consent), 365) // Stocke le consentement pour 1 an (365 jours)
    setIsVisible(false)
  }

  const handleDecline = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: getCurrentTimestamp(),
    }

    setCookie('cookieConsent', JSON.stringify(consent), 365) // Stocke le refus pour 1 an (365 jours)
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-redpink text-white p-4 flex justify-between items-center'>
      <p>{t('cookies')}</p>
      <div>
        <button
          onClick={handleAccept}
          className='bg-anthracite text-white px-4 py-2 rounded mr-2'
        >
          {t('accept')}
        </button>
        <button
          onClick={handleDecline}
          className='bg-gray-500 text-white px-4 py-2 rounded'
        >
          {t('decline')}
        </button>
      </div>
    </div>
  )
}

export default CookieBanner
