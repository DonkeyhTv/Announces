import axios from 'axios'
import { API_BASE_URL } from './api'

const fetchWorks = async (): Promise<any[]> => {
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
  const ANNOUNCES_API_URL = `${API_BASE_URL}/works`

  try {
    const response = await fetch(ANNOUNCES_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch announces')
    }
    const announcesData = await response.json()
    const timings = announcesData.flatMap((Work: any) => Work.timing)
    return Array.from(new Set(timings))
  } catch (error) {
    console.error('Error fetching timings:', error)
    throw error
  }
}

const postMyWork = async (
  myJobOffer: any,
  token: string,
  userId: string,
): Promise<void> => {
  const POST_API_URL = `${API_BASE_URL}/user/${userId}/work`

  const requestBody = {
    ...myJobOffer,
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
      throw new Error('Failed to post Work')
    }
  } catch (error) {
    console.error('Error posting Work:', error)
    throw error
  }
}

const fetchWorkByUserId = async (userId: string, token: string) => {
  const url = `${API_BASE_URL}/user/${userId}/work`
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.work
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn('Job Offers not found for user:', userId)
        return null
      }
      console.error(
        'Failed to fetch Work:',
        error.response?.data || error.message,
      )
      throw error.response?.data || error
    } else {
      console.error('Unexpected error:', error)
      throw error
    }
  }
}

const updateLocalStorageWithUserWork = (userAnnounces: any) => {
  if (
    !userAnnounces ||
    (Array.isArray(userAnnounces) && userAnnounces.length === 0)
  ) {
    localStorage.setItem('myJobOffer', JSON.stringify({}))
  } else {
    localStorage.setItem('myJobOffer', JSON.stringify(userAnnounces))
  }
}

const getUserWork = async (userId: string, token: string): Promise<any> => {
  const USER_ANNOUNCE_API_URL = `${API_BASE_URL}/user/${userId}/work`

  try {
    const response = await fetch(USER_ANNOUNCE_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user works')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user works:', error)
    throw error
  }
}

const updateMyWork = async (formData: any, token: string, userId: string) => {
  if (typeof userId !== 'string') {
    throw new Error('Invalid userId')
  }

  const url = `${API_BASE_URL}/user/${userId}/work`
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
        'Failed to update works:',
        error.response?.data || error.message,
      )
      throw error.response?.data || error
    } else {
      console.error('Unexpected error:', error)
      throw error
    }
  }
}

const fetchWorkDetails = async (userId: string): Promise<any> => {
  const WORK_API_URL = `${API_BASE_URL}/works/${userId}`

  try {
    const response = await fetch(WORK_API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch work with id ${userId}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching work details:', error)
    throw error
  }
}

const fetchWorkDetailsByUserId = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/works?userId=${userId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch works details')
  }
  return response.json()
}

export {
  fetchWorks,
  updateMyWork,
  fetchWorkByUserId,
  fetchWorkDetails,
  fetchWorkDetailsByUserId,
  fetchGalleryByUserId,
  fetchTimings,
  postMyWork,
  updateLocalStorageWithUserWork,
  getUserWork,
}
