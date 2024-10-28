import axios from 'axios'

import { API_BASE_URL } from './api'

const fetchEvents = async (): Promise<any[]> => {
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
  const ANNOUNCES_API_URL = `${API_BASE_URL}/events`

  try {
    const response = await fetch(ANNOUNCES_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch announces')
    }
    const announcesData = await response.json()
    const timings = announcesData.flatMap((Event: any) => Event.timing)
    return Array.from(new Set(timings))
  } catch (error) {
    console.error('Error fetching timings:', error)
    throw error
  }
}

const postMyEvent = async (
  myEvent: any,
  token: string,
  userId: string,
): Promise<void> => {
  const POST_API_URL = `${API_BASE_URL}/user/${userId}/event`

  const requestBody = {
    ...myEvent,
    userId: userId,
  }

  try {
    console.log('JSON envoyé:', JSON.stringify(myEvent, null, 2))

    const response = await fetch(POST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error('Failed to post Event')
    }
  } catch (error) {
    console.error('Error posting Event:', error)
    throw error
  }
}

const fetchEventByUserId = async (userId: string, token: string) => {
  const url = `${API_BASE_URL}/user/${userId}/event`
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.event
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn('Event not found for user:', userId)
        return null
      }
      console.error(
        'Failed to fetch Event:',
        error.response?.data || error.message,
      )
      throw error.response?.data || error
    } else {
      console.error('Unexpected error:', error)
      throw error
    }
  }
}

const updateLocalStorageWithUserEvent = (userAnnounces: any) => {
  if (
    !userAnnounces ||
    (Array.isArray(userAnnounces) && userAnnounces.length === 0)
  ) {
    localStorage.setItem('myEvent', JSON.stringify({}))
  } else {
    localStorage.setItem('myEvent', JSON.stringify(userAnnounces))
  }
}

const getUserEvent = async (userId: string, token: string): Promise<any> => {
  const USER_ANNOUNCE_API_URL = `${API_BASE_URL}/user/${userId}/event`

  try {
    const response = await fetch(USER_ANNOUNCE_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user events')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user events:', error)
    throw error
  }
}

const updateMyEvent = async (formData: any, token: string, userId: string) => {
  if (typeof userId !== 'string') {
    throw new Error('Invalid userId')
  }

  const url = `${API_BASE_URL}/user/${userId}/event`
  const announceData = formData

  try {
    const response = await axios.patch(url, announceData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Failed to update event:',
        error.response?.data || error.message,
      )
      throw error.response?.data || error
    } else {
      console.error('Unexpected error:', error)
      throw error
    }
  }
}

const fetchEventDetails = async (userId: string): Promise<any> => {
  const WORK_API_URL = `${API_BASE_URL}/events/${userId}`

  try {
    const response = await fetch(WORK_API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch event with id ${userId}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching event details:', error)
    throw error
  }
}

const fetchEventDetailsByUserId = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/events?userId=${userId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch events details')
  }
  return response.json()
}

export {
  fetchEvents,
  updateMyEvent,
  fetchEventByUserId,
  fetchEventDetails,
  fetchEventDetailsByUserId,
  fetchGalleryByUserId,
  fetchTimings,
  postMyEvent,
  updateLocalStorageWithUserEvent,
  getUserEvent,
}
