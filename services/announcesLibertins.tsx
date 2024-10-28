// services.ts

const BASE_API_URL = 'http://localhost:3333/api'

const fetchAnnounces = async (): Promise<any[]> => {
  const FULL_API_URL = `${BASE_API_URL}/all/full`

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
  const GALLERY_API_URL = `${BASE_API_URL}/${userId}/gallery`

  try {
    const response = await fetch(GALLERY_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch gallery')
    }
    const galleryData = await response.json()
    {
      /** console.log('Gallery data:', galleryData) **/
    }

    return `http://localhost:3333/api/images/${galleryData.fileName}`
  } catch (error) {
    console.error('Error fetching gallery:', error)
    throw error
  }
}

const postMyAnnounce = async (
  myAnnounce: any,
  token: string,
  userId: string,
): Promise<void> => {
  const POST_API_URL = `${BASE_API_URL}/user/${userId}/libertin`

  try {
    console.log('Posting announce:', myAnnounce)

    const requestBody = {
      ...myAnnounce,
      userId: userId,
    }

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
  const url = `${BASE_API_URL}/user/${userId}/libertin`
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Announce not found for user:', userId)
        return null
      }
      throw new Error('Failed to fetch announce')
    }
    const data = await response.json()
    console.log('Fetched announce data:', data)
    return data.libertin
  } catch (error) {
    console.error('Error fetching announce:', error)
    throw error
  }
}

const updateLocalStorageWithUserAnnounce = (userAnnounces: any) => {
  if (
    !userAnnounces ||
    (Array.isArray(userAnnounces) && userAnnounces.length === 0)
  ) {
    localStorage.setItem('myAnnounce', JSON.stringify({}))
  } else {
    localStorage.setItem('myAnnounce', JSON.stringify(userAnnounces))
  }
}

const getUserAnnounce = async (userId: string, token: string): Promise<any> => {
  const USER_ANNOUNCE_API_URL = `${BASE_API_URL}/user/${userId}/libertin`

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

const updateMyAnnounce = async (token: string, userId: string) => {
  const url = `${BASE_API_URL}/user/${userId}/libertin`
  const myAnnounceStr = localStorage.getItem('myAnnounce')
  const announceData = myAnnounceStr ? JSON.parse(myAnnounceStr) : {}

  console.log('URL:', url)
  console.log('Token:', token)
  console.log('Announce Data:', announceData)

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(announceData),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid token')
      }
      throw new Error('Failed to update announce')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating announce:', error)
    throw error
  }
}

interface Announce {
  id: number
  userId: number
  title: string
}

const fetchAnnounce = async (): Promise<Announce[]> => {
  const response = await fetch('http://localhost:3333/api/libertins')
  if (!response.ok) {
    throw new Error('Failed to fetch announces')
  }
  const data = await response.json()
  return data
}

const fetchAnnounceDetails = async (id: string): Promise<any> => {
  const ANNOUNCE_API_URL = `${BASE_API_URL}/libertins/${id}`

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

export {
  fetchAnnounces,
  fetchAnnounceDetails,
  fetchAnnounce,
  updateMyAnnounce,
  fetchAnnounceByUserId,
  fetchGalleryByUserId,
  postMyAnnounce,
  updateLocalStorageWithUserAnnounce,
  getUserAnnounce,
}
export type { Announce }
