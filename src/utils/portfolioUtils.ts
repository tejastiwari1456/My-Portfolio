import { Project, SkillCategory } from '../data/portfolioData';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * Validates the contact form fields.
 */
export function validateContactForm(data: ContactFormData): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = 'Please provide your name.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  }

  const trimmedEmail = data.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail) {
    errors.email = 'Please provide your email address.';
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Please provide a valid email address.';
  }

  const trimmedSubject = data.subject.trim();
  if (!trimmedSubject) {
    errors.subject = 'Please enter a subject.';
  } else if (trimmedSubject.length < 3) {
    errors.subject = 'Subject should be at least 3 characters.';
  }

  const trimmedMessage = data.message.trim();
  if (!trimmedMessage) {
    errors.message = 'Please write your message.';
  } else if (trimmedMessage.length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generates a clean mailto URL with properly URI-encoded subject and body.
 */
export function generateMailtoLink(recipientEmail: string, formData: ContactFormData): string {
  const subject = encodeURIComponent(`[Portfolio Inquiry] ${formData.subject.trim()}`);
  const bodyText = `Hi Tejas,\n\n${formData.message.trim()}\n\n---\nFrom: ${formData.name.trim()}\nEmail: ${formData.email.trim()}`;
  const body = encodeURIComponent(bodyText);

  return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
}

/**
 * Generates a direct Gmail web compose link with prefilled recipient, subject, and body.
 * Opens directly in any browser without requiring an installed desktop email client.
 */
export function generateGmailWebLink(recipientEmail: string, formData: ContactFormData): string {
  const subject = encodeURIComponent(`[Portfolio Inquiry] ${formData.subject.trim()}`);
  const bodyText = `Hi Tejas,\n\n${formData.message.trim()}\n\n---\nFrom: ${formData.name.trim()}\nEmail: ${formData.email.trim()}`;
  const body = encodeURIComponent(bodyText);

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${subject}&body=${body}`;
}

/**
 * Generates a formatted plain-text draft for copying to clipboard.
 */
export function generateFormattedMessage(recipientEmail: string, formData: ContactFormData): string {
  return `To: ${recipientEmail}\nSubject: [Portfolio Inquiry] ${formData.subject.trim()}\nFrom: ${formData.name.trim()} <${formData.email.trim()}>\n\nMessage:\n${formData.message.trim()}`;
}

export interface DirectSubmitResult {
  success: boolean;
  message: string;
}

/**
 * Submits contact form data directly to Web3Forms API to send to recipient's email.
 */
export async function submitDirectMessage(
  recipientEmail: string,
  formData: ContactFormData,
  serviceKey?: string
): Promise<DirectSubmitResult> {
  const effectiveKey =
    serviceKey ||
    (typeof window !== 'undefined'
      ? (window as unknown as { __ENV_WEB3FORMS_KEY?: string }).__ENV_WEB3FORMS_KEY ||
        localStorage.getItem('portfolio_contact_key') ||
        ''
      : '');

  if (!effectiveKey) {
    return {
      success: false,
      message: 'No direct email service key configured yet.',
    };
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: effectiveKey,
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: `[Portfolio Inquiry] ${formData.subject.trim()}`,
        message: formData.message.trim(),
        from_name: `${formData.name.trim()} (via Portfolio Website)`,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return {
        success: true,
        message: `Your message was delivered directly to ${recipientEmail}!`,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Submission could not be completed via web API.',
      };
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error during message delivery.',
    };
  }
}

/**
 * Filters projects based on category or search query.
 */
export function filterProjects(projects: Project[], activeCategory: string, searchQuery: string = ''): Project[] {
  const query = searchQuery.trim().toLowerCase();

  return projects.filter(project => {
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Featured' && project.featured) ||
      project.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
      project.techStack.some(t => t.toLowerCase().includes(activeCategory.toLowerCase()));

    const matchesQuery =
      !query ||
      project.name.toLowerCase().includes(query) ||
      project.shortDescription.toLowerCase().includes(query) ||
      project.techStack.some(t => t.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });
}

/**
 * Filters skills categories based on a search term.
 */
export function filterSkillCategories(categories: SkillCategory[], search: string): SkillCategory[] {
  const query = search.trim().toLowerCase();
  if (!query) return categories;

  return categories
    .map(category => {
      const filteredSkills = category.skills.filter(
        skill =>
          skill.name.toLowerCase().includes(query) ||
          (skill.level && skill.level.toLowerCase().includes(query)) ||
          category.title.toLowerCase().includes(query)
      );

      return {
        ...category,
        skills: filteredSkills
      };
    })
    .filter(cat => cat.skills.length > 0);
}

/**
 * Normalizes a score or CGPA to a display percentage for visual bars.
 */
export function normalizeScorePercentage(scoreStr: string): number {
  if (scoreStr.endsWith('%')) {
    const val = parseFloat(scoreStr.replace('%', ''));
    return isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
  }
  const normalized = scoreStr.includes('/') ? scoreStr.split('/')[0] : scoreStr;
  const num = parseFloat(normalized);
  if (!isNaN(num) && num <= 10) {
    // 10-point CGPA scale
    return Math.min(100, Math.round((num / 10) * 100));
  }
  return 0;
}
