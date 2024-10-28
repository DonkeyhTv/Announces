// src/services/viewAnnounce.ts

export const viewAnnounce = async (announceId: number) => {
  try {
    const response = await fetch(
      `http://localhost:3333/api/announce/${announceId}/view`,
      {
        method: 'GET',
      },
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
