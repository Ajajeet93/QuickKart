import axios from 'axios';
import API_URL_CONFIG from './config'; // Use the config file we fixed earlier

const api = axios.create({
    baseURL: API_URL_CONFIG,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
