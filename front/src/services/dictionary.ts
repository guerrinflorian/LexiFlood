import axios from 'axios';

// On utilise la variable d'environnement définie dans Vercel
// Si elle n'existe pas (en local), on utilise localhost:3000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL
});

export const checkWord = async (word: string) => {
  const response = await api.post('/check-word', { word });
  return Boolean(response.data?.valid);
};