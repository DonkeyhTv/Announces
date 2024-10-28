// services.ts

import axios from 'axios'

import { API_BASE_URL } from '../services/api'
import { useEffect } from 'react'
import { fetchUsers } from './fetchAllUser'
import calculateAge from '../src/fonctions/calculateAge'

const fetchAnnouncess = async (): Promise<any[]> => {
  const FULL_API_URL = `${API_BASE_URL}/all/full`

  try {
    const response = await fetch(FULL_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

const fetchGalleryByUserId = async (userId: number): Promise<string> => {
  const GALLERY_API_URL = `${API_BASE_URL}/${userId}/gallery`

  try {
    const response = await fetch(GALLERY_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch gallery')
    }
    const galleryData = await response.json()
    return `path/to/your/images/${galleryData.fileName}`
  } catch (error) {
    console.error('Error fetching gallery:', error)
    throw error
  }
}

const fetchTimings = async (): Promise<string[]> => {
  const ANNOUNCES_API_URL = `${API_BASE_URL}/announces`

  try {
    const response = await fetch(ANNOUNCES_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch announces')
    }
    const announcesData = await response.json()
    const timings = announcesData.flatMap((announce: any) => announce.timing)
    return Array.from(new Set(timings)) // Supprime les doublons
  } catch (error) {
    console.error('Error fetching timings:', error)
    throw error
  }
}

const postMyAnnounce = async (
  myAnnounce: any,
  token: string,
  userId: string,
): Promise<void> => {
  const POST_API_URL = `${API_BASE_URL}/user/${userId}/announce/`
  const requestBody = {
    ...myAnnounce,
    userId: userId,
  }
  try {
    const response = await fetch(POST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error('Failed to post announce')
    }
  } catch (error) {
    console.error('Error posting announce:', error)
    throw error
  }
}

const fetchAnnounceByUserId = async (userId: string, token: string) => {
  const url = `${API_BASE_URL}/user/${userId}/announce`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.announce
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null
      }
      console.error(
        'Failed to fetch announce:',
        error.response?.data || error.message,
      )
      throw error.response?.data || error
    } else {
      console.error('Unexpected error:', error)
      throw error
    }
  }
}

const updateLocalStorageWithUserAnnounce = (userAnnouncess: any) => {
  if (
    !userAnnouncess ||
    (Array.isArray(userAnnouncess) && userAnnouncess.length === 0)
  ) {
    localStorage.setItem('myAnnounce', JSON.stringify({}))
  } else {
    localStorage.setItem('myAnnounce', JSON.stringify(userAnnouncess))
  }
}

const getUserAnnounces = async (
  userId: string,
  token: string,
): Promise<any> => {
  const USER_ANNOUNCE_API_URL = `${API_BASE_URL}/user/${userId}/announce`

  try {
    const response = await fetch(USER_ANNOUNCE_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user announce')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user announce:', error)
    throw error
  }
}

const updateMyAnnounce = async (userId: string, token: string) => {
  const url = `${API_BASE_URL}/user/${userId}/announce`
  const myAnnouncesStr = localStorage.getItem('myAnnounce')
  const announceData = myAnnouncesStr ? JSON.parse(myAnnouncesStr) : {}

  try {
    const response = await axios.patch(url, announceData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    console.log('Server response:', response.data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Failed to update announce:',
        error.response?.data || error.message,
      )
      throw error.response?.data || error
    } else {
      console.error('Unexpected error:', error)
      throw error
    }
  }
}

const fetchAnnounceDetails = async (id: string): Promise<any> => {
  const ANNOUNCE_API_URL = `${API_BASE_URL}/announces/${id}`

  try {
    const response = await fetch(ANNOUNCE_API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch announce with id ${id}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching announce details:', error)
    throw error
  }
}

const fetchAnnouncesDetailsByUserId = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/announce?userId=${userId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch Announces details')
  }
  return response.json()
}

export {
  fetchAnnouncess,
  updateMyAnnounce,
  fetchAnnounceByUserId,
  fetchAnnouncesDetailsByUserId,
  fetchGalleryByUserId,
  fetchAnnounceDetails,
  fetchTimings,
  postMyAnnounce,
  updateLocalStorageWithUserAnnounce,
  getUserAnnounces,
}
