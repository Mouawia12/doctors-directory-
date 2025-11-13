const requiredEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Please define it in your .env (e.g. ${name}=https://api-doctors-directory.souftech.com).`,
    )
  }
  return value
}

const apiBaseUrl = requiredEnv(import.meta.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL').replace(/\/$/, '')
const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
const mapsMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || ''
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export const env = {
  apiBaseUrl,
  mapsKey,
  mapsMapId,
  googleClientId,
}
