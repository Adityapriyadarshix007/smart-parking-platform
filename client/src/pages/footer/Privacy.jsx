import React from 'react';
import { motion } from 'framer-motion';

const Privacy = () => {
  const sections = [
    { title: 'Information We Collect', content: 'We collect information you provide directly to us, including your name, email address, phone number, payment information, and vehicle details when you create an account or make a booking.' },
    { title: 'How We Use Your Information', content: 'We use your information to process bookings, communicate with you, improve our services, ensure platform security, and comply with legal obligations.' },
    { title: 'Information Sharing', content: 'We do not sell your personal information. We may share information with parking providers to fulfill bookings, with service providers who assist our operations, and when required by law.' },
    { title: 'Data Security', content: 'We implement industry-standard security measures including 256-bit encryption, secure servers, regular security audits, and PCI-DSS compliant payment processing.' },
    { title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal information. You may also request data portability or restrict processing. Contact us to exercise these rights.' },
    { title: 'Cookies and Tracking', content: 'We use cookies to enhance your experience, analyze usage, and personalize content. You can control cookie settings in your browser.' },
    { title: 'Data Retention', content: 'We retain your information as long as your account is active or as needed to provide services. You may request deletion at any time.' },
    { title: 'Children\'s Privacy', content: 'Our services are not intended for children under 18. We do not knowingly collect information from children.' }
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mb-6">Last updated: June 1, 2024</p>
            <div className="space-y-6">
              {sections.map((section, idx) => (
                <section key={idx}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </section>
              ))}
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">For privacy concerns, email privacy@smartpark.com</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
