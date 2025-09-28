import { Button, Input, Card, Row, Col, Tag } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import lms from "../../assets/undraw_online_learning_re_qw08.svg";
import { FaHandPointUp } from "react-icons/fa";
import { GrGrow } from "react-icons/gr";
import { IoGlobe } from "react-icons/io5";
import { IoIosSpeedometer } from "react-icons/io";
import teacher from "../../assets/undraw_teacher_re_sico.svg";
import student from "../../assets/undraw_online_reading_np7n.svg";
import admin from "../../assets/undraw_dashboard_re_3b76.svg";
import logo from "../../assets/school-solid.svg";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./css/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  
  useEffect(() => {
    if (user) {
      navigate("/me/home");
    }
  }, [user, navigate]);

  const handleSearch = (value) => {
    if (value.trim()) {
      console.log("Searching for:", value);
      // Implement search functionality
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmailUs = () => {
    window.location.href = "mailto:support@mentoriq.com?subject=Inquiry%20about%20MentorIQ&body=Hello%20MentorIQ%20team,";
  };

  // Engineering courses data
  const engineeringCourses = [
    {
      id: 1,
      title: "Java Programming",
      code: "CS101",
      duration: "12 weeks",
      level: "Beginner",
      instructor: "Dr. Sarah Johnson",
      category: "Computer Science"
    },
    {
      id: 2,
      title: "Python for Engineers",
      code: "CS201",
      duration: "14 weeks",
      level: "Intermediate",
      instructor: "Prof. Michael Chen",
      category: "Mechanical Engineering"
    },
    {
      id: 3,
      title: "React for Web Development",
      code: "CS301",
      duration: "16 weeks",
      level: "Intermediate",
      instructor: "Dr. Emily Rodriguez",
      category: "Electrical Engineering"
    },
    {
      id: 4,
      title: "C Programming Basics",
      code: "CS401",
      duration: "10 weeks",
      level: "Beginner",
      instructor: "Prof. James Wilson",
      category: "Civil Engineering"
    },
    {
      id: 5,
      title: "PHP & MySQL for Web Apps",
      code: "CS501",
      duration: "15 weeks",
      level: "Advanced",
      instructor: "Dr. Lisa Thompson",
      category: "Chemical Engineering"
    },
    {
      id: 6,
      title: "Data Structures & Algorithms",
      code: "CS202",
      duration: "14 weeks",
      level: "Intermediate",
      instructor: "Prof. David Kim",
      category: "Computer Science"
    },
    {
      id: 7,
      title: "VUE JS Fundamentals",
      code: "CE302",
      duration: "12 weeks",
      level: "Intermediate",
      instructor: "Dr. Robert Brown",
      category: "Mechanical Engineering"
    },
    {
      id: 8,
      title: "Node.js & Express",
      code: "CE402",
      duration: "16 weeks",
      level: "Advanced",
      instructor: "Prof. Maria Garcia",
      category: "Electrical Engineering"
    },
    {
      id: 9,
      title: "Networking Essentials",
      code: "CE502",
      duration: "18 weeks",
      level: "Advanced",
      instructor: "Dr. Andrew Taylor",
      category: "Civil Engineering"
    },
    {
      id: 10,
      title: "Database Management Systems",
      code: "CE602",
      duration: "14 weeks",
      level: "Advanced",
      instructor: "Prof. Jennifer Lee",
      category: "Chemical Engineering"
    }
  ];

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'green';
      case 'intermediate': return 'orange';
      case 'advanced': return 'red';
      default: return 'blue';
    }
  };

  return !user ? (
    <div className="landing-page">
      {/* NAVIGATION */}
      <nav className="navbar navbar-expand-lg navbar-light custom-navbar">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img
              src={logo}
              alt="MentorIQ logo"
              className="brand-logo"
            />
            <span className="brand-name">MentorIQ</span>
          </a>
          
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#home" onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('home');
                }}>Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#courses" onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('courses');
                }}>Courses</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services" onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('services');
                }}>Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact" onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}>Contact</a>
              </li>
            </ul>
            
            <Link to="/account/login" className="login-btn-link">
              <Button
                type="primary"
                icon={<UserOutlined />}
                className="login-btn"
                size="large"
              >
                Login / Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  The Best Learning Platform For Enhancing Skills
                </h1>
                <p className="hero-subtitle">
                  Learn, Grow, Achieve – Together.
                </p>
                <p className="hero-description">
                  Join thousands of students and educators in our comprehensive 
                  learning management system designed for modern education.
                </p>
                <div className="hero-actions">
                  <Link to="/account/login">
                    <Button type="primary" size="large" className="cta-button">
                      Get Started Now
                    </Button>
                  </Link>
                  <Button 
                    size="large" 
                    className="secondary-button"
                    onClick={() => scrollToSection('courses')}
                  >
                    Browse Courses
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 hero-image">
              <img
                src={lms}
                alt="Online Learning"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Why Choose MentorIQ?</h2>
              <p className="section-subtitle">Experience the difference with our platform</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaHandPointUp />
                </div>
                <h5>User-Friendly</h5>
                <p>Intuitive interface designed for seamless navigation</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <GrGrow />
                </div>
                <h5>Scalable</h5>
                <p>Grows with your institution's needs</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <IoGlobe />
                </div>
                <h5>Accessible</h5>
                <p>Learn from anywhere, on any device</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <IoIosSpeedometer />
                </div>
                <h5>High Performance</h5>
                <p>Fast loading times and reliable performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES SECTION */}
      <section id="courses" className="courses-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Engineering Courses</h2>
              <p className="section-subtitle">Explore our comprehensive engineering curriculum</p>
            </div>
          </div>
          <Row gutter={[24, 24]}>
            {engineeringCourses.map((course) => (
              <Col xs={24} sm={12} lg={8} key={course.id}>
                <Card
                  className="course-card"
                  hoverable
                  actions={[
                    <Button type="link" onClick={() => navigate('/account/login')}>
                      Enroll Now
                    </Button>,
                    <Button type="link" onClick={() => navigate('/account/login')}>
                      View Details
                    </Button>
                  ]}
                >
                  <div className="course-header">
                    <Tag color={getLevelColor(course.level)} className="course-level-tag">
                      {course.level}
                    </Tag>
                    <span className="course-duration">{course.duration}</span>
                  </div>
                  <h4 className="course-title">{course.title}</h4>
                  <p className="course-code">{course.code}</p>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-5">
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/account/login')}
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Designed for Everyone</h2>
              <p className="section-subtitle">Tailored experiences for different users</p>
            </div>
          </div>
          
          <div className="service-card">
            <div className="row align-items-center">
              <div className="col-md-6">
                <img
                  src={teacher}
                  alt="For Lecturers"
                  className="service-img"
                />
              </div>
              <div className="col-md-6">
                <div className="service-content">
                  <h3>For Lecturers</h3>
                  <ul>
                    <li>Course Creation and Management</li>
                    <li>Assignment and Assessment Management</li>
                    <li>Grading and Analytics</li>
                    <li>Attendance Tracking</li>
                    <li>Interactive Teaching Tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="service-card">
            <div className="row align-items-center flex-md-row-reverse">
              <div className="col-md-6">
                <img
                  src={student}
                  alt="For Students"
                  className="service-img"
                />
              </div>
              <div className="col-md-6">
                <div className="service-content">
                  <h3>For Students</h3>
                  <ul>
                    <li>Course Access and Navigation</li>
                    <li>Assignment Submission</li>
                    <li>Gradebook and Progress Tracking</li>
                    <li>Resource Library</li>
                    <li>Collaborative Learning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="service-card">
            <div className="row align-items-center">
              <div className="col-md-6">
                <img
                  src={admin}
                  alt="For Admins"
                  className="service-img"
                />
              </div>
              <div className="col-md-6">
                <div className="service-content">
                  <h3>For Admins</h3>
                  <ul>
                    <li>User Management</li>
                    <li>Course Creation and Organization</li>
                    <li>Data Analytics and Reporting</li>
                    <li>Content Management</li>
                    <li>System Configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Our Impact</h2>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-md-3 col-sm-6 stat-item">
              <h3 className="stat-number">200+</h3>
              <p className="stat-label">Courses</p>
            </div>
            <div className="col-md-3 col-sm-6 stat-item">
              <h3 className="stat-number">40+</h3>
              <p className="stat-label">Lecturers</p>
            </div>
            <div className="col-md-3 col-sm-6 stat-item">
              <h3 className="stat-number">2,000+</h3>
              <p className="stat-label">Students</p>
            </div>
            <div className="col-md-3 col-sm-6 stat-item">
              <h3 className="stat-number">20+</h3>
              <p className="stat-label">Schools</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="contact-content">
                <MailOutlined className="contact-icon" />
                <h2>Get In Touch With Us</h2>
                <p className="contact-description">
                  Have questions about our platform? Need technical support? 
                  Interested in partnership opportunities? We're here to help you 
                  transform your educational experience.
                </p>
                <div className="contact-info">
                  <div className="contact-item">
                    <strong>Email:</strong> support@mentoriq.com
                  </div>
                  <div className="contact-item">
                    <strong>Response Time:</strong> Typically within 24 hours
                  </div>
                </div>
                <div className="contact-actions">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<MailOutlined />}
                    className="contact-button"
                    onClick={handleEmailUs}
                  >
                    Send Us an Email
                  </Button>
                  <Link to="/account/login">
                    <Button 
                      size="large" 
                      className="secondary-contact-button"
                    >
                      Start Learning Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COPYRIGHT SECTION */}
      <div className="copyright-section">
        <div className="container">
          <div className="copyright-content">
            <p className="copyright-text">
              &copy; 2024 MentorIQ. All rights reserved.
            </p>
            <div className="footer-links-bottom">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/help">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default LandingPage;
