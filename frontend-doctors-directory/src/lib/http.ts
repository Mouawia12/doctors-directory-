import axios from 'axios'
import i18n from '@/app/i18n'
import { env } from '@/lib/env'

const AUTH_TOKEN_KEY = 'dd_auth_token'

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

const setLocaleHeader = (lng: string) => {
  api.defaults.headers.common['X-Locale'] = lng
  api.defaults.headers.common['Accept-Language'] = lng
}

setLocaleHeader(i18n.language)
i18n.on('languageChanged', setLocaleHeader)

const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export const persistAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
  setAuthHeader(token)
}

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
  }
  setAuthHeader(null)
}

if (typeof window !== 'undefined') {
  const existingToken = window.localStorage.getItem(AUTH_TOKEN_KEY)
  if (existingToken) {
    setAuthHeader(existingToken)
  }
}
