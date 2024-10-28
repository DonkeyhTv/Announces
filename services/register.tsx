import { BASE_URL } from './api'

export interface UserData {
  firstname: string
  lastname: string
  birthday: string
  nickname: string
  email: string
  password: string
  tva: string
  address: {
    street: string
    number: string
    city: string
    zip_code: number
  }
  status: string[]
}

export async function registerUser(user: UserData) {
  {
    console.log("Envoi de l'utilisateur:", user)
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })

    const data = await response.json()

    if (!response.ok || (data.errors && data.errors.length > 0)) {
      const errorMessage =
        data.message ||
        (data.errors && data.errors[0].message) ||
        'Registration failed'
      return { error: errorMessage }
    }

    return {
      success: data.message || 'Félicitations, vous pouvez vous connecter',
    }
  } catch (error) {
    console.error('Network or server error:', error)
    return { error: "Une erreur s'est produite" }
  }
}

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await fetch(`/api/check-email?email=${email}`)
  const data = await response.json()
  return data.exists
}
