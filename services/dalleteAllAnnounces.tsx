import axios from 'axios'
import { API_BASE_URL } from './api'

export const deleteAnnounce = async () => {
  try {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')

    if (!userId || !token) {
      throw new Error('User ID or token not found in local storage')
    }

    const response = await axios.delete(
      `${API_BASE_URL}/user/${userId}/announce`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  } catch (error) {
    console.error('Error deleting announce:', error)
    throw error
  }
}

export const deleteWork = async () => {
  try {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')

    if (!userId || !token) {
      throw new Error('User ID or token not found in local storage')
    }

    const response = await axios.delete(`${API_BASE_URL}/user/${userId}/work`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error deleting work:', error)
    throw error
  }
}

export const deleteEvent = async () => {
  try {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')

    if (!userId || !token) {
      throw new Error('User ID or token not found in local storage')
    }

    const response = await axios.delete(
      `${API_BASE_URL}/user/${userId}/event`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

export const deleteEstablishment = async () => {
  try {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')

    if (!userId || !token) {
      throw new Error('User ID or token not found in local storage')
    }

    const response = await axios.delete(
      `${API_BASE_URL}/user/${userId}/establishment`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  } catch (error) {
    console.error('Error deleting establishment:', error)
    throw error
  }
}
