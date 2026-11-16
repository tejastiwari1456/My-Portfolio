import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import {
  validateContactForm,
  generateMailtoLink,
  generateGmailWebLink,
  generateFormattedMessage,
  submitDirectMessage,
  ContactFormData,
  ValidationErrors,
} from '../utils/portfolioUtils';
import {
  Mail,
  Github,
  Linkedin,
  Send,
  Copy,
  Check,
  FileText,
  ArrowUpRight,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Settings,
  Key,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Phone,
  Download,
  Code2,
} from 'lucide-react';
import { APPLE_EASE, Reveal } from './motion/MotionWrappers';

interface ContactProps {
  onOpenResume: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenResume }) => {
  const { personal } = PORTFOLIO_DATA;

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    title: string;
    description: string;
  } | null>(null);

  // Direct email delivery access key (Web3Forms / custom webhook)
  const [accessKey, setAccessKey] = useState<string>('');
  const [tempKeyInput, setTempKeyInput] = useState<string>('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);

  useEffect(() => {
    // Check localStorage or Vite environment variable for a Web3Forms access key
    const envKey = (import.meta as unknown as { env?: { VITE_WEB3FORMS_ACCESS_KEY?: string } }).env?.VITE_WEB3FORMS_ACCESS_KEY || '';
    const storedKey = localStorage.getItem('portfolio_contact_key') || envKey || '';
    setAccessKey(storedKey);
    setTempKeyInput(storedKey);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personal.contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(personal.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleCopyDraft = () => {
    const formatted = generateFormattedMessage(personal.contactEmail, formData);
    navigator.clipboard.writeText(formatted);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSaveAccessKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKeyInput.trim();
    if (cleanKey) {
      localStorage.setItem('portfolio_contact_key', cleanKey);
      setAccessKey(cleanKey);
    } else {
      localStorage.removeItem('portfolio_contact_key');
      setAccessKey('');
    }
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setIsSetupModalOpen(false);
    }, 1200);
  };

  // Primary Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // If a direct delivery access key is configured, submit silently via Web3Forms API
    if (accessKey) {
      setIsSubmitting(true);
      setSubmissionFeedback(null);

      const result = await submitDirectMessage(personal.contactEmail, formData, accessKey);
      setIsSubmitting(false);

      if (result.success) {
        setSubmissionFeedback({
          type: 'success',
          title: 'Message Delivered Directly to Tejas!',
          description: `Your message has been sent directly to ${personal.contactEmail}. Tejas will respond to you at ${formData.email}.`,
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmissionFeedback({
          type: 'error',
          title: 'Direct delivery encountered an issue',
          description: `${result.message} You can also send directly using the Gmail or default email options below.`,
        });
      }
      return;
    }

    // If no direct API key is configured yet, launch Gmail Web compose (instant in-browser compose)
    // and provide feedback with quick options
    handleOpenGmail();
  };

  const handleOpenGmail = () => {
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const gmailUrl = generateGmailWebLink(personal.contactEmail, formData);
    const link = document.createElement('a');
    link.href = gmailUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSubmissionFeedback({
      type: 'info',
      title: 'Gmail Web Compose Opened in New Tab',
      description: `Your message draft to ${personal.contactEmail} is ready in Gmail. Simply click "Send" in your Gmail tab to deliver your email!`,
    });
  };

  const handleOpenMailto = () => {
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const mailtoUrl = generateMailtoLink(personal.contactEmail, formData);
    window.location.href = mailtoUrl;

    setSubmissionFeedback({
      type: 'info',
      title: 'Default Mail App Opened',
      description: `Your message draft to ${personal.contactEmail} has been opened in your system's default email app.`,
    });
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-32 bg-white border-t border-slate-200/80 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-32 w-[500px] h-[400px] bg-blue-100/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[350px] bg-indigo-100/40 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Outreach & Socials */}
          <div className="lg:col-span-5 space-y-8">
            <Reveal>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>06. Get In Touch</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Let&apos;s Work Together
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                I am actively looking for software engineering internship opportunities. Whether you have an open position, want to discuss a project, or simply want to connect, I would love to hear from you.
              </p>
            </Reveal>

            {/* Email & Phone Contact Card */}
            <Reveal delay={0.15} scale={0.94}>
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Direct Inquiries
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-mono-code text-slate-900 font-medium select-all">
                      {personal.contactEmail}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="p-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                      title="Copy email address"
                    >
                      {copiedEmail ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                    </button>

                    <a
                      href={`mailto:${personal.contactEmail}`}
                      className="p-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                      title="Open default email client"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Send</span>
                    </a>
                  </div>
                </div>

                {/* Direct Phone Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <Phone className="w-4 h-4" />
                    </div>
                    <a
                      href={`tel:${personal.phone.replace(/\s+/g, '')}`}
                      className="text-sm font-mono-code text-slate-900 font-medium hover:text-blue-600 transition-colors"
                    >
                      {personal.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                      title="Copy phone number"
                    >
                      {copiedPhone ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Profiles & Resume with Smooth Hover */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2.5">
                  <a
                    href={personal.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <Github className="w-4 h-4 text-slate-900" />
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href={personal.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href={personal.leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <Code2 className="w-4 h-4 text-amber-600" />
                    <span>LeetCode</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href={personal.hackerrankUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <span className="font-bold text-emerald-600">HR</span>
                    <span>HackerRank</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    type="button"
                    onClick={onOpenResume}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all shadow-2xs hover:-translate-y-0.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>View Resume</span>
                  </button>

                  <a
                    href={personal.resumeUrl}
                    download={personal.resumeFileName}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-2xs hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Availability Notice */}
            <Reveal delay={0.25} scale={0.96}>
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-600 leading-relaxed shadow-2xs">
                <span className="font-semibold text-blue-900 block mb-1">
                  Internship Timeline &amp; Availability
                </span>
                Available for immediate joining on remote or on-site engineering roles across software engineering, Java backend, and full-stack development.
              </div>
            </Reveal>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <Reveal delay={0.2} scale={0.94}>
              <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow duration-500">
                {/* Header with Title and Connection Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Send a Direct Message
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Delivers directly to{' '}
                        <span className="font-medium text-slate-700">
                          {personal.contactEmail}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Delivery Configuration Pill / Modal Button */}
                  <button
                    type="button"
                    onClick={() => setIsSetupModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    title="Configure email delivery settings"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        accessKey ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                      }`}
                    />
                    <span>{accessKey ? 'Direct Inbox Connected' : 'Connect Email Options'}</span>
                    <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>
                </div>

                {/* Submission Feedback Banner */}
                <AnimatePresence>
                  {submissionFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className={`mb-6 p-4 rounded-2xl border text-xs space-y-2 relative ${
                        submissionFeedback.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-slate-800'
                          : submissionFeedback.type === 'error'
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-blue-50 border-blue-200 text-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => setSubmissionFeedback(null)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                        title="Dismiss notice"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2 font-semibold text-sm">
                        {submissionFeedback.type === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {submissionFeedback.type === 'info' && (
                          <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        {submissionFeedback.type === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{submissionFeedback.title}</span>
                      </div>
                      <p className="leading-relaxed">{submissionFeedback.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name field */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold text-slate-800 mb-1.5"
                      >
                        Your Name <span className="text-blue-600">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Alex Rivera"
                        className={`w-full px-4 py-2.5 text-xs bg-slate-50 text-slate-900 placeholder-slate-400 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                          errors.name
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                        }`}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p
                          id="name-error"
                          className="mt-1 text-[11px] text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email field */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold text-slate-800 mb-1.5"
                      >
                        Your Email <span className="text-blue-600">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. alex@company.com"
                        className={`w-full px-4 py-2.5 text-xs bg-slate-50 text-slate-900 placeholder-slate-400 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                          errors.email
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                        }`}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? 'email-error' : undefined
                        }
                      />
                      {errors.email && (
                        <p
                          id="email-error"
                          className="mt-1 text-[11px] text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject field */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-semibold text-slate-800 mb-1.5"
                    >
                      Subject <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineering Internship Opportunity"
                      className={`w-full px-4 py-2.5 text-xs bg-slate-50 text-slate-900 placeholder-slate-400 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                        errors.subject
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                      }`}
                      aria-invalid={Boolean(errors.subject)}
                      aria-describedby={
                        errors.subject ? 'subject-error' : undefined
                      }
                    />
                    {errors.subject && (
                      <p
                        id="subject-error"
                        className="mt-1 text-[11px] text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message field */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-slate-800 mb-1.5"
                    >
                      Message <span className="text-blue-600">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me about the project, role, or what you'd like to collaborate on..."
                      className={`w-full px-4 py-2.5 text-xs bg-slate-50 text-slate-900 placeholder-slate-400 border rounded-xl focus:bg-white focus:outline-none transition-all resize-none ${
                        errors.message
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                      }`}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? 'message-error' : undefined
                      }
                    />
                    {errors.message && (
                      <p
                        id="message-error"
                        className="mt-1 text-[11px] text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Primary Submit Button & Info */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-500">
                      {accessKey
                        ? 'Direct inbox delivery enabled. Message will land in tejastiwari724@gmail.com instantly.'
                        : 'Clicking Send connects directly via Gmail Web Compose, with mailto & copy fallback.'}
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-xl transition-all shadow-md shadow-blue-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shrink-0 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending to Inbox...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Alternate Dispatch Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-medium text-slate-400">
                      Quick Sending Channels:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenGmail}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        title="Open in Gmail Web browser compose"
                      >
                        <ExternalLink className="w-3 h-3 text-red-500" />
                        <span>Send via Gmail Web</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenMailto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        title="Open in your default desktop or mobile mail app"
                      >
                        <Mail className="w-3 h-3 text-blue-500" />
                        <span>Default Mail App</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyDraft}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        title="Copy formatted email message to clipboard"
                      >
                        {copiedDraft ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                        <span>{copiedDraft ? 'Copied Draft!' : 'Copy Draft'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Direct Email Setup Modal */}
      <AnimatePresence>
        {isSetupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: APPLE_EASE }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative"
            >
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close setup modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    How To Connect Direct Email Delivery
                  </h4>
                  <p className="text-xs text-slate-500">
                    Deliver messages straight to{' '}
                    <span className="font-mono-code font-semibold text-slate-700">
                      {personal.contactEmail}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 leading-relaxed space-y-2">
                  <p className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    How It Works
                  </p>
                  <p>
                    Currently, clicking <strong>Send Message</strong> opens <strong>Gmail Web Compose</strong> or your default mail app with the recipient, subject, and message prefilled.
                  </p>
                  <p>
                    If you want visitors to click <strong>Send Message</strong> and have the email delivered directly to your inbox <em>silently in the background without opening any email client</em>, you can connect a 100% free Web3Forms access key below.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-slate-900 block">
                    3-Step Setup for Direct Silent Delivery (1 Minute, Free):
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                    <li>
                      Visit{' '}
                      <a
                        href="https://web3forms.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5"
                      >
                        web3forms.com
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      Enter your email address:{' '}
                      <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono-code">
                        {personal.contactEmail}
                      </code>
                    </li>
                    <li>
                      Check your email for your free <strong>Access Key</strong>, and paste it below:
                    </li>
                  </ol>
                </div>

                <form onSubmit={handleSaveAccessKey} className="space-y-3 pt-2">
                  <div>
                    <label
                      htmlFor="web3forms-key"
                      className="block font-semibold text-slate-800 mb-1"
                    >
                      Web3Forms Access Key
                    </label>
                    <input
                      id="web3forms-key"
                      type="text"
                      value={tempKeyInput}
                      onChange={(e) => setTempKeyInput(e.target.value)}
                      placeholder="e.g. 12345678-abcd-1234-efgh-1234567890ab"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Key is stored securely in your browser session.
                    </span>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {keySavedToast ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <span>Save Key</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
