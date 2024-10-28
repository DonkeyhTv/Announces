import axios from "axios";
import AuthService from "./login";
import { BASE_URL } from "./api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("expiration");

    if (token && expiration) {
      const currentTime = new Date();
      const expirationTime = new Date(expiration);

      // Vérifier si le token expire dans moins de 5 minutes
      if (expirationTime.getTime() - currentTime.getTime() < 5 * 60 * 1000) {
        try {
          const newToken = await AuthService.refreshToken();
          config.headers["Authorization"] = `Bearer ${newToken}`;
        } catch (error) {
          console.error("Erreur lors du rafraîchissement du token:", error);
          AuthService.logout(); // Déconnexion si le rafraîchissement échoue
          window.location.href = "/login"; // Redirection vers la page de connexion
        }
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
