import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContactForm,
  generateMailtoLink,
  generateGmailWebLink,
  generateFormattedMessage,
  filterProjects,
  normalizeScorePercentage
} from './portfolioUtils';
import { PORTFOLIO_DATA } from '../data/portfolioData';

test('validateContactForm rejects empty submissions', () => {
  const result = validateContactForm({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.subject);
  assert.ok(result.errors.message);
});

test('validateContactForm validates email format correctly', () => {
  const badEmail = validateContactForm({
    name: 'Sarah Connor',
    email: 'not-an-email',
    subject: 'Internship Role',
    message: 'Hello Tejas, we would like to interview you for an SDE position.'
  });
  assert.equal(badEmail.isValid, false);
  assert.equal(badEmail.errors.email, 'Please provide a valid email address.');

  const goodData = validateContactForm({
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    subject: 'Software Engineering Internship Opportunity',
    message: 'Hello Tejas, we reviewed your SimLab project and want to schedule a call.'
  });
  assert.equal(goodData.isValid, true);
  assert.equal(Object.keys(goodData.errors).length, 0);
});

test('generateMailtoLink creates correctly formatted URL with encoded parameters', () => {
  const link = generateMailtoLink('tejastiwari724@gmail.com', {
    name: 'Alex Rivera',
    email: 'alex@tech.co',
    subject: 'Full Stack Interview',
    message: 'Looking forward to discussing your background!'
  });

  assert.ok(link.startsWith('mailto:tejastiwari724@gmail.com?'));
  assert.ok(link.includes('subject=%5BPortfolio%20Inquiry%5D%20Full%20Stack%20Interview'));
  assert.ok(link.includes('Alex%20Rivera'));
  assert.ok(link.includes('alex%40tech.co'));
});

test('generateGmailWebLink creates valid web compose URL for in-browser emailing', () => {
  const gmailLink = generateGmailWebLink('tejastiwari724@gmail.com', {
    name: 'Sarah Connor',
    email: 'sarah@robotics.ai',
    subject: 'SDE Role',
    message: 'We loved your SimLab project.'
  });

  assert.ok(gmailLink.startsWith('https://mail.google.com/mail/?view=cm&fs=1'));
  assert.ok(gmailLink.includes('to=tejastiwari724%40gmail.com'));
  assert.ok(gmailLink.includes('su=%5BPortfolio%20Inquiry%5D%20SDE%20Role'));
  assert.ok(gmailLink.includes('Sarah%20Connor'));
});

test('generateFormattedMessage produces structured plain-text draft', () => {
  const text = generateFormattedMessage('tejastiwari724@gmail.com', {
    name: 'Alex Rivera',
    email: 'alex@tech.co',
    subject: 'Internship Offer',
    message: 'We are pleased to offer you an internship.'
  });

  assert.ok(text.includes('To: tejastiwari724@gmail.com'));
  assert.ok(text.includes('Subject: [Portfolio Inquiry] Internship Offer'));
  assert.ok(text.includes('From: Alex Rivera <alex@tech.co>'));
  assert.ok(text.includes('We are pleased to offer you an internship.'));
});

test('filterProjects correctly filters by category and search keyword', () => {
  const allProjects = [...PORTFOLIO_DATA.featuredProjects, ...PORTFOLIO_DATA.miniProjects];

  const featuredOnly = filterProjects(allProjects, 'Featured');
  assert.equal(featuredOnly.length, 2);
  assert.ok(featuredOnly.every(p => p.featured));

  const supabaseProjects = filterProjects(allProjects, 'All', 'Supabase');
  assert.equal(supabaseProjects.length, 1);
  assert.equal(supabaseProjects[0].name, 'AI Interview System');

  const geminiProjects = filterProjects(allProjects, 'All', 'Gemini');
  assert.equal(geminiProjects.length, 1);
  assert.equal(geminiProjects[0].name, 'SimLab Competency Hub');

  const emptyMatch = filterProjects(allProjects, 'All', 'NonExistentTechKeyword999');
  assert.equal(emptyMatch.length, 0);
});

test('normalizeScorePercentage calculates valid percentages', () => {
  assert.equal(normalizeScorePercentage('95%'), 95);
  assert.equal(normalizeScorePercentage('93%'), 93);
  assert.equal(normalizeScorePercentage('8.43/10'), 84);
  assert.equal(normalizeScorePercentage('8.43'), 84);
  assert.equal(normalizeScorePercentage('10.0'), 100);
});
