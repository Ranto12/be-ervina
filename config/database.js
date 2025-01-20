import dotenv from 'dotenv';
dotenv.config();

const config = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'revisi_ervina',
  host: process.env.DB_HOST || '127.0.0.1',
  dialect: 'mysql',
};

export default config;
