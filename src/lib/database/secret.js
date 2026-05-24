
export const BASE_URL = 'https://razers-demo.vercel.app';

export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_API = process.env.CLOUDINARY_API;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;


export const PG_USER=process.env.PG_USER
export const PG_PASSWORD=process.env.PG_PASSWORD
export const PG_HOST=process.env.PG_HOST
export const PG_PORT=process.env.PG_PORT
export const PG_DATABASE=process.env.PG_DB || process.env.PG_DATABASE


export const JWT_SECRET = process.env.JWT_SECRET;


export const NODE_ENV = process.env.NODE_ENV || "production"


export const BREVO_SENDER_EMAIL=process.env.BREVO_SENDER_EMAIL
export const BREVO_SENDER_NAME=process.env.BREVO_SENDER_NAME
export const BREVO_API_KEY=process.env.BREVO_API_KEY