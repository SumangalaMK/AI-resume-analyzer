import mongoose from 'mongoose';
const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName: { type: String, required: true },
  roleTitle: { type: String, default: 'Target role' },
  score: { type: Number, required: true, min: 0, max: 100 },
  matchedSkills: [String],
  missingSkills: [String],
  resumeSkills: [String],
  jobSkills: [String],
  suggestions: [String],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
export default mongoose.model('Analysis', analysisSchema);
