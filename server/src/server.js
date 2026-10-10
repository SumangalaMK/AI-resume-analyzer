import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import mongoose from 'mongoose';
const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set in server/.env');
try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume_analyzer');
  app.listen(port, () => console.log(`API running at http://localhost:${port}`));
} catch (err) { console.error('Startup failed:', err.message); process.exit(1); }
