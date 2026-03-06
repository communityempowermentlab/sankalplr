import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://sankalplrapi.celworld.org/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
