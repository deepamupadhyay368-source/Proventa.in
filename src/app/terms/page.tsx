import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Proventa Credit Intelligence',
  description: 'Proventa Terms of Service — governing law India, 99.9% SLA commitment.',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#0B1F3A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>P</div>
          <span style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>PROVENTA</span>
        </Link>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
          ← Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981', letterSpacing: '0.06em' }}>GOVERNING LAW: INDIA</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: '#0B1F3A', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Terms of Service
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            <strong>Effective Date:</strong> January 1, 2025 &nbsp;|&nbsp; <strong>Version:</strong> 1.0
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
            <strong>Important:</strong> Please read these Terms of Service carefully before using the Proventa platform. By creating an account or accessing our services, you agree to be bound by these terms. If you disagree with any part of these terms, you may not use our services.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Section 1 */}
          <Section title="1. Acceptance of Terms">
            <p>These Terms of Service ("Terms") constitute a legally binding agreement between you (the "User" or "Customer") and <strong>Proventa Technologies Private Limited</strong> ("Proventa", "Company", "we", "us"), a company incorporated under the Companies Act, 2013, with respect to your use of the Proventa Credit Intelligence Platform (the "Service").</p>
            <p style={{ marginTop: '0.75rem' }}>By accessing or using the Service, you represent that:</p>
            <ul>
              <li>You are at least 18 years of age and have the legal capacity to enter into a binding contract</li>
              <li>You have authority to bind your organization to these Terms if accessing on behalf of a business entity</li>
              <li>You have read, understood, and agree to be bound by these Terms and our Privacy Policy</li>
            </ul>
          </Section>

          {/* Section 2 */}
          <Section title="2. Description of Services">
            <p>Proventa provides a Software-as-a-Service (SaaS) credit intelligence platform that includes:</p>
            <ul>
              <li><strong>Credit Assessment Engine:</strong> AI-powered risk scoring and credit rating for business counterparties</li>
              <li><strong>Accounts Receivable Management:</strong> Invoice tracking, aging analysis, and collection management</li>
              <li><strong>AI Financial Forecasting:</strong> Predictive analytics for revenue, cash flow, and DSO (available on Growth and Enterprise plans)</li>
              <li><strong>Industry Benchmarking:</strong> Comparison of your metrics against sector peers</li>
              <li><strong>GST & MCA Integration:</strong> GSTIN lookup and MCA/ROC data verification</li>
              <li><strong>Document Vault:</strong> Secure storage for financial documents with AES-256 encryption</li>
              <li><strong>CA Copilot:</strong> AI-assisted compliance and financial analysis tools</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>The Service is provided on an "as-is" basis with the service levels described in Section 10 (SLA).</p>
          </Section>

          {/* Section 3 */}
          <Section title="3. User Obligations & Acceptable Use">
            <p>You agree to use the Service only for lawful purposes. You shall not:</p>
            <ul>
              <li>Use the Service to process data for purposes other than legitimate business credit management</li>
              <li>Upload false, fraudulent, or misleading financial information</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the platform</li>
              <li>Share your account credentials with unauthorized parties</li>
              <li>Use the platform for money laundering, fraud, or any illegal financial activity</li>
              <li>Scrape, crawl, or extract data from the platform via automated means without prior written consent</li>
              <li>Violate any applicable Indian law, including the IT Act 2000, Prevention of Money Laundering Act, or Foreign Exchange Management Act</li>
              <li>Transmit malware, viruses, or any code designed to interfere with the Service</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Proventa reserves the right to suspend or terminate accounts found in violation of these obligations without prior notice.</p>
          </Section>

          {/* Section 4 */}
          <Section title="4. Payment Terms & Subscriptions">
            <SubSection title="4.1 Subscription Plans">
              <p>Proventa offers three subscription tiers: Free, Growth (₹2,999/month), and Enterprise (custom pricing). Plan details, feature limits, and pricing are as displayed at the time of subscription.</p>
            </SubSection>
            <SubSection title="4.2 Billing & Renewal">
              <ul>
                <li>Subscriptions are billed monthly or annually in advance</li>
                <li>Payments are processed via Stripe and are non-refundable unless otherwise stated</li>
                <li>Subscriptions auto-renew unless cancelled at least 7 days before the renewal date</li>
                <li>Prices are exclusive of applicable GST/taxes; Indian GST at 18% applies</li>
              </ul>
            </SubSection>
            <SubSection title="4.3 Free Trials">
              <p>We offer a 14-day free trial of the Growth plan. Credit card details may be required. If not cancelled before trial expiry, you will be charged the Growth plan fee. One free trial per organization.</p>
            </SubSection>
            <SubSection title="4.4 Refund Policy">
              <p>Refunds may be issued at Proventa's sole discretion in cases of proven service failure. No refunds for partial months or unused features. Contact <a href="mailto:billing@proventa.in" style={{ color: '#2563EB' }}>billing@proventa.in</a> for refund requests.</p>
            </SubSection>
          </Section>

          {/* Section 5 */}
          <Section title="5. Data Privacy & Security">
            <p>Your use of the Service is subject to our <Link href="/privacy" style={{ color: '#2563EB' }}>Privacy Policy</Link>, which is incorporated herein by reference. Key commitments:</p>
            <ul>
              <li>Your data is stored exclusively in India (Mumbai) unless you opt for international replication</li>
              <li>We implement AES-256 encryption at rest and TLS 1.3 in transit</li>
              <li>We do not sell, rent, or share your business or financial data with third parties for marketing</li>
              <li>You retain full ownership of all data you upload to the platform</li>
              <li>Upon account termination, data will be purged within 30 days (subject to statutory retention requirements)</li>
            </ul>
          </Section>

          {/* Section 6 */}
          <Section title="6. Intellectual Property">
            <p>All rights, title, and interest in the Proventa platform, including software, algorithms, UI/UX designs, credit models, and documentation, are owned exclusively by Proventa Technologies Private Limited.</p>
            <p style={{ marginTop: '0.75rem' }}>You retain ownership of all data, reports, and assessments you generate using the Service. You grant Proventa a limited, non-exclusive license to process your data solely for the purpose of providing the Service. Proventa may use anonymized, aggregated data to improve its AI models.</p>
            <p style={{ marginTop: '0.75rem' }}>You may not copy, reproduce, distribute, or create derivative works based on the Proventa platform without express written consent.</p>
          </Section>

          {/* Section 7 */}
          <Section title="7. Limitation of Liability">
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#991b1b' }}>IMPORTANT DISCLAIMER</p>
            </div>
            <p>Proventa's credit scores, risk ratings, and financial forecasts are <strong>analytical tools</strong> designed to assist decision-making. They do not constitute financial advice, legal advice, or guarantees of creditworthiness. You are solely responsible for business decisions made based on our platform's outputs.</p>
            <p style={{ marginTop: '0.75rem' }}>To the maximum extent permitted by applicable law:</p>
            <ul>
              <li>Proventa's total liability for any claim shall not exceed the fees paid by you in the 3 months preceding the claim</li>
              <li>We are not liable for indirect, incidental, consequential, or punitive damages</li>
              <li>We are not liable for losses arising from reliance on AI-generated credit assessments without independent verification</li>
              <li>We are not responsible for third-party service failures (GST portal, MCA, Stripe, etc.)</li>
            </ul>
          </Section>

          {/* Section 8 */}
          <Section title="8. Warranties & Disclaimers">
            <p>Proventa warrants that:</p>
            <ul>
              <li>The Service will function materially as described in our documentation</li>
              <li>We will maintain industry-standard security practices</li>
              <li>We have the right to provide the Service and it does not infringe third-party IP rights</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Except as stated above, THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
          </Section>

          {/* Section 9 */}
          <Section title="9. Termination">
            <SubSection title="9.1 Termination by User">
              <p>You may cancel your subscription at any time via the Billing page in your dashboard. Cancellation takes effect at the end of the current billing period. No refunds for the remaining period.</p>
            </SubSection>
            <SubSection title="9.2 Termination by Proventa">
              <p>Proventa may suspend or terminate your access immediately if:</p>
              <ul>
                <li>You materially breach these Terms and fail to remedy within 14 days of notice</li>
                <li>We detect fraudulent activity or misuse of the platform</li>
                <li>You fail to pay outstanding fees within 30 days of due date</li>
                <li>Continued operation would violate applicable law</li>
              </ul>
            </SubSection>
            <SubSection title="9.3 Effect of Termination">
              <p>Upon termination, your access is revoked immediately. You may export your data within 30 days of termination by contacting support. After 30 days, data will be purged per our Privacy Policy.</p>
            </SubSection>
          </Section>

          {/* Section 10 — SLA */}
          <Section title="10. Service Level Agreement (SLA)">
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { metric: 'Uptime Commitment', value: '99.9%', period: 'Monthly SLA' },
                  { metric: 'API Response Time', value: '< 500ms', period: 'P95 percentile' },
                  { metric: 'Data Processing', value: '< 30s', period: 'Credit assessments' },
                  { metric: 'Support Response', value: '< 4 hours', period: 'Business hours (PRO/ENT)' },
                ].map((s) => (
                  <div key={s.metric} style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#10B981' }}>{s.value}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B1F3A' }}>{s.metric}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{s.period}</div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ marginTop: '1rem' }}>If monthly uptime falls below 99.9%, affected customers on paid plans are eligible for a service credit of 10% of monthly fees for each additional 0.1% downtime, up to a maximum of 30% of monthly fees. Planned maintenance windows (communicated 48 hours in advance) are excluded from SLA calculations.</p>
          </Section>

          {/* Section 11 */}
          <Section title="11. Governing Law & Dispute Resolution">
            <p>These Terms are governed by and construed in accordance with the laws of India, specifically the Information Technology Act, 2000, the Companies Act, 2013, and the Indian Contract Act, 1872.</p>
            <p style={{ marginTop: '0.75rem' }}>Any disputes arising out of or in connection with these Terms shall be resolved as follows:</p>
            <ul>
              <li><strong>Step 1 — Negotiation:</strong> Parties shall attempt to resolve disputes amicably within 30 days of written notice</li>
              <li><strong>Step 2 — Mediation:</strong> If unresolved, parties shall engage in mediation under the Mediation Act, 2023</li>
              <li><strong>Step 3 — Arbitration:</strong> If mediation fails, disputes shall be resolved via arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual agreement</li>
              <li><strong>Jurisdiction:</strong> Subject to the above, exclusive jurisdiction shall be with the courts of Mumbai, Maharashtra</li>
            </ul>
          </Section>

          {/* Section 12 */}
          <Section title="12. General Provisions">
            <ul>
              <li><strong>Entire Agreement:</strong> These Terms and the Privacy Policy constitute the entire agreement between the parties</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in full force</li>
              <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver of that right</li>
              <li><strong>Assignment:</strong> You may not assign your rights without prior written consent. Proventa may assign in connection with a merger or acquisition</li>
              <li><strong>Force Majeure:</strong> Neither party is liable for delays caused by circumstances beyond reasonable control</li>
              <li><strong>Amendments:</strong> We reserve the right to modify these Terms with 30 days notice for material changes</li>
            </ul>
          </Section>

          {/* Section 13 */}
          <Section title="13. Contact Information">
            <div style={{ background: '#0B1F3A', color: '#fff', padding: '1.5rem', borderRadius: '12px', lineHeight: 1.8 }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>Proventa Technologies Private Limited</div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                <div>📧 Legal enquiries: <a href="mailto:legal@proventa.in" style={{ color: '#60a5fa' }}>legal@proventa.in</a></div>
                <div>📧 Billing: <a href="mailto:billing@proventa.in" style={{ color: '#60a5fa' }}>billing@proventa.in</a></div>
                <div>📧 Support: <a href="mailto:support@proventa.in" style={{ color: '#60a5fa' }}>support@proventa.in</a></div>
                <div style={{ marginTop: '0.5rem' }}>📍 Registered Office: India</div>
              </div>
            </div>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0B1F3A', color: 'rgba(255,255,255,0.6)', padding: '2rem', textAlign: 'center', marginTop: '4rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Link href="/terms" style={{ color: '#60a5fa', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/book-demo" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Book a Demo</Link>
        </div>
        <p style={{ margin: 0 }}>© 2025 Proventa Technologies Private Limited. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#0B1F3A', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        {title}
      </h2>
      <div style={{ color: '#374151', lineHeight: 1.8, fontSize: '0.9rem' }}>
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0B1F3A', marginBottom: '0.5rem' }}>{title}</h3>
      {children}
    </div>
  );
}
