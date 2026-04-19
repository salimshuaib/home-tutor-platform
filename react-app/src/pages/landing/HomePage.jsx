import { Link } from 'react-router-dom';
import LandingNav from '../../components/layout/LandingNav';

export default function HomePage() {
  return (
    <>
      <LandingNav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="hero-inner">
          <div>
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              <span>Delhi's #1 Tutor Platform</span>
            </div>
            <h1 className="hero-title">
              Expert Home Tuition in <span className="accent">Delhi</span>
            </h1>
            <p className="hero-desc">
              Find verified, qualified home tutors for every subject and class. Post your requirement for free and get connected within 24 hours.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn-primary">Find a Tutor →</Link>
              <Link to="/signup?role=tutor" className="btn-secondary">Register as Tutor</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num">2,500+</div>
                <div className="stat-label">Active Tutors</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">8,000+</div>
                <div className="stat-label">Happy Students</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">4.9★</div>
                <div className="stat-label">Avg. Rating</div>
              </div>
            </div>
          </div>
          <div className="hero-cards">
            <Link to="/signup" className="path-card">
              <span className="path-card-icon">📚</span>
              <div className="path-card-title">I Need a Tutor</div>
              <p className="path-card-desc">Post your tuition requirement and get matched with the perfect tutor — completely free.</p>
              <span className="path-card-tag tag-free">✓ Always Free</span>
            </Link>
            <Link to="/signup?role=tutor" className="path-card">
              <span className="path-card-icon">🎓</span>
              <div className="path-card-title">I Am a Tutor</div>
              <p className="path-card-desc">Access verified student leads daily and grow your private tutoring business across Delhi.</p>
              <span className="path-card-tag tag-pro">★ Premium Leads</span>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hiw" id="how-it-works">
        <div className="hiw-inner">
          <div className="hiw-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Simple. Fast. <span className="italic">Effective.</span></h2>
            <p className="section-desc">Get started in under 2 minutes — whether you're looking for a tutor or offering tuition services.</p>
          </div>
          <div className="hiw-steps">
            <div className="step-card">
              <div className="step-num">01</div>
              <span className="step-icon">📝</span>
              <div className="step-title">Post or Register</div>
              <p className="step-text">Students post their tuition needs. Tutors create a verified profile with qualifications.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <span className="step-icon">🔍</span>
              <div className="step-title">Smart Matching</div>
              <p className="step-text">Our algorithm matches students with the best-fit tutors based on subject, location, and preferences.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <span className="step-icon">🤝</span>
              <div className="step-title">Connect & Learn</div>
              <p className="step-text">Tutors apply to leads, students review profiles, and classes begin — all within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="pricing-header">
            <span className="section-tag" style={{ color: '#F5954A' }}>Pricing</span>
            <h2 className="section-title" style={{ color: '#fff' }}>Transparent & <span className="italic">Fair</span></h2>
            <p className="section-desc" style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto' }}>No hidden charges. Students always free. Tutors invest only in quality leads.</p>
          </div>
          <div className="pricing-cards">
            <div className="price-card price-card-student">
              <span className="price-icon">📚</span>
              <div className="price-title">For Students</div>
              <div className="price-sub">Find the perfect home tutor</div>
              <div className="price-amount">
                <div className="price-num">FREE</div>
                <div className="price-per">Always free, no hidden charges</div>
              </div>
              <ul className="price-features">
                <li><span className="check">✓</span> Post unlimited tuition requests</li>
                <li><span className="check">✓</span> Browse verified tutor profiles</li>
                <li><span className="check">✓</span> Direct contact with matched tutors</li>
                <li><span className="check">✓</span> Compare qualifications & reviews</li>
              </ul>
              <Link to="/signup" className="btn-card-student">Get Started Free →</Link>
            </div>
            <div className="price-card price-card-teacher">
              <span className="price-icon">🎓</span>
              <div className="price-title">For Tutors</div>
              <div className="price-sub">Grow your tutoring business</div>
              <div className="price-amount">
                <div className="price-num">₹499</div>
                <div className="price-per">per month — cancel anytime</div>
              </div>
              <ul className="price-features">
                <li><span className="check">✓</span> Daily verified student leads</li>
                <li><span className="check">✓</span> Smart matching algorithm</li>
                <li><span className="check">✓</span> Verified profile badge</li>
                <li><span className="check">✓</span> Priority listing in search results</li>
              </ul>
              <Link to="/signup?role=tutor" className="btn-card-teacher">Start Teaching →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="subjects" id="subjects">
        <div className="subjects-inner">
          <div className="subjects-header">
            <div>
              <span className="section-tag">Subjects</span>
              <h2 className="section-title">Every Subject, <span className="italic">Covered</span></h2>
            </div>
          </div>
          <div className="subject-grid">
            {[
              { icon: '📐', name: 'Mathematics', level: 'Class 1 – 12 & Beyond' },
              { icon: '🔬', name: 'Science', level: 'Physics, Chemistry, Biology' },
              { icon: '📖', name: 'English', level: 'Grammar, Literature, Writing' },
              { icon: '💻', name: 'Computer Science', level: 'Programming & IT' },
              { icon: '🌍', name: 'Social Studies', level: 'History, Geography, Civics' },
              { icon: '🗣️', name: 'Hindi', level: 'Language & Literature' },
              { icon: '📊', name: 'Commerce', level: 'Accounts, Economics, Business' },
              { icon: '✏️', name: 'All Subjects', level: 'Complete Home Tuition' },
            ].map(s => (
              <div className="subject-card" key={s.name}>
                <span className="subject-icon">{s.icon}</span>
                <div className="subject-name">{s.name}</div>
                <div className="subject-level">{s.level}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why" id="why-us">
        <div className="why-inner">
          <div className="why-visual">
            <div className="why-big-card">
              <div className="why-card-quote">"</div>
              <p className="why-card-text">My son's math grades improved from C to A+ in just 2 months. The tutor was patient, qualified, and truly dedicated.</p>
              <div className="why-card-author">
                <div className="why-avatar">👩</div>
                <div>
                  <div className="why-author-name" style={{ color: '#fff' }}>Priya Sharma</div>
                  <div className="why-author-role">Parent, South Delhi</div>
                </div>
              </div>
            </div>
            <div className="why-float-stat">
              <div className="why-float-num">98%</div>
              <div className="why-float-label">Satisfaction Rate</div>
            </div>
          </div>
          <div>
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">Built for <span className="italic">Trust</span></h2>
            <p className="section-desc" style={{ marginBottom: 32 }}>Every aspect of our platform is designed to ensure quality, safety, and results.</p>
            <ul className="why-points">
              <li className="why-point">
                <div className="why-point-icon">✅</div>
                <div>
                  <div className="why-point-title">Verified Tutors Only</div>
                  <p className="why-point-text">Every tutor undergoes ID verification, qualification check, and background screening.</p>
                </div>
              </li>
              <li className="why-point">
                <div className="why-point-icon">⚡</div>
                <div>
                  <div className="why-point-title">24-Hour Matching</div>
                  <p className="why-point-text">Get matched with relevant tutors within 24 hours of posting your requirement.</p>
                </div>
              </li>
              <li className="why-point">
                <div className="why-point-icon">🎯</div>
                <div>
                  <div className="why-point-title">Smart Algorithm</div>
                  <p className="why-point-text">Our AI considers subject, location, class, board, and teaching mode for the best match.</p>
                </div>
              </li>
              <li className="why-point">
                <div className="why-point-icon">🛡️</div>
                <div>
                  <div className="why-point-title">100% Safe & Secure</div>
                  <p className="why-point-text">Your personal data is encrypted and never shared without consent.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2 className="cta-banner-title">Ready to Transform Your Learning?</h2>
          <p className="cta-banner-desc">Join thousands of families and tutors across Delhi who trust our platform for quality home tuition.</p>
          <div className="cta-banner-btns">
            <Link to="/signup" className="btn-white">Find a Tutor Now</Link>
            <Link to="/signup?role=tutor" className="btn-white-outline">Register as Tutor</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">Delhi <span>Private</span> Tutors</div>
            <p className="footer-brand-desc">Delhi's most trusted platform connecting students with verified, qualified home tutors since 2024.</p>
          </div>
          <div>
            <div className="footer-col-title">Platform</div>
            <ul className="footer-links">
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#subjects">Subjects</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <ul className="footer-links">
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Delhi Private Tutors. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
