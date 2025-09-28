// import { Button, Input, message } from "antd";
// import {
//   CiFacebook,
//   CiLinkedin,
//   CiTwitter,
//   CiLocationOn,
// } from "react-icons/ci";
// import { FaPhoneAlt } from "react-icons/fa";
// import { MdEmail } from "react-icons/md";
// import { useState } from "react";
// import "./css/Footer.css"; // Create this CSS file for custom styles

// const Footer = ({ mt }) => {
//   const [emailMessage, setEmailMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSendEmail = () => {
//     if (!emailMessage.trim()) {
//       message.warning("Please enter a message before sending.");
//       return;
//     }

//     setLoading(true);
    
//     // Simulate email sending
//     setTimeout(() => {
//       const subject = "Inquiry from MentorIQ Website";
//       const body = encodeURIComponent(emailMessage);
//       window.location.href = `mailto:support@mentoriq.com?subject=${subject}&body=${body}`;
      
//       setEmailMessage("");
//       setLoading(false);
//       message.success("Email client opened. Please send your message.");
//     }, 1000);
//   };

//   const scrollToSection = (sectionId) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="custom-footer" style={{ marginTop: mt || "0" }}>
//       <div className="footer-content">
//         <div className="container">
//           <div className="row">
//             {/* Company Info */}
//             <div className="col-lg-3 col-md-6 col-sm-12 footer-section">
//               <div className="company-info">
//                 <h3 className="footer-brand">MentorIQ</h3>
//                 <p className="footer-description">
//                   Empowering education through innovative learning management solutions.
//                 </p>
//                 <div className="social-section">
//                   <p className="social-title">Follow Us</p>
//                   <div className="social-links">
//                     <a 
//                       href="https://facebook.com" 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="social-link"
//                     >
//                       <CiFacebook />
//                     </a>
//                     <a 
//                       href="https://linkedin.com" 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="social-link"
//                     >
//                       <CiLinkedin />
//                     </a>
//                     <a 
//                       href="https://twitter.com" 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="social-link"
//                     >
//                       <CiTwitter />
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Links */}
//             <div className="col-lg-3 col-md-6 col-sm-12 footer-section">
//               <div className="quick-links">
//                 <h4 className="footer-heading">Quick Links</h4>
//                 <ul className="footer-links">
//                   <li>
//                     <a 
//                       href="#home" 
//                       onClick={(e) => {
//                         e.preventDefault();
//                         scrollToSection('home');
//                       }}
//                     >
//                       Home
//                     </a>
//                   </li>
//                   <li>
//                     <a 
//                       href="#courses" 
//                       onClick={(e) => {
//                         e.preventDefault();
//                         scrollToSection('courses');
//                       }}
//                     >
//                       Courses
//                     </a>
//                   </li>
//                   <li>
//                     <a 
//                       href="#services" 
//                       onClick={(e) => {
//                         e.preventDefault();
//                         scrollToSection('services');
//                       }}
//                     >
//                       Services
//                     </a>
//                   </li>
//                   <li>
//                     <a 
//                       href="#contact" 
//                       onClick={(e) => {
//                         e.preventDefault();
//                         scrollToSection('contact');
//                       }}
//                     >
//                       Contact
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             {/* Contact Info */}
//             <div className="col-lg-3 col-md-6 col-sm-12 footer-section">
//               <div className="contact-info">
//                 <h4 className="footer-heading">Contact Info</h4>
//                 <ul className="contact-list">
//                   <li className="contact-item">
//                     <span className="contact-icon-1">
//                       <FaPhoneAlt />
//                     </span>
//                     <div className="contact-details">
//                       <span className="contact-label">Phone</span>
//                       <span className="contact-value">+251 900 009 999</span>
//                     </div>
//                   </li>
//                   <li className="contact-item">
//                     <span className="contact-icon-1">
//                       <MdEmail />
//                     </span>
//                     <div className="contact-details">
//                       <span className="contact-label">Email</span>
//                       <span className="contact-value">support@mentoriq.com</span>
//                     </div>
//                   </li>
//                   <li className="contact-item">
//                     <span className="contact-icon-1">
//                       <CiLocationOn />
//                     </span>
//                     <div className="contact-details">
//                       <span className="contact-label">Address</span>
//                       <span className="contact-value">Around Urael, Addis Ababa, Ethiopia</span>
//                     </div>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             {/* Newsletter/Contact Form */}
//             <div className="col-lg-3 col-md-6 col-sm-12 footer-section">
//               <div className="newsletter">
//                 <h4 className="footer-heading">Quick Message</h4>
//                 <p className="newsletter-description">
//                   Send us a quick message and we'll get back to you.
//                 </p>
//                 <Input.TextArea
//                   placeholder="Type your message here..."
//                   value={emailMessage}
//                   onChange={(e) => setEmailMessage(e.target.value)}
//                   style={{ 
//                     resize: "none", 
//                     height: "100px",
//                     marginBottom: "12px",
//                     borderRadius: "8px"
//                   }}
//                   maxLength={500}
//                   showCount
//                 />
//                 <Button 
//                   type="primary" 
//                   onClick={handleSendEmail}
//                   loading={loading}
//                   className="send-button"
//                 >
//                   Send Message
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Copyright */}
//       <div className="copyright-section">
//         <div className="container">
//           <div className="copyright-content">
//             <p className="copyright-text">
//               &copy; {currentYear} MentorIQ. All rights reserved.
//             </p>
//             <div className="footer-links-bottom">
//               <a href="/privacy">Privacy Policy</a>
//               <a href="/terms">Terms of Service</a>
//               <a href="/help">Help Center</a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
