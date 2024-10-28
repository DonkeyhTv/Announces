export const fetchUserRole = async (userId: string, token: string) => {
  try {
    const response = await fetch(
      `http://localhost:3333/api/user/roles/${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching role:', error)
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('refreshToken')
    throw error
  }
}
