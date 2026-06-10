import axios from "axios"

const API = axios.create({
  baseURL: "https://studybuddy-backend-production-f984.up.railway.app"
})

export default API