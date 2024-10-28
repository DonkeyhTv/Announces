// src/services/authService.ts
import axios from "axios";
import { BASE_URL } from "./api";

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface UserData {
  token: string | { value: string; expiration: string; isadmin: string };
  refresh_token: string;
  id: string;
  nickname: string;
  email: string;
  birthday: string;
  address: {
    city: string;
    zip_code: string;
  };
}

interface LoginResponse {
  success?: string;
  error?: string;
  user?: UserData;
}

interface UserInfo {
  nickname: string | null;
  email: string | null;
  birthday: string | null;
  address: {
    city: string | null;
    zipCode: string | null;
  };
}

const AuthService = {
  login: async ({
    email,
    password,
    rememberMe,
  }: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data: UserData = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return { error: "Ce compte n'existe pas." };
        } else if (response.status === 400) {
          return {
            error: "Requête invalide. Vérifiez vos informations.",
          };
        }
        return {
          error: "Une erreur est survenue lors de la connexion",
        };
      }

      AuthService.setUserData(data);

      return {
        success: `Bienvenue ${data.nickname}! Redirection en cours ...`,
        user: data,
      };
    } catch (err) {
      console.error(err);
      return { error: "Une erreur est survenue lors de la connexion" };
    }
  },

  setUserData: (data: UserData): void => {
    if (typeof data.token === "object" && data.token.value) {
      localStorage.setItem("token", data.token.value);
      localStorage.setItem("expiration", data.token.expiration);
      localStorage.setItem("isAdmin", data.token.isadmin);
    } else if (typeof data.token === "string") {
      localStorage.setItem("token", data.token);
    }
    localStorage.setItem("refreshToken", data.refresh_token);
    localStorage.setItem("userId", data.id);
    localStorage.setItem("nickname", data.nickname);
    localStorage.setItem("email", data.email);
    localStorage.setItem("birthday", data.birthday);
    localStorage.setItem("city", data.address.city);
    localStorage.setItem("zip_code", data.address.zip_code);
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
    localStorage.removeItem("birthday");
    localStorage.removeItem("city");
    localStorage.removeItem("zip_code");
  },

  getToken: (): string | null => localStorage.getItem("token"),

  getRefreshToken: (): string | null => localStorage.getItem("refreshToken"),

  isAuthenticated: (): boolean => {
    const token = AuthService.getToken();
    const expiration = localStorage.getItem("expiration");
    if (!token || !expiration) return false;
    return new Date(expiration) > new Date();
  },

  getUserInfo: (): UserInfo => ({
    nickname: localStorage.getItem("nickname"),
    email: localStorage.getItem("email"),
    birthday: localStorage.getItem("birthday"),
    address: {
      city: localStorage.getItem("city"),
      zipCode: localStorage.getItem("zip_code"),
    },
  }),

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("Aucun refresh token disponible");
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data;

      localStorage.setItem("token", access_token.value);
      localStorage.setItem("expiration", access_token.expiration);
      localStorage.setItem("refreshToken", refresh_token);

      return access_token.value;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      AuthService.logout();
      throw error;
    }
  },

  updateUserInfo: async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      throw new Error("User ID or token not found");
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { refreshToken, refreshTokenExpiresAt } = response.data.user;

      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("expiration", refreshTokenExpiresAt);

      return response.data.user;
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  },
};

export default AuthService;
