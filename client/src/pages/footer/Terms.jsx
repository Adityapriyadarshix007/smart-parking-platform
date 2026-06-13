import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms and Conditions</h1>
              <p className="text-blue-100">Last updated: June 8, 2024</p>
              <p className="text-blue-100 text-sm mt-2">Please read these terms carefully before using SmartPark platform</p>
            </div>

            <div className="p-6 md:p-8">
              {/* Introduction */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction and Acceptance</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Welcome to SmartPark ("Company", "we", "our", "us"). These Terms and Conditions ("Terms", "Agreement") govern your use of our website, mobile application, and services (collectively, the "Platform"). By accessing or using SmartPark, you agree to be bound by these Terms and our Privacy Policy.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  If you do not agree with any part of these Terms, you must not use our Platform. We reserve the right to modify these Terms at any time without prior notice. Your continued use of the Platform after any changes constitutes your acceptance of the new Terms.
                </p>
              </div>

              {/* Definitions */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Definitions</h2>
                <div className="space-y-3">
                  <div><span className="font-semibold text-gray-700">"User"</span> - Any individual or entity that accesses or uses the Platform.</div>
                  <div><span className="font-semibold text-gray-700">"Parking Owner"</span> - A User who lists parking spaces for rent on the Platform.</div>
                  <div><span className="font-semibold text-gray-700">"Driver"</span> - A User who searches for and books parking spaces through the Platform.</div>
                  <div><span className="font-semibold text-gray-700">"Booking"</span> - A confirmed reservation of a parking space through the Platform.</div>
                  <div><span className="font-semibold text-gray-700">"Services"</span> - All features, functionalities, and offerings provided through the Platform.</div>
                </div>
              </div>

              {/* Account Registration */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Account Registration and Security</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="text-gray-600 leading-relaxed mb-3">
                  You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Maintain the confidentiality of your password and account information</li>
                  <li>Immediately notify us of any unauthorized use of your account</li>
                  <li>Ensure you exit from your account at the end of each session</li>
                  <li>Not share your account credentials with any third party</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  We reserve the right to suspend or terminate accounts that violate these Terms or are inactive for an extended period.
                </p>
              </div>

              {/* Booking and Payment Terms */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Booking and Payment Terms</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">4.1 Booking Process</h3>
                    <p className="text-gray-600">Users can search for available parking spaces based on location, date, time, and vehicle type. Once a suitable space is found, users can confirm the booking by completing the payment process. Bookings are confirmed only after successful payment processing.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">4.2 Payment Processing</h3>
                    <p className="text-gray-600">All payments are processed through secure third-party payment gateways. We accept credit/debit cards, UPI, NetBanking, and digital wallets. By making a booking, you authorize us to charge the total amount to your selected payment method.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">4.3 Pricing</h3>
                    <p className="text-gray-600">Parking owners set their own pricing. Prices displayed include all applicable taxes unless otherwise stated. We reserve the right to modify pricing at any time, but such changes will not affect confirmed bookings.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">4.4 Confirmation</h3>
                    <p className="text-gray-600">Upon successful payment, you will receive a booking confirmation via email and SMS. The confirmation includes booking details, parking location, and entry instructions.</p>
                  </div>
                </div>
              </div>

              {/* Cancellation and Refund Policy */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Cancellation and Refund Policy</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">5.1 User Cancellation</h3>
                    <p className="text-gray-600">Users may cancel bookings up to 2 hours before the scheduled start time for a full refund. Cancellations made within 2 hours of the start time will incur a 50% cancellation fee. No-shows are non-refundable.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">5.2 Parking Owner Cancellation</h3>
                    <p className="text-gray-600">If a parking owner cancels a confirmed booking, the user will receive a full refund plus a 20% credit toward future bookings. Repeated cancellations by owners may result in account suspension.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">5.3 Refund Processing</h3>
                    <p className="text-gray-600">Refunds are processed within 5-7 business days. The time for the refund to appear in your account depends on your financial institution. All refunds will be issued to the original payment method.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">5.4 Force Majeure</h3>
                    <p className="text-gray-600">In cases of natural disasters, government orders, or other force majeure events, we will issue full refunds for affected bookings.</p>
                  </div>
                </div>
              </div>

              {/* User Obligations and Conduct */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">6. User Obligations and Conduct</h2>
                <p className="text-gray-600 leading-relaxed mb-3">You agree to use the Platform responsibly and agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                  <li>Impersonate any person or entity or provide false information</li>
                  <li>Interfere with or disrupt the Platform's operation or servers</li>
                  <li>Attempt to gain unauthorized access to any portion of the Platform</li>
                  <li>Use any automated system to access the Platform (bots, scrapers, etc.)</li>
                  <li>Harass, abuse, or harm another person, including parking owners or drivers</li>
                  <li>Post or transmit any malicious code, viruses, or harmful content</li>
                  <li>Violate any parking owner's property rules or guidelines</li>
                </ul>
              </div>

              {/* Parking Owner Terms */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Parking Owner Terms</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">7.1 Listing Requirements</h3>
                    <p className="text-gray-600">Parking owners must provide accurate information about their parking spaces, including location, availability, pricing, and any restrictions. Owners must maintain their listings and update availability in real-time.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">7.2 Verification</h3>
                    <p className="text-gray-600">All parking owners and listings are subject to verification by SmartPark. We reserve the right to reject or remove any listing that does not meet our standards.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">7.3 Commission and Fees</h3>
                    <p className="text-gray-600">SmartPark charges a service fee of 15% on each booking. This fee covers platform maintenance, customer support, payment processing, and marketing. Fees are automatically deducted from payouts.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">7.4 Payouts</h3>
                    <p className="text-gray-600">Parking owners receive payouts within 3-5 business days after booking completion. Payouts are sent to the registered bank account or payment method.</p>
                  </div>
                </div>
              </div>

              {/* Intellectual Property */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  The Platform and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by SmartPark, its licensors, or other providers and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Platform without our prior written consent.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  To the fullest extent permitted by law, SmartPark and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Your use or inability to use the Platform</li>
                  <li>Any conduct or content of any third party on the Platform</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                  <li>Any bugs, viruses, or other harmful code transmitted through the Platform</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  Our total liability to you for any claims arising from these Terms shall not exceed the amount you paid to us in the 12 months preceding the claim.
                </p>
              </div>

              {/* Disclaimer of Warranties */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Disclaimer of Warranties</h2>
                <p className="text-gray-600 leading-relaxed">
                  THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. SMART PARK MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, REGARDING THE OPERATION OR AVAILABILITY OF THE PLATFORM, OR THE INFORMATION, CONTENT, AND MATERIALS INCLUDED ON THE PLATFORM. YOU EXPRESSLY AGREE THAT YOUR USE OF THE PLATFORM IS AT YOUR SOLE RISK.
                </p>
              </div>

              {/* Indemnification */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Indemnification</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to defend, indemnify, and hold harmless SmartPark, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Platform.
                </p>
              </div>

              {/* Termination */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Termination</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation a breach of these Terms.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Upon termination, your right to use the Platform will immediately cease. If you wish to terminate your account, you may simply discontinue using the Platform or contact us to request account deletion.
                </p>
              </div>

              {/* Governing Law */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">13. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal suit, action, or proceeding arising out of, or related to, these Terms or the Platform shall be instituted exclusively in the courts of Gurugram, Haryana, India.
                </p>
              </div>

              {/* Dispute Resolution */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">14. Dispute Resolution</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Any dispute arising from or relating to these Terms or the Platform shall first be attempted to be resolved through good-faith negotiations between the parties. If the dispute cannot be resolved within 30 days, the parties agree to submit to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  The arbitration shall be conducted in Gurugram, India, in the English language. The arbitrator's award shall be final and binding, and judgment may be entered upon it in any court having jurisdiction.
                </p>
              </div>

              {/* Miscellaneous */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">15. Miscellaneous Provisions</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">15.1 Entire Agreement</h3>
                    <p className="text-gray-600">These Terms constitute the entire agreement between you and SmartPark regarding the use of the Platform.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">15.2 Severability</h3>
                    <p className="text-gray-600">If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">15.3 Waiver</h3>
                    <p className="text-gray-600">Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">15.4 Assignment</h3>
                    <p className="text-gray-600">You may not assign these Terms without our prior written consent. We may assign these Terms without restriction.</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">16. Contact Us</h2>
                <p className="text-gray-600 mb-3">If you have any questions about these Terms and Conditions, please contact us at:</p>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-semibold">Email:</span> <a href="mailto:legal@smartpark.com" className="text-blue-600 hover:underline">legal@smartpark.com</a></p>
                  <p><span className="font-semibold">Phone:</span> <a href="tel:+919876543210" className="text-blue-600 hover:underline">+91 98765 43210</a></p>
                  <p><span className="font-semibold">Address:</span> SmartPark, DLF Cyber City, Gurugram, Haryana, India - 122002</p>
                </div>
              </div>

              {/* Acknowledgment */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>By using SmartPark, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
