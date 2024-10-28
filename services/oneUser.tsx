import { API_BASE_URL } from './api'

export const fetchUserStatus = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()

  return data
}

export const getUser = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }

  return response.json()
}

export const updateUser = async (
  userId: string,
  token: string,
  userData: any,
) => {
  console.log('Sending data:', userData)

  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  })

  console.log('response', response)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to update user: ${errorData.message}`)
  }

  return response.json()
}
