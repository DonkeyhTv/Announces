// userService.ts

import { User } from '../src/interfaces/user'
import { fetchUsers } from './fetchAllUser'
import { API_BASE_URL } from './api'

export class UserService {
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/all/full`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const result = await response.json()
    return result.users as User[]
  }

  filterEstablishmentUsers(users: User[]): User[] {
    return users.filter(user => user.status.includes('mon statut ici'))
  }
}

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/all/full`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    const userExists = data.users.some(
      (user: { email: string }) => user.email === email,
    )
    return userExists
  } catch (error) {
    console.error('Error checking email existence:', error)
    return false
  }
}
