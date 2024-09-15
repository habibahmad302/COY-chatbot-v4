// const env = import.meta.env.MODE
export const config = {
  API_KEY: process.env.Mode === 'development' ? '' : import.meta.env.VITE_APP_BOT_API_KEY,
};
