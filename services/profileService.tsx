import axios from 'axios'
import { API_BASE_URL } from './api'

import { getUser } from './oneUser'
import calculateAge from '../src/fonctions/calculateAge'
interface UserData {
  user: {
    birthday: string
  }
}
const postUserProfile = async (profileData: any, isNewProfile: boolean) => {
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  if (!userId || !token) {
    throw new Error('User ID or token is missing')
  }

  try {
    const userData: UserData = await getUser(userId, token)

    if (!userData.user.birthday) {
      throw new Error('User birthday is missing')
    }

    const age = calculateAge(userData.user.birthday)

    const completeProfileData = {
      ...profileData,
      age,
    }

    const response = await axios({
      method: isNewProfile ? 'post' : 'patch',
      url: `${API_BASE_URL}/user/${userId}/profile`,
      data: completeProfileData,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error in postUserProfile:', error)
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data)
      throw new Error(
        `Failed to ${
          isNewProfile ? 'create' : 'update'
        } profile: ${JSON.stringify(error.response.data)}`,
      )
    }
    throw error
  }
}

const getUserProfile = async () => {
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  if (!userId || !token) {
    throw new Error('User ID or token is missing')
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 422) {
        return null
      }
      console.error('Error fetching user profile:', error.response?.data)
    }
    throw error
  }
}

const getLanguages = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/languages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const languagesFromBackend = response.data
    const formattedLanguages = languagesFromBackend
      .replace(/{/g, '[')
      .replace(/}/g, ']')
    const languagesArray = JSON.parse(formattedLanguages)
    localStorage.setItem('languages', JSON.stringify(languagesArray))
    return languagesArray
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error fetching languages:', error.response.data)
    }
    throw error
  }
}

export { postUserProfile, getUserProfile, getLanguages }
