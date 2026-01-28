import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

export const checkWord = async (word: string) => {
  const response = await api.post('/check-word', { word });
  return Boolean(response.data?.valid);
};
