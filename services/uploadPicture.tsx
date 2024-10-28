import axios from 'axios';

const uploadPicture = {
  uploadImages: async (userId: string, images: string[], token: string) => {
    const url = `http://localhost:3333/api/user/${userId}/gallery`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const data = {
      images,
    };

    try {
      const response = await axios.post(url, data, { headers });
      return response;
    } catch (error: any) {
      throw new Error(`Erreur lors de la sauvegarde des images sur le serveur: ${error.message}`);
    }
  },

  getImages: async (userId: string, token: string) => {
    const url = `http://localhost:3333/api/user/${userId}/gallery`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      throw new Error(`Erreur lors de la récupération des images du serveur: ${error.message}`);
    }
  },
};

export default uploadPicture;