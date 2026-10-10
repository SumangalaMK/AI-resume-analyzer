import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSkills, analyzeResume } from './analyzer.js';
test('extracts known skills case-insensitively', () => {
  assert.deepEqual(extractSkills('Built with REACT and Node.js, stored in MongoDB.'), ['MongoDB', 'Node.js', 'React']);
});
test('calculates coverage and missing skills', () => {
  const r = analyzeResume('I built a React project using JavaScript.', 'Required: React, JavaScript, Node.js and MongoDB.');
  assert.equal(r.score, 50);
  assert.deepEqual(r.matchedSkills, ['JavaScript', 'React']);
  assert.deepEqual(r.missingSkills, ['MongoDB', 'Node.js']);
});
test('returns zero when no job skills are detected', () => {
  assert.equal(analyzeResume('A resume with some content', 'A role with no dictionary skills mentioned.').score, 0);
});
