import axios from 'axios';

const BASE_URL = 'http://192.168.164.123:8000'; // Replace with your PHP backend URL

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 5000,
});

export default api;
