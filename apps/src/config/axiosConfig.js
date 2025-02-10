import axios from "axios";

// Créez une instance Axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Intercepteur pour ajouter le jeton d'authentification à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupérer le token du stockage local ou d'une autre source
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
