import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import Analysis from '../models/Analysis.js';
import { analyzeResume } from '../services/analyzer.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => {
  const valid = file.mimetype === 'application/pdf' && file.originalname.toLowerCase().endsWith('.pdf');
  cb(valid ? null : new Error('Upload a PDF file only.'), valid);
} });
router.use(auth);
router.post('/', upload.single('resume'), [body('jobDescription').trim().isLength({ min: 30, max: 20000 }).withMessage('Job description must be 30–20,000 characters.'), body('roleTitle').optional().trim().isLength({ max: 120 }).withMessage('Role title is too long.')], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    if (!req.file) return res.status(400).json({ message: 'Please choose a PDF resume.' });
    const parsed = await pdfParse(req.file.buffer);
    const resumeText = (parsed.text || '').trim();
    if (resumeText.length < 40) return res.status(400).json({ message: 'Could not extract enough text. Use a text-based PDF rather than a scanned image.' });
    const result = analyzeResume(resumeText, req.body.jobDescription);
    const analysis = await Analysis.create({ user: req.user.id, fileName: req.file.originalname.slice(0, 180), roleTitle: req.body.roleTitle || 'Target role', ...result });
    res.status(201).json({ analysis });
  } catch (e) { if (e.message === 'Upload a PDF file only.') return res.status(400).json({ message: e.message }); next(e); }
});
router.get('/', async (req, res, next) => {
  try { const items = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50).select('-__v'); res.json({ analyses: items }); }
  catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const item = await Analysis.findOne({ _id: req.params.id, user: req.user.id }).select('-__v'); if (!item) return res.status(404).json({ message: 'Analysis not found.' }); res.json({ analysis: item }); }
  catch (e) { if (e.name === 'CastError') return res.status(404).json({ message: 'Analysis not found.' }); next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const item = await Analysis.findOneAndDelete({ _id: req.params.id, user: req.user.id }); if (!item) return res.status(404).json({ message: 'Analysis not found.' }); res.json({ message: 'Analysis deleted.' }); }
  catch (e) { next(e); }
});
export default router;
