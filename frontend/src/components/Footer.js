import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo" aria-label="Footer">
      <style>{`
        /* Footer responsive enhancements */
        @media (max-width: 768px) {
          .footer-socials { flex-wrap: wrap; justify-content: center; gap: 10px; }
        }
        @media (max-width: 576px) {
          .social-link { width: 36px; height: 36px; }
          .footer-copy { font-size: 11px; margin-top: 10px; }
        }
        .social-link:focus { outline: 2px dashed currentColor; outline-offset: 3px; }
      `}</style>
      {/* Hanya ikon sosial: Facebook, Instagram, Twitter, WhatsApp, TikTok */}
      <div className="footer-socials" aria-label="Sosial media">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link" tabIndex={0}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a href="https://www.instagram.com/narpati_leather" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link" tabIndex={0}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-link" tabIndex={0}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-link" tabIndex={0}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 13.5c-.5-.2-1-.3-1.4.1-.4.4-.9 1.1-1.3 1.2-.8.2-2.6-.9-3.7-2-1.1-1.1-2.2-2.9-2-3.7.1-.4.8-.9 1.2-1.3.4-.4.3-.9.1-1.4-.2-.5-1.2-2.3-1.7-2.8-.4-.4-1-.4-1.5-.3-1 .3-1.9 1.5-2.1 2.5-.3 1.5.3 3.5 2.4 5.6 2.1 2.1 4.1 2.7 5.6 2.4 1-.2 2.2-1.1 2.5-2.1.1-.5.1-1.1-.3-1.5-.5-.5-2.3-1.5-2.8-1.7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.697.42 3.297 1.16 4.706L2 22l5.294-1.16A9.962 9.962 0 0 0 12 22z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="social-link" tabIndex={0}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3v4c1.5 1.2 3.3 2 5 2V6c-1.7 0-3.3-.7-5-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 8v7a3 3 0 1 1-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <p className="footer-copy">Copyright © 2025 Narpati Leather. All rights reserved.</p>
    </footer>
  );
};

export default Footer;