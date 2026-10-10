import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = Router();
const validate = (req, res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg }); next(); };
const tokenFor = user => jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
router.post('/register', [body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters.'), body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'), body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8–72 characters.')], validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});
router.post('/login', [body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'), body('password').notEmpty().withMessage('Password is required.')], validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});
export default router;
