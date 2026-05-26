import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // ← ajuste se necessário
  timeout: 10000,
})

export default defineBoot(({ app, router }) => {
  // Injeta o token JWT em todas as requisições automaticamente
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('horus_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  // Se o servidor retornar 401, desloga e redireciona para o login
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('horus_token')
        localStorage.removeItem('horus_user')
        router.push('/login')
      }
      return Promise.reject(error)
    },
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
