/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Achievements } from './components/Achievements';
import { Education } from './components/Education';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ResumeModal } from './components/ResumeModal';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-500/20 selection:text-blue-900 relative">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[120] px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all"
      >
        Skip to main content
      </a>

      {/* Scroll Progress Bar at very top of viewport */}
      <ScrollProgressBar />

      {/* Top Navigation */}
      <Navbar onOpenResume={() => setIsResumeModalOpen(true)} />

      {/* Main Content Landmark */}
      <main id="main-content">
        {/* Section 0: Hero Landmark */}
        <Hero onOpenResume={() => setIsResumeModalOpen(true)} />

        {/* Section 1: About Landmark */}
        <About />

        {/* Section 2: Technical Skills Landmark */}
        <Skills />

        {/* Section 3: Featured Projects Landmark */}
        <Projects />

        {/* Section 4: Achievements & Certifications Landmark */}
        <Achievements />

        {/* Section 5: Education Landmark */}
        <Education />

        {/* Section 6: Contact Landmark */}
        <Contact onOpenResume={() => setIsResumeModalOpen(true)} />
      </main>

      {/* Footer Landmark */}
      <Footer />

      {/* Interactive Resume View Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/90 shadow-lg shadow-slate-300/40 rounded-2xl backdrop-blur-md transition-all hover:-translate-y-1 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Scroll back to top"
            title="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
