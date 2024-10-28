import { User } from "../src/interfaces/user";
import { API_BASE_URL } from "./api";

const fetchUsers = async (): Promise<User[]> => {
  const FULL_API_URL = `${API_BASE_URL}/all/full`;

  try {
    const response = await fetch(FULL_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const data = await response.json();
    const sortedUsers = data.users.sort(
      (a: User, b: User) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export { fetchUsers };
