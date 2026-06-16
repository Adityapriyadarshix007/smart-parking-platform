import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' }
      ]
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/help-center' },
        { name: 'Terms and Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Refund Policy', path: '/refund' }
      ]
    }
  };

  const socialLinks = [
    { icon: 'facebook', name: 'Facebook', url: 'https://facebook.com', bgColor: '#1877f2' },
    { icon: 'twitter', name: 'Twitter', url: 'https://twitter.com', bgColor: '#1da1f2' },
    { icon: 'instagram', name: 'Instagram', url: 'https://instagram.com', bgColor: '#e4405f' },
    { icon: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/in/aditya-priyadarshi', bgColor: '#0077b5' },
    { icon: 'github', name: 'GitHub', url: 'https://github.com', bgColor: '#333333' }
  ];

  const getSocialIcon = (iconName) => {
    const icons = {
      facebook: (<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
      twitter: (<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.683-11.605c0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>),
      instagram: (<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>),
      linkedin: (<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/></svg>),
      github: (<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>)
    };
    return icons[iconName] || <span>{iconName}</span>;
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Grid - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand Section with responsive padding */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-start min-[520px]:pl-3 min-[540px]:pl-4 lg:pl-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl md:text-3xl">🅿️</span>
              <span className="text-xl md:text-2xl font-bold">SmartPark</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              India's leading smart parking platform. Find, book, and manage parking spaces with ease. Save time, reduce stress, and park smarter.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: social.bgColor }}
                  aria-label={social.name}
                >
                  <span className="text-white">{getSocialIcon(social.icon)}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h3 className="font-semibold text-base mb-3 text-gray-300">Company</h3>
            <ul className="space-y-2">
              {footerSections.company.links.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div>
            <h3 className="font-semibold text-base mb-3 text-gray-300">Support</h3>
            <ul className="space-y-2">
              {footerSections.support.links.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="font-semibold text-base mb-3 text-gray-300">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="https://maps.google.com/?q=DLF+Cyber+City+Gurugram+India"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors duration-300 group"
              >
                <span className="text-lg">📍</span>
                <span className="text-sm">DLF Cyber City, Gurugram, India</span>
              </a>
              <a 
                href="tel:+919876543210"
                className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors duration-300 group"
              >
                <span className="text-lg">📞</span>
                <span className="text-sm">+91 98765 43210</span>
              </a>
              <a 
                href="mailto:support@smartpark.com"
                className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors duration-300 group"
              >
                <span className="text-lg">📧</span>
                <span className="text-sm">support@smartpark.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6"></div>

        {/* Copyright Section */}
        <div className="text-center text-gray-500 text-xs">
          <p>&copy; {currentYear} SmartPark. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;