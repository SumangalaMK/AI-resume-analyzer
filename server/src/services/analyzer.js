// Transparent baseline analyzer: dictionary-based skill extraction + weighted coverage.
// This is not a trained ML model; it can be extended with an LLM/embedding provider.
const SKILLS = [
  'JavaScript','TypeScript','React','Node.js','Express','MongoDB','Mongoose','SQL','MySQL','PostgreSQL',
  'Java','Python','C++','C#','Spring Boot','REST API','GraphQL','HTML','CSS','Tailwind CSS',
  'Git','GitHub','Docker','Kubernetes','AWS','Azure','GCP','CI/CD','Jenkins','Linux',
  'Machine Learning','Deep Learning','Natural Language Processing','NLP','TensorFlow','PyTorch',
  'Pandas','NumPy','Data Analysis','Power BI','Tableau','Excel','Figma','Agile','Scrum',
  'JWT','OAuth','Redis','Microservices','Unit Testing','Jest','Vitest','Selenium','Communication','Leadership'
];
const aliases = new Map([
  ['nodejs','Node.js'], ['node.js','Node.js'], ['react.js','React'],
  ['restful api','REST API'], ['natural language processing','Natural Language Processing'],
  ['ci cd','CI/CD'], ['amazon web services','AWS'], ['postgres','PostgreSQL']
]);
function normalize(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); }
export function extractSkills(text) {
  const source = normalize(text);
  const found = new Set();
  for (const skill of SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const pattern = new RegExp(`(^|[^a-z0-9+#])${escaped}($|[^a-z0-9+#])`, 'i');
    if (pattern.test(source)) found.add(skill);
  }
  for (const [alias, canonical] of aliases) if (new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`, 'i').test(source)) found.add(canonical);
  return [...found].sort((a,b) => a.localeCompare(b));
}
export function analyzeResume(resumeText, jobText) {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobText);
  const resumeSet = new Set(resumeSkills.map(normalize));
  const matchedSkills = jobSkills.filter(s => resumeSet.has(normalize(s)));
  const missingSkills = jobSkills.filter(s => !resumeSet.has(normalize(s)));
  const score = jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0;
  const suggestions = [];
  if (!jobSkills.length) suggestions.push('Add specific technical skills to the job description so the analyzer can compare requirements.');
  if (missingSkills.length) suggestions.push(`If you genuinely have these skills, add evidence for: ${missingSkills.slice(0, 6).join(', ')}.`);
  if (!/\b(project|built|developed|created|implemented)\b/i.test(resumeText)) suggestions.push('Add a projects section describing what you built, the tools used, and measurable outcomes.');
  if (!/\b(education|bachelor|degree|university|college)\b/i.test(resumeText)) suggestions.push('Make your education or qualifications easy to find.');
  if (!/\b(\d+%|\d+ users|\d+ projects|reduced|increased|improved)\b/i.test(resumeText)) suggestions.push('Where accurate, quantify impact with metrics (for example, load time reduced by 20%).');
  if (!suggestions.length) suggestions.push('Tailor the summary and project bullets to the role, and verify every claim is accurate.');
  return { score, matchedSkills, missingSkills, resumeSkills, jobSkills, suggestions };
}
