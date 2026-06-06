import { useState, useEffect } from 'react';

interface Channel {
  name: string;
  key: string;
  val: number;
  cac: number;
  ret: number;
  imp: number;
}

interface ABTestCase {
  title: string;
  hyp: string;
  a: { lbl: string; desc: string; ctr: number; conv: number };
  b: { lbl: string; desc: string; ctr: number; conv: number };
  w: 'A' | 'B';
  kpi: string;
}

interface CalendarItem {
  p: 'tiktok' | 'ig' | 'x' | 'wa' | 'all';
  t: string;
  h: string;
}

interface CalendarDay {
  day: number;
  theme: string;
  items: CalendarItem[];
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  // Budget state defaults as described in HTML
  const [channels, setChannels] = useState<Channel[]>([
    { name: 'TikTok Content & Ads', key: 'tt', val: 2200000, cac: 1800, ret: 0.06, imp: 1200000 },
    { name: 'Campus Activations', key: 'ca', val: 2500000, cac: 2200, ret: 0.14, imp: 400000 },
    { name: 'Micro-Influencers', key: 'mi', val: 1800000, cac: 2800, ret: 0.08, imp: 900000 },
    { name: 'Instagram Ads', key: 'ig', val: 1500000, cac: 3100, ret: 0.04, imp: 700000 },
    { name: 'Referral Rewards', key: 'rr', val: 1200000, cac: 900, ret: 0.10, imp: 300000 },
    { name: 'Community Marketing', key: 'cm', val: 800000, cac: 600, ret: 0.05, imp: 250000 },
    { name: 'OOH / Transit', key: 'oh', val: 1000000, cac: 4200, ret: 0.02, imp: 600000 },
    { name: 'PR & Media', key: 'pr', val: 1000000, cac: 5000, ret: 0.03, imp: 800000 },
  ]);

  // A/B Testing ran state
  const [abRan, setAbRan] = useState<{ [key: number]: boolean }>({});

  // 2-Week Content Calendar active day index
  const [selectedDay, setSelectedDay] = useState(0);

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Timed loader fadeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Track window scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollPct(pct);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scrollSpy navigation highlight
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          const id = e.target.id;
          const secMap: { [key: string]: number } = {
            hero: 0, s1: 1, s2: 2, s3: 3, s4: 4, s5: 5, s6: 6, s7: 7, s8: 8, s9: 9, s10: 10, s11: 11, s12: 12, s13: 13
          };
          if (secMap[id] !== undefined) {
            setActiveSection(secMap[id]);
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '-60px 0px' });

    const sections = document.querySelectorAll('section');
    sections.forEach((s) => io.observe(s));

    return () => {
      sections.forEach((s) => io.unobserve(s));
      io.disconnect();
    };
  }, []);

  // Calculations for budget simulator
  const updateChannelVal = (key: string, newVal: number) => {
    setChannels(prev => prev.map(ch => ch.key === key ? { ...ch, val: newVal } : ch));
  };

  let totalAllocated = 0;
  let totalUsers = 0;
  let totalImp = 0;
  let blendedNum = 0;
  let retBoost = 0;

  channels.forEach((ch) => {
    totalAllocated += ch.val;
    if (ch.val > 0) {
      const u = Math.round(ch.val / ch.cac);
      totalUsers += u;
      totalImp += ch.imp; // simple addition based on original calculation
      blendedNum += ch.val;
      retBoost += ch.ret;
    }
  });

  const cap = 12000000;
  const budgetRatio = Math.min(totalAllocated / cap, 1);
  const cac = totalUsers > 0 ? Math.round(blendedNum / totalUsers) : 0;
  const computedRetention = Math.min(Math.round(18 + retBoost * 100), 58);
  const computedImpressionsM = (totalImp / 1000000).toFixed(1);

  const maxValValue = Math.max(...channels.map(ch => ch.val));

  // A/B test setup
  const abTests: ABTestCase[] = [
    {
      title: 'Ad Creative Style',
      hyp: 'Relatable slang-based ads convert better than polished corporate creative for under-25 Nigerian users.',
      a: { lbl: 'Version A — Corporate', desc: 'Clean design. "Take control of your finances." Professional imagery.', ctr: 2.1, conv: 0.8 },
      b: { lbl: 'Version B — Slang-First', desc: '"E don do for sapa this month?" — Direct TikTok-style. Real faces.', ctr: 5.4, conv: 2.3 },
      w: 'B',
      kpi: 'CTR target 4%+, conversion target 1.8%+'
    },
    {
      title: 'Push Notification Copy',
      hyp: 'Personalized, time-aware notifications outperform generic reminders for savings activation.',
      a: { lbl: 'Version A — Generic', desc: '"Don\'t forget to save today!"', ctr: 8.2, conv: 3.1 },
      b: { lbl: 'Version B — Contextual', desc: '"Your salary usually comes in this week — save Two Thousand Naira before you spend it?"', ctr: 19.7, conv: 11.4 },
      w: 'B',
      kpi: 'Open rate target 15%+, activation target 8%+'
    },
    {
      title: 'Referral Incentive Structure',
      hyp: 'Dual-sided rewards generate significantly more referrals than single-sided bonuses.',
      a: { lbl: 'Version A — Referrer Only', desc: 'Refer a friend, get Three Hundred Naira. Friend gets nothing.', ctr: 12.0, conv: 4.2 },
      b: { lbl: 'Version B — Both Sides Win', desc: 'Refer a friend, both receive Five Hundred Naira when they save Two Thousand Naira.', ctr: 28.5, conv: 14.7 },
      w: 'B',
      kpi: 'Referral rate target 20%+, conversion target 10%+'
    },
    {
      title: 'Call-to-Action Language',
      hyp: 'Benefit-led CTAs outperform action-led CTAs for Nigerian fintech users who are skeptical of commitment.',
      a: { lbl: 'Version A — Action CTA', desc: '"Download Moni Now"', ctr: 3.8, conv: 1.4 },
      b: { lbl: 'Version B — Benefit CTA', desc: '"See how much you could save this month"', ctr: 7.2, conv: 3.9 },
      w: 'B',
      kpi: 'CTR target 6%+, install conversion target 3%+'
    }
  ];

  // Calendar Day setup
  const calData: CalendarDay[] = [
    {
      day: 1,
      theme: 'Launch Day',
      items: [
        { p: 'tiktok', t: 'Founders origin video — "Why we built Moni." Raw, no filters, shot on iPhone.', h: 'Real story, real people' },
        { p: 'ig', t: 'Launch graphic with Five Hundred Naira first-signup bonus. Swipe carousel: 5 money struggles Moni fixes.', h: '#SapaNoFit goes live' },
        { p: 'wa', t: 'Blast to all beta user WhatsApp groups. "We are officially live. Tell your people."', h: 'Word of mouth starts here' }
      ]
    },
    {
      day: 2,
      theme: 'Sapa Awareness',
      items: [
        { p: 'tiktok', t: '"Rate your sapa level" TikTok trend video. 1–10 scale. Moni drops in comments.', h: 'High shareability, near-zero cost' },
        { p: 'x', t: 'Twitter thread: "7 signs you are in sapa and what Moni does about each one"', h: 'Finance Twitter loves this format' }
      ]
    },
    {
      day: 3,
      theme: 'User Proof',
      items: [
        { p: 'ig', t: 'First beta user testimonial. Real screenshot of savings dashboard. Name and face with permission.', h: 'Social proof over product claims' },
        { p: 'tiktok', t: '48-hour savings challenge: save Five Hundred Naira today on Moni. Show us tomorrow.', h: 'Activation and content in one move' }
      ]
    },
    {
      day: 4,
      theme: 'Trust Building',
      items: [
        { p: 'all', t: 'CBN license post. NDIC coverage explained in plain English. "Here is exactly who protects your money."', h: 'Address the elephant in the room' },
        { p: 'x', t: 'Q&A thread: most common concerns about new fintech apps. Founders answer personally.', h: 'Transparency builds faster than ads' }
      ]
    },
    {
      day: 5,
      theme: 'Campus Activation — Lagos',
      items: [
        { p: 'wa', t: 'UNILAG activation live. 9am–4pm. Ambassador team posts live updates to WhatsApp status.', h: 'FOMO for those not there' },
        { p: 'tiktok', t: 'Live TikTok from activation. Spin-the-wheel. Student reactions.', h: 'Real energy, real people' }
      ]
    },
    {
      day: 6,
      theme: 'Referral Push',
      items: [
        { p: 'ig', t: '"Awoof for Two" referral mechanic explained. Clean graphic. Benefits crystal clear.', h: 'Make sharing feel generous' },
        { p: 'tiktok', t: '"I referred 3 friends and got 1,500 Naira in one day." Student testimonial.', h: 'Show it working in practice' }
      ]
    },
    {
      day: 7,
      theme: 'Week One Milestone',
      items: [
        { p: 'x', t: 'Tweet from founders: "One week live. Here is what we have learned." Honest and specific.', h: 'Transparency is its own marketing' },
        { p: 'ig', t: 'Stats post: users signed up, savings goals created, cities active.', h: 'Show traction publicly' }
      ]
    },
    {
      day: 8,
      theme: 'Education',
      items: [
        { p: 'tiktok', t: '"What is automated savings and why is it better than doing it yourself?" 45-second explainer.', h: 'Educate before selling' },
        { p: 'ig', t: 'Carousel: 5 spending categories where young Nigerians lose money without realizing.', h: 'Mirror their reality' }
      ]
    },
    {
      day: 9,
      theme: 'NYSC Focus',
      items: [
        { p: 'wa', t: 'Targeted content into NYSC WhatsApp groups. "Corpers: your allawee does not have to disappear."', h: 'Speak to their specific income reality' },
        { p: 'ig', t: 'Corper persona journey: Month 1 vs Month 3 with Moni.', h: 'Aspirational but believable' }
      ]
    },
    {
      day: 10,
      theme: 'Emergency Cash',
      items: [
        { p: 'tiktok', t: '"The 3am money emergency — what would you do?" Story format. Reveal: Moni emergency access.', h: 'Solve the fear, not just the feature' },
        { p: 'x', t: 'Poll: "Has a financial emergency ever cost you more because you had no quick access to cash?"', h: 'Start with empathy, end with solution' }
      ]
    },
    {
      day: 11,
      theme: 'Campus Activation — Ibadan',
      items: [
        { p: 'wa', t: 'UI Ibadan activation. Same energy as Lagos. Ambassador team leads on the ground.', h: 'Scale the proven model' },
        { p: 'tiktok', t: 'Ibadan-specific cultural references — original content, not Lagos content repurposed.', h: 'City pride matters to conversion' }
      ]
    },
    {
      day: 12,
      theme: 'Creator Collab',
      items: [
        { p: 'ig', t: 'First macro influencer collab goes live. Genuine review, not a script.', h: 'Authenticity over polish' },
        { p: 'tiktok', t: 'Influencer savings challenge duet. Their audience meets Moni organically.', h: 'Audience overlap drives signups' }
      ]
    },
    {
      day: 13,
      theme: 'Freelancer Focus',
      items: [
        { p: 'x', t: 'Thread: "How to budget when your income is not fixed — practical guide for Nigerian freelancers"', h: 'Pure value, Moni mention is subtle' },
        { p: 'ig', t: 'Freelancer persona story. Irregular income, regular savings. Real example.', h: 'This segment is underserved and knows it' }
      ]
    },
    {
      day: 14,
      theme: 'Two-Week Milestone',
      items: [
        { p: 'all', t: 'Major milestone post across all platforms. Users acquired, savings created, cities reached. Founders thank the community personally.', h: 'Gratitude is good marketing' },
        { p: 'tiktok', t: '"What 2 weeks with Moni looked like" — compilation of activations, testimonials, and community moments.', h: 'Community creates the content for you' }
      ]
    }
  ];

  const ptagMap = {
    tiktok: 'pt-tiktok',
    ig: 'pt-ig',
    x: 'pt-x',
    wa: 'pt-wa',
    all: 'pt-all'
  };

  const plblMap = {
    tiktok: 'TikTok',
    ig: 'Instagram',
    x: 'X / Twitter',
    wa: 'WhatsApp',
    all: 'All Platforms'
  };

  const dayOfWeekNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <>
      {/* ─── LOADING SCREEN ─── */}
      {loading && (
        <div id="loader">
          <div className="loader-logo">Moni</div>
          <div className="loader-sub">Go-To-Market Strategy</div>
          <div className="loader-bar">
            <div className="loader-fill"></div>
          </div>
        </div>
      )}

      {/* ─── SCROLL PROGRESS ─── */}
      <div className="progress-bar" id="progress" style={{ width: `${scrollPct}%` }}></div>

      {/* ─── NAVIGATION BAR ─── */}
      <nav id="nav-header">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => scrollTo('#hero')}>
            <span>Moni</span>
            <small>GTM Strategy Deck</small>
          </div>
          <div className="nav-links">
            <button className={`nav-link ${activeSection === 1 ? 'active' : ''}`} onClick={() => scrollTo('#s1')}>Product</button>
            <button className={`nav-link ${activeSection === 2 ? 'active' : ''}`} onClick={() => scrollTo('#s2')}>Competitors</button>
            <button className={`nav-link ${activeSection === 3 ? 'active' : ''}`} onClick={() => scrollTo('#s3')}>Segments</button>
            <button className={`nav-link ${activeSection === 4 ? 'active' : ''}`} onClick={() => scrollTo('#s4')}>Research</button>
            <button className={`nav-link ${activeSection === 5 ? 'active' : ''}`} onClick={() => scrollTo('#s5')}>Personas</button>
            <button className={`nav-link ${activeSection === 6 ? 'active' : ''}`} onClick={() => scrollTo('#s6')}>Positioning</button>
            <button className={`nav-link ${activeSection === 7 ? 'active' : ''}`} onClick={() => scrollTo('#s7')}>Campaign</button>
            <button className={`nav-link ${activeSection === 8 ? 'active' : ''}`} onClick={() => scrollTo('#s8')}>Budget</button>
            <button className={`nav-link ${activeSection === 9 ? 'active' : ''}`} onClick={() => scrollTo('#s9')}>Metrics</button>
            <button className={`nav-link ${activeSection === 10 ? 'active' : ''}`} onClick={() => scrollTo('#s10')}>A/B Tests</button>
            <button className={`nav-link ${activeSection === 11 ? 'active' : ''}`} onClick={() => scrollTo('#s11')}>Calendar</button>
            <button className={`nav-link ${activeSection === 12 ? 'active' : ''}`} onClick={() => scrollTo('#s12')}>Stakeholders</button>
            <button className={`nav-link ${activeSection === 13 ? 'active' : ''}`} onClick={() => scrollTo('#s13')}>Reporting</button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="hero" style={{ opacity: 1, transform: 'none', padding: 0, maxWidth: 'none' }}>
        <div className="hero-bg">
          <div className="hero-bg-circle c1"></div>
          <div className="hero-bg-circle c2"></div>
        </div>
        <div className="hero-content" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
          <div className="hero-eyebrow">AltSchool Africa · Capstone · Product Marketing Strategy</div>
          <h1 className="hero-title">
            The Everyday<br />Money Companion<br />for <span>Ambitious Young</span><br />Nigerians.
          </h1>
          <p className="hero-desc">
            A comprehensive go-to-market and product marketing strategy for Moni Microfinance — built to drive adoption, reduce churn, and build lasting trust across Lagos, Ibadan, Abuja, and Port Harcourt.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="v">2,350</div>
              <div className="l">Beta Users</div>
            </div>
            <div className="hero-stat">
              <div className="v">640</div>
              <div className="l">Weekly Active</div>
            </div>
            <div className="hero-stat">
              <div className="v">4,200</div>
              <div className="l">Current CAC (NGN)</div>
            </div>
            <div className="hero-stat">
              <div className="v">18%</div>
              <div className="l">Day-30 Retention</div>
            </div>
            <div className="hero-stat">
              <div className="v">12M</div>
              <div className="l">Launch Budget (NGN)</div>
            </div>
          </div>
          <div className="hero-scroll" onClick={() => scrollTo('#s1')}>
            <span>Explore Strategy</span>
            <div className="scroll-line"></div>
          </div>
        </div>
      </section>

      {/* ─── S1: PRODUCT UNDERSTANDING ─── */}
      <section id="s1" className="visible">
        <div className="sec-eyebrow">Section A — Task One</div>
        <h2 className="sec-title">Product Understanding</h2>
        <div className="sec-divider"></div>
        <div className="quote" id="s1-quote-block">
          <p>"Your salary lands on the 25th. By the 10th, you're already calculating what you can borrow from your cousin. The money didn't disappear — it just never had anywhere to go."</p>
          <cite>The reality Moni was built to fix</cite>
        </div>
        <div className="card-grid">
          <div className="card" id="s1-card-1">
            <h4>The Core Problem</h4>
            <p>Young Nigerians don't struggle with earning — they struggle with <strong>keeping and managing what they earn.</strong> Between rising inflation, impulse spending, and no financial safety net, most people live paycheck to paycheck even when they earn reasonably well. Banks feel inaccessible. Excel sheets don't stick. Willpower alone doesn't work.</p>
          </div>
          <div className="card" id="s1-card-2">
            <h4>Why Young Nigerians Care</h4>
            <p>A 200-level student watching their allowance disappear. An NYSC corper trying to save Five Thousand Naira monthly on a fixed allawee. A freelancer who got paid in February and has nothing in March. These aren't financial literacy problems — <strong>they're structure problems.</strong> Moni provides the structure.</p>
          </div>
          <div className="card" id="s1-card-3">
            <h4>Unique Selling Proposition</h4>
            <p>Moni is the only Nigerian fintech that <strong>combines automated savings, emergency cash access, and spend tracking in one product</strong> — designed specifically for irregular income earners and first-time savers. Not a bank. Not a loan app. A money companion that works when your discipline doesn't.</p>
          </div>
          <div className="card" id="s1-card-4">
            <h4>Competitive Differentiation</h4>
            <p>PiggyVest locks your money with penalties. Kuda is a bank, not a savings coach. OPay and PalmPay are payment rails. <strong>None of them combine savings + emergency float + coaching in one experience.</strong> That is the white space Moni owns.</p>
          </div>
        </div>
        <div className="feature-grid">
          <div className="feat" id="feat-1"><div className="feat-icon">💰</div><h5>Automated Savings</h5><p>Daily, weekly or custom triggers. Set once, save always.</p></div>
          <div className="feat" id="feat-2"><div className="feat-icon">📊</div><h5>Spend Tracking</h5><p>Know exactly where the money went — before it's gone.</p></div>
          <div className="feat" id="feat-3"><div className="feat-icon">🔔</div><h5>Bill Reminders</h5><p>Rent, DSTV, school fees. No more late payment shocks.</p></div>
          <div className="feat" id="feat-4"><div className="feat-icon">⚡</div><h5>Emergency Cash</h5><p>Small advances when everything breaks at once.</p></div>
          <div className="feat" id="feat-5"><div className="feat-icon">🎯</div><h5>Goal Challenges</h5><p>Save toward something specific. Phone, travel, capital.</p></div>
        </div>
      </section>

      {/* ─── S2: COMPETITIVE INTELLIGENCE ─── */}
      <section id="s2">
        <div className="sec-eyebrow">Section A — Task Two</div>
        <h2 className="sec-title">Competitive Intelligence</h2>
        <div className="sec-divider"></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Dimension</th>
                <th style={{ color: 'var(--ochre)' }}>Moni ★</th>
                <th>PiggyVest</th>
                <th>Kuda Bank</th>
                <th>OPay</th>
                <th>PalmPay</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Core Focus</strong></td>
                <td className="moni-col">Savings + emergency cash + tracking</td>
                <td>Goal savings & investments</td>
                <td>Free digital banking</td>
                <td>Payments & agency banking</td>
                <td>Payments & cashback</td>
              </tr>
              <tr>
                <td><strong>Target User</strong></td>
                <td className="moni-col">Students, NYSC, freelancers</td>
                <td>Young earners, mid-income</td>
                <td>Banked millennials</td>
                <td>Mass market, merchants</td>
                <td>Mass market</td>
              </tr>
              <tr>
                <td><strong>Emergency Access</strong></td>
                <td className="moni-col"><span className="badge b-g">Built-in</span></td>
                <td><span className="badge b-r">Savings penalty</span></td>
                <td><span className="badge b-a">Overdraft only</span></td>
                <td><span className="badge b-r">Loan products</span></td>
                <td><span className="badge b-r">None</span></td>
              </tr>
              <tr>
                <td><strong>Spend Tracking</strong></td>
                <td className="moni-col"><span className="badge b-g">Native + smart</span></td>
                <td><span className="badge b-a">Basic</span></td>
                <td><span className="badge b-a">Basic</span></td>
                <td><span className="badge b-r">None</span></td>
                <td><span className="badge b-r">None</span></td>
              </tr>
              <tr>
                <td><strong>Bill Reminders</strong></td>
                <td className="moni-col"><span className="badge b-g">Yes</span></td>
                <td><span className="badge b-r">No</span></td>
                <td><span className="badge b-r">No</span></td>
                <td><span className="badge b-a">Payment only</span></td>
                <td><span className="badge b-a">Payment only</span></td>
              </tr>
              <tr>
                <td><strong>Student-Friendly</strong></td>
                <td className="moni-col"><span className="badge b-g">Core audience</span></td>
                <td><span className="badge b-a">Secondary</span></td>
                <td><span className="badge b-a">Secondary</span></td>
                <td><span className="badge b-r">Not targeted</span></td>
                <td><span className="badge b-r">Not targeted</span></td>
              </tr>
              <tr>
                <td><strong>Key Gap</strong></td>
                <td className="moni-col">—</td>
                <td>Withdrawal penalties</td>
                <td>No savings coaching</td>
                <td>Zero savings layer</td>
                <td>No emotional connect</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card" id="s2-benefit-card">
          <h4>Moni's Uncontested Zone</h4>
          <p>Every existing player picked one lane: savings OR banking OR payments. Nobody has combined all three in a product built specifically for under-30, low-and-irregular-income earners. That combination is Moni's competitive moat. The pitch isn't "we're better than PiggyVest" — it's "we're the only product built for how you actually live."</p>
          <div style={{ marginTop: '14px' }}>
            <span className="pill">Savings + Emergency = Unmet combo</span>
            <span className="pill">Student segment ignored by all</span>
            <span className="pill">Spend coaching is Moni's whitespace</span>
          </div>
        </div>
      </section>

      {/* ─── S3: MARKET SEGMENTATION ─── */}
      <section id="s3">
        <div className="sec-eyebrow">Section A — Task Three</div>
        <h2 className="sec-title">Market Segmentation</h2>
        <div className="sec-divider"></div>
        <div className="card-grid">
          <div className="card" id="segment-uni">
            <h4>University Students</h4>
            <p><strong>Approx. 1.8M across 4 cities.</strong> Allowance plus hustle income. Money finishes before month-end. No credit history. Banks feel intimidating. Heavy TikTok and WhatsApp users who trust word-of-mouth. Download apps friends recommend. Won't pay fees but respond to gamification and peer challenges.</p>
          </div>
          <div className="card" id="segment-nysc">
            <h4>NYSC Corpers</h4>
            <p><strong>Approx. 350,000 active nationally.</strong> Fixed allawee of Thirty-Three Thousand Naira monthly in an unfamiliar state with no home support network. Cut off from family support. Rent and feeding compete with any savings intention. Research heavily before downloading. Trust referrals from other corpers specifically.</p>
          </div>
          <div className="card" id="segment-salary">
            <h4>Young Salary Earners</h4>
            <p><strong>Approx. 2.3M in target cities.</strong> Earning Eighty to Three Hundred Thousand Naira monthly. Salary arrives and immediately disappears into family obligations, lifestyle inflation, and responsibilities. Already have Kuda or GTB. Looking for savings discipline tools. Will compare products and read reviews.</p>
          </div>
          <div className="card" id="segment-freelance">
            <h4>Freelancers & Side Hustlers</h4>
            <p><strong>Approx. 900,000+ in target cities.</strong> Income comes in bursts — big months and dry months. Hard to budget when next month's earnings are unknown. Banks don't serve irregular earners well. High product literacy. Will switch if a better product appears. Value emergency access more than any other segment.</p>
          </div>
        </div>
      </section>

      {/* ─── S4: CUSTOMER RESEARCH PLAN ─── */}
      <section id="s4">
        <div className="sec-eyebrow">Section B — Task Four</div>
        <h2 className="sec-title">Customer Research Plan</h2>
        <div className="sec-divider"></div>
        <div className="card-grid">
          <div className="card" id="res-plan-primary">
            <h4>Primary Research Methods</h4>
            <p><strong>In-depth interviews (20 users, 30 minutes):</strong> Recruit from university campuses in Ibadan and Lagos. Ask open-ended questions about the last time they ran out of money. Don't mention Moni until the last five minutes.<br /><br /><strong>WhatsApp surveys (200 respondents):</strong> Deploy through student group admins. Eight questions maximum. Include one voice note option for users who won't type.<br /><br /><strong>Community listening:</strong> Monitor Twitter finance discourse, Nairaland, and App Store reviews for organic product complaints.</p>
          </div>
          <div className="card" id="res-plan-secondary">
            <h4>Secondary Research Sources</h4>
            <p><strong>EFInA Access to Finance Survey</strong> — most comprehensive Nigerian financial behavior dataset.<br /><br /><strong>CBN Financial Inclusion Reports</strong> — official figures on unbanked population segments.<br /><br /><strong>NBS Consumer Price Index</strong> — inflation context for understanding savings behavior changes.<br /><br /><strong>App Store reviews</strong> of PiggyVest, Kuda, and OPay — unfiltered user complaints are the most valuable research available at zero cost.</p>
          </div>
        </div>
        <div className="card" style={{ marginBottom: '16px' }} id="survey-questions-card">
          <h4>Survey Questions — Anti-Bias Design</h4>
          <ol style={{ paddingLeft: '18px', fontSize: '14px', lineHeight: '2.1', color: 'var(--char3)' }}>
            <li>How do you handle it when your money finishes before month-end? <em style={{ color: 'var(--ochre)' }}>(open-ended — no options given)</em></li>
            <li>What savings apps have you used in the past 12 months? <em style={{ color: 'var(--ochre)' }}>(don't list Moni first)</em></li>
            <li>What made you stop using the last savings app you had?</li>
            <li>On a scale of 1–5, how much do you currently trust financial apps with your money? Why?</li>
            <li>If an app could do one thing to help you with money, what would that be?</li>
            <li>Have you ever borrowed money from a friend due to a financial emergency?</li>
            <li>What is your monthly income range?</li>
            <li>What would make you genuinely recommend a money app to a friend?</li>
          </ol>
        </div>
        <div className="card" id="avoid-bias-card">
          <h4>How to Avoid Research Bias</h4>
          <ul className="checklist">
            <li>Don't recruit only from Moni's existing beta users — they already like the product</li>
            <li>Don't frame questions around Moni — ask about money behavior first, apps second</li>
            <li>Allow anonymous WhatsApp responses to get honest answers about financial shame</li>
            <li>Include people who refused savings apps entirely — their objections matter most</li>
            <li>Run a 10-person pilot survey first and check if answers cluster suspiciously</li>
          </ul>
        </div>
      </section>

      {/* ─── S5: PERSONA DEVELOPMENT ─── */}
      <section id="s5">
        <div className="sec-eyebrow">Section B — Task Five</div>
        <h2 className="sec-title">Persona Development</h2>
        <div className="sec-divider"></div>
        
        {/* Persona 1 */}
        <div className="persona" id="persona-chidi">
          <div className="persona-head">
            <div className="avatar">CO</div>
            <div>
              <div className="persona-name">Chidi Okafor</div>
              <div className="persona-role">Primary Persona · 300 Level Computer Science · UNILAG, Lagos Island</div>
            </div>
          </div>
          <div className="persona-body">
            <div className="pf"><label>Background</label><p>22 years old. From Enugu, staying in a self-con in Yaba. Parents send Thirty-Five to Forty-Five Thousand Naira monthly. Tops up with sporadic freelance design work on Fiverr.</p></div>
            <div className="pf"><label>Goals</label><p>Save One Hundred and Fifty Thousand Naira for a new laptop before final year. Build freelance income to reduce dependency on parents. Land a tech job or remote role post-graduation.</p></div>
            <div className="pf"><label>Frustrations</label><p>"I start the month with good intentions but by week two I've bought data three times, ordered Bolt twice, and lent Emeka money he won't return." Tried PiggyVest once, broke the lock after two weeks.</p></div>
            <div className="pf"><label>Apps He Uses</label><p>OPay, WhatsApp, TikTok, Instagram, Fiverr, Canva, Binance P2P. Previously had PiggyVest — deleted it.</p></div>
            <div className="pf"><label>Why Moni</label><p>Emergency cash when clients pay late. Goal-based savings for the laptop. Spend tracking that shows where money went — without judgment.</p></div>
            <div className="pf"><label>How to Reach Him</label><p>TikTok finance content. Student WhatsApp groups. Campus activation at UNILAG main gate. Peer referral from coursemates.</p></div>
            <div className="pf" style={{ gridColumn: '1 / -1' }}>
              <label>Chidi's Quote</label>
              <p style={{ fontStyle: 'italic', color: 'var(--ochre)', fontFamily: 'Playfair Display, serif', fontSize: '15px' }}>
                "If my savings were automatic I wouldn't even miss the money. The problem is I see it and spend it."
              </p>
            </div>
          </div>
        </div>

        {/* Persona 2 */}
        <div className="persona" id="persona-fatima">
          <div className="persona-head" style={{ background: 'var(--char2)' }}>
            <div className="avatar" style={{ background: 'var(--cream2)', color: 'var(--char)' }}>FA</div>
            <div>
              <div className="persona-name">Fatima Abdullahi</div>
              <div className="persona-role">Secondary Persona · NYSC Corper, Ikeja Lagos · Freelance Content Creator</div>
            </div>
          </div>
          <div className="persona-body">
            <div className="pf"><label>Background</label><p>24 years old. Economics graduate from ABU Zaria. NYSC allawee: Thirty-Three Thousand Naira monthly. Makes Thirty to Eighty Thousand Naira from sponsored Instagram content.</p></div>
            <div className="pf"><label>Goals</label><p>Save Five Hundred Thousand Naira before service year ends. Build content brand to replace traditional employment. Plans to take a digital marketing course post-NYSC.</p></div>
            <div className="pf"><label>Frustrations</label><p>"My income is not regular so budgeting apps don't work for me — they assume you earn the same amount every month." Deeply distrustful of fintech after hearing stories of accounts frozen without explanation.</p></div>
            <div className="pf"><label>Apps She Uses</label><p>Instagram, TikTok, Twitter/X, Kuda, Cowrywise, WhatsApp, Canva, CapCut. Has tried PiggyVest intermittently.</p></div>
            <div className="pf"><label>Why Moni</label><p>Bill reminders for DSTV, data, rent. Emergency cash float for dry months. Goal savings that works even on irregular income. Trust-first messaging.</p></div>
            <div className="pf"><label>How to Reach Her</label><p>Instagram savings content creators. NYSC WhatsApp groups. Trust-first messaging that acknowledges Nigerian fintech skepticism directly.</p></div>
            <div className="pf" style={{ gridColumn: '1 / -1' }}>
              <label>Fatima's Quote</label>
              <p style={{ fontStyle: 'italic', color: 'var(--ochre)', fontFamily: 'Playfair Display, serif', fontSize: '15px' }}>
                "I need something that works even when I don't have a fixed income. Everything else is built for people with salaries."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── S6: POSITIONING & MESSAGING ─── */}
      <section id="s6">
        <div className="sec-eyebrow">Section C — Task Six</div>
        <h2 className="sec-title">Positioning & Messaging</h2>
        <div className="sec-divider"></div>
        <div className="pos-statement" id="positioning-blockquote-card">
          <h4 style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--ochre)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '14px' }}>Positioning Statement</h4>
          <blockquote>For young Nigerians between 18 and 30 who earn between Twenty Thousand and Two Hundred Thousand Naira monthly — whether from a salary, an allowance, or three different side hustles — Moni is the everyday money companion that automatically protects, grows, and gives you access to your money, even when the month is being difficult. Unlike savings apps that punish you for touching your money or banks that don't understand how you earn, Moni is designed around how Nigerians actually live.</blockquote>
        </div>
        <div className="tagline-box">
          <div className="tag">Campaign Tagline</div>
          <h2>"Your money. <span>Working harder</span> than you."</h2>
          <small>Social / Gen Z alternative: "Sapa stops here."</small>
        </div>
        <div className="pillars">
          <div className="pillar"><div className="pn">01</div><div><h5>Automatic by Design</h5><p>We don't ask you to be disciplined. We make discipline unnecessary. Your savings happen before you see the money. That's not a feature — it's the entire point.</p></div></div>
          <div className="pillar"><div className="pn">02</div><div><h5>Built for Your Kind of Income</h5><p>Whether your salary is fixed, your allowance arrives irregularly, or your clients pay late — Moni adapts. Not the other way around. The first fintech that doesn't assume you have a predictable income.</p></div></div>
          <div className="pillar"><div className="pn">03</div><div><h5>Access When You Need It Most</h5><p>We're not locking your money away with penalties and withdrawal conditions. When an emergency hits — and in Nigeria, it always does — Moni is there. No forms. No branch. No waiting.</p></div></div>
          <div className="pillar"><div className="pn">04</div><div><h5>We're On Your Side</h5><p>No hidden charges. No confusing fine print. No frozen accounts. Moni is CBN-licensed and NDIC-backed. We say this clearly and repeatedly because our users need to know it.</p></div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div className="card" id="pos-emotional-card">
            <h4>Emotional Angle</h4>
            <p><strong>Sapa is not your fault.</strong> Nigeria's economy is brutal. Inflation is real. Irregular income is normal. Moni doesn't make you feel bad for struggling — it gives you the tools that should have existed all along. The emotion we lead with: <strong>relief and empowerment, never guilt.</strong></p>
          </div>
          <div className="card" id="pos-trust-card">
            <h4>Trust Communication</h4>
            <p>Lead all comms with: <strong>CBN-licensed. NDIC-insured.</strong> Show real user testimonials — not actors. Show the founders' faces and their story. Publish monthly transparency reports. Trust is earned through repetition, not a single claim.</p>
          </div>
        </div>
      </section>

      {/* ─── S7: CREATIVE CAMPAIGN STRATEGY ─── */}
      <section id="s7">
        <div className="sec-eyebrow">Section C — Task Seven</div>
        <h2 className="sec-title">Creative Campaign Strategy</h2>
        <div className="sec-divider"></div>
        <div className="campaign-highlight">
          <div className="ch-label">Campaign Concept</div>
          <h3>#SapaNoFit — A Community Movement, Not a Product Launch</h3>
          <p>Moni doesn't launch with a product ad. It launches with a social movement built around the shared experience of financial struggle that millions of young Nigerians know by name. Real people, real numbers, real moments. "I saved Forty-Seven Thousand Naira in 60 days and I didn't even feel it." Not aspirational finance. Achievable finance.</p>
        </div>
        <div className="card-grid">
          <div className="card" id="campaign-card-tiktok"><h4>TikTok Execution</h4><p>30-second before/after videos. "In January I had zero savings. Here's the Moni challenge I did." No suits, no offices — lecture halls, canteens, and self-cons. Trending Afrobeats sound with money counter effects. Targeting 15–25 year olds who scroll finance content late at night when they're anxious about money.</p></div>
          <div className="card" id="campaign-card-influencers"><h4>Influencer Strategy</h4><p><strong>Tier One (2–3 macro):</strong> Nigerian finance content creators with 100k+ followers. Authentic money conversations, not sponsored scripts.<br /><br /><strong>Tier Two (15–20 micro):</strong> Campus-based and corper creators with 5k–50k followers. Higher trust, lower cost, significantly better conversion rates than macro campaigns.</p></div>
          <div className="card" id="campaign-card-campus"><h4>Campus Activation</h4><p><strong>"Moni Checkpoint"</strong> — branded pop-up booths at UNILAG, UI, and ABU. Students spin a wheel for rewards: airtime, data, or Five Hundred Naira wallet credit. Sign up on the spot. Campus ambassadors run each booth. Target: 300 signups per campus day.</p></div>
          <div className="card" id="campaign-card-referrals"><h4>Referral Strategy</h4><p><strong>"Awoof for Two"</strong> — refer a friend who saves Two Thousand Naira in their first week, both receive Five Hundred Naira wallet credit. Not a sign-up bonus (easily gamed) — an activation bonus tied to real usage. Expected referral coefficient: 1.4–1.8 per active user based on Nigerian WhatsApp sharing behavior.</p></div>
          <div className="card" id="campaign-card-offline"><h4>Offline Marketing</h4><p>Transit ads on BRT buses and Danfo inside Lagos, Ibadan, Abuja, and Port Harcourt. <strong>NYSC orientation camp posters</strong> placed through LGA coordinators — corpers are most financially vulnerable the moment they receive their allawee. University notice boards with QR codes.</p></div>
          <div className="card" id="campaign-card-twitter"><h4>X (Twitter) Strategy</h4><p>Finance Twitter threads: "7 signs you're in sapa and what Moni does about each one." Founders post authentically — not a brand account but real people. Poll-based community engagement. Retweet and amplify user success stories. The finance conversation on X Nigeria is deeply active and deeply underserved by fintech brands.</p></div>
        </div>
      </section>

      {/* ─── S8: BUDGET ALLOCATION ─── */}
      <section id="s8">
        <div className="sec-eyebrow">Section C — Task Eight</div>
        <h2 className="sec-title">Budget Allocation — Interactive Simulator</h2>
        <div className="sec-divider"></div>
        <p style={{ fontSize: '14px', color: 'var(--char3)', marginBottom: '28px', lineHeight: '1.7' }}>
          Adjust each channel's allocation below. The forecast scorecard updates in real time to show blended CAC, projected retention, total impressions, and estimated user acquisition. Total budget cap: Twelve Million Naira.
        </p>
        <div className="sim-wrap">
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ marginBottom: '20px' }}>Channel Allocations</h4>
            <div id="sliders">
              {channels.map((ch) => (
                <div className="slider-row" key={ch.key}>
                  <label htmlFor={`sl-${ch.key}`}>
                    {ch.name}
                    <span id={`sv-${ch.key}`}>NGN {(ch.val / 1000000).toFixed(1)}M</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4000000"
                    step="100000"
                    value={ch.val}
                    id={`sl-${ch.key}`}
                    onChange={(e) => updateChannelVal(ch.key, parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
            <div className="budget-total">
              <span>Total allocated</span>
              <strong id="tot" style={{ color: totalAllocated > cap ? '#E24B4A' : 'var(--ochre)' }}>
                NGN {(totalAllocated / 1000000).toFixed(1)}M
              </strong>
            </div>
            <div style={{ backgroundColor: 'var(--cream2)', borderRadius: '2px', height: '4px', marginTop: '8px' }}>
              <div
                id="bbar"
                style={{
                  height: '100%',
                  borderRadius: '2px',
                  backgroundColor: totalAllocated > cap ? '#E24B4A' : 'var(--ochre)',
                  transition: 'width .4s',
                  width: `${budgetRatio * 100}%`
                }}
              ></div>
            </div>
            {totalAllocated > cap && (
              <p style={{ color: '#E24B4A', fontSize: '12px', marginTop: '10px', fontWeight: '500' }}>
                ⚠️ Warning: Budget exceeds the 12,000,000 NGN threshold!
              </p>
            )}
          </div>
          <div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '16px' }}>Forecast Scorecard</h4>
              <div className="forecast-grid">
                <div className="fc">
                  <div className="fv" id="f-cac">NGN {cac.toLocaleString()}</div>
                  <div className="fl">Blended CAC</div>
                </div>
                <div className="fc">
                  <div className="fv" id="f-ret">{computedRetention}%</div>
                  <div className="fl">Day-30 Retention</div>
                </div>
                <div className="fc">
                  <div className="fv" id="f-imp">{computedImpressionsM}M</div>
                  <div className="fl">Impressions</div>
                </div>
                <div className="fc">
                  <div className="fv" id="f-usr">{totalUsers.toLocaleString()}</div>
                  <div className="fl">Projected Users</div>
                </div>
              </div>
            </div>
            <div className="card">
              <h4 style={{ marginBottom: '14px' }}>Channel Breakdown</h4>
              <div id="chlist" className="ch-list">
                {channels.map((ch) => {
                  const percentOfMax = maxValValue > 0 ? Math.round((ch.val / maxValValue) * 100) : 0;
                  return (
                    <div className="ch-row" key={ch.key}>
                      <div className="ch-lbl" style={{ fontSize: '11px' }}>
                        {ch.name.split(' ').slice(0, 2).join(' ')}
                      </div>
                      <div className="ch-bw">
                        <div
                          className="ch-b"
                          id={`cb-${ch.key}`}
                          style={{ width: `${percentOfMax}%`, backgroundColor: ch.val > 0 ? 'var(--ochre)' : 'rgba(0,0,0,0.1)' }}
                        ></div>
                      </div>
                      <div className="ch-v" id={`cv-${ch.key}`}>NGN {(ch.val / 1000000).toFixed(1)}M</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '16px' }}>Why Each Channel Matters</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div><strong style={{ fontSize: '13px' }}>TikTok</strong><p style={{ fontSize: '13px', marginTop: '4px' }}>Where Chidi is. Lowest CAC for under-25s. Viral coefficient is highest here. Invest early and heavily.</p></div>
            <div><strong style={{ fontSize: '13px' }}>Campus Activations</strong><p style={{ fontSize: '13px', marginTop: '4px' }}>Highest conversion rate. Face-to-face removes trust barriers instantly. Retention from campus-acquired users is 2x digital-only.</p></div>
            <div><strong style={{ fontSize: '13px' }}>Micro-Influencers</strong><p style={{ fontSize: '13px', marginTop: '4px' }}>15–20 micro creators beat one macro campaign. More authentic. Their audiences trust them. Cost: Fifty to One Hundred and Fifty Thousand Naira per creator.</p></div>
            <div><strong style={{ fontSize: '13px' }}>Community Marketing</strong><p style={{ fontSize: '13px', marginTop: '4px' }}>NYSC WhatsApp groups, student unions, finance communities. Near-zero CAC. Takes time but compounds significantly.</p></div>
            <div><strong style={{ fontSize: '13px' }}>Referral Rewards</strong><p style={{ fontSize: '13px', marginTop: '4px' }}>The most efficient channel at scale. Once critical mass is hit, referrals become self-sustaining. Invest early in the mechanics.</p></div>
            <div><strong style={{ fontSize: '13px' }}>Instagram Ads</strong><p style={{ fontSize: '13px', marginTop: '4px' }}>Where Fatima is. Retargeting warm audiences. Best for savings content — finance anxiety is most present on Instagram at night.</p></div>
          </div>
        </div>
      </section>

      {/* ─── S9: PRODUCT MARKETING METRICS ─── */}
      <section id="s9">
        <div className="sec-eyebrow">Section D — Task Nine</div>
        <h2 className="sec-title">Product Marketing Metrics</h2>
        <div className="sec-divider"></div>
        <div className="metric-row">
          <div className="metric bad"><div className="v">NGN 4,200</div><div className="l">Current CAC</div></div>
          <div className="metric warn"><div className="v">18%</div><div className="l">Day-30 Retention</div></div>
          <div className="metric"><div className="v">640</div><div className="l">Weekly Active</div></div>
          <div className="metric good"><div className="v">NGN 2,800</div><div className="l">Target CAC</div></div>
          <div className="metric good"><div className="v">45%</div><div className="l">Target Retention</div></div>
        </div>
        <div className="card-grid">
          <div className="card" id="metrics-card-cac"><h4>CAC — Customer Acquisition Cost</h4><p>Current: Four Thousand Two Hundred Naira. Too high for a product targeting users who earn Twenty to Fifty Thousand Naira monthly. <strong>Target: Two Thousand Five Hundred to Two Thousand Eight Hundred Naira within 60 days of launch.</strong> Reduce via campus activations and referrals. CAC is the health check for every marketing channel.</p></div>
          <div className="card" id="metrics-card-retention"><h4>Day-30 Retention Rate</h4><p>18% is the crisis number. Most users download and ghost. <strong>Target: 45% by Month 3 post-launch.</strong> This improves when first-session experience delivers immediate value within two minutes of signup, push notifications are timed correctly, and referral structures create social accountability.</p></div>
          <div className="card" id="metrics-card-activation"><h4>Activation Rate</h4><p>The percentage of signups who complete a first meaningful action — a savings target set or first spend tracked. <strong>Target: 65% activation within 24 hours of signup.</strong> If activation is low, the onboarding is broken — not the marketing. Fix onboarding before scaling ad spend.</p></div>
          <div className="card" id="metrics-card-dau"><h4>Daily Active Users (DAU)</h4><p>DAU tells you if people find Moni genuinely useful or just have it installed. <strong>Target: 35% DAU/MAU ratio — industry good is 25%+.</strong> Moni should be opened when a bill alert arrives, when salary lands, or when someone checks a savings goal.</p></div>
          <div className="card" id="metrics-card-referrals"><h4>Referral Rate</h4><p>How many new users come from existing users. <strong>Once retention hits 35%+, target referral rate of 1.3 — every 10 users bring in 3 more.</strong> Referral is the only channel that gets cheaper as you scale.</p></div>
          <div className="card" id="metrics-card-ltv"><h4>LTV — Lifetime Value</h4><p>With current CAC and 18% retention, LTV/CAC is likely below 1 — each user costs more than they're worth. <strong>Fix retention first, then LTV grows automatically.</strong> Target: Fifteen Thousand Naira LTV within 6 months via referral income and transaction fees.</p></div>
        </div>
        <div className="card" id="metrics-priority-card">
          <h4>Priority Order for Moni's Current Stage</h4>
          <p style={{ fontSize: '14px', lineHeight: '1.75' }}>
            Moni is pre-scale, post-launch. The correct priority sequence is: <strong>Retention → Activation → CAC → DAU → Referral Rate → LTV → Churn.</strong> Don't optimize CAC aggressively if retention is broken. Scaling acquisition into a leaky product accelerates failure.</p>
        </div>
      </section>

      {/* ─── S10: A/B TESTING FRAMEWORK ─── */}
      <section id="s10">
        <div className="sec-eyebrow">Section D — Task Ten</div>
        <h2 className="sec-title">A/B Testing Framework</h2>
        <div className="sec-divider"></div>
        <p style={{ fontSize: '14px', color: 'var(--char3)', marginBottom: '28px', lineHeight: '1.7' }}>
          Four live test simulations across ad creative, push notifications, referral structure, and call-to-action. Click "Run Test" to reveal results and winner analysis.
        </p>
        <div id="abtests">
          {abTests.map((t, idx) => {
            const hasRun = abRan[idx];
            return (
              <div className="ab-item" key={idx}>
                <h4>{t.title}</h4>
                <p className="hyp">{t.hyp}</p>
                <div className="ab-pair">
                  <div className={`ab-card ${hasRun && t.w === 'A' ? 'winner' : ''}`}>
                    <div className="ab-tag" style={{ color: 'var(--char3)' }}>{t.a.lbl}</div>
                    <h5>{t.a.lbl.split('—')[1]?.trim() || ''}</h5>
                    <p>{t.a.desc}</p>
                    <div className="bar-w">
                      <div className="bar-f" style={{ width: hasRun ? `${Math.round(t.a.ctr * 10)}%` : '0%', transition: 'width 1s ease' }}></div>
                    </div>
                    <div className="bar-stat">
                      {hasRun ? `CTR: ${t.a.ctr}% · Conv: ${t.a.conv}%` : 'Run test to see results'}
                    </div>
                  </div>
                  <div className={`ab-card ${hasRun && t.w === 'B' ? 'winner' : ''}`}>
                    <div className="ab-tag" style={{ color: 'var(--ochre)' }}>{t.b.lbl}</div>
                    <h5>{t.b.lbl.split('—')[1]?.trim() || ''}</h5>
                    <p>{t.b.desc}</p>
                    <div className="bar-w">
                      <div className="bar-f" style={{ width: hasRun ? `${Math.round(t.b.ctr * 10)}%` : '0%', transition: 'width 1s ease' }}></div>
                    </div>
                    <div className="bar-stat">
                      {hasRun ? `CTR: ${t.b.ctr}% · Conv: ${t.b.conv}%` : 'Run test to see results'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--char3)' }}>
                    <strong>Success criteria:</strong> {t.kpi}
                  </div>
                  <button
                    className={`run-btn ${hasRun ? 'done' : ''}`}
                    style={{ width: 'auto', padding: '9px 20px' }}
                    onClick={() => setAbRan(prev => ({ ...prev, [idx]: true }))}
                  >
                    {hasRun ? `Winner: Version ${t.w}` : 'Run Test'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── S11: 2-WEEK CONTENT CALENDAR ─── */}
      <section id="s11">
        <div className="sec-eyebrow">Section E — Task Eleven</div>
        <h2 className="sec-title">2-Week Content Calendar</h2>
        <div className="sec-divider"></div>
        <div className="cal-nav" id="calnav">
          {calData.map((d, i) => (
            <button
              className={`day-btn ${i === selectedDay ? 'active' : ''}`}
              key={i}
              onClick={() => setSelectedDay(i)}
            >
              Day {d.day}
              <br />
              <small style={{ fontSize: '9px', opacity: .6 }}>{dayOfWeekNames[i % 7]}</small>
            </button>
          ))}
        </div>
        <div className="day-detail" id="daydetail">
          <h3>Day {calData[selectedDay].day}: {calData[selectedDay].theme}</h3>
          {calData[selectedDay].items.map((it, itemIdx) => (
            <div className="c-item" key={itemIdx}>
              <span className={`ptag ${ptagMap[it.p]}`}>{plblMap[it.p]}</span>
              <div className="c-text">
                {it.t}
                <strong style={{ color: 'var(--char)' }}>{it.h}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── S12: STAKEHOLDER MANAGEMENT ─── */}
      <section id="s12">
        <div className="sec-eyebrow">Section E — Task Twelve</div>
        <h2 className="sec-title">Stakeholder Management</h2>
        <div className="sec-divider"></div>
        <div className="sh-grid">
          <div className="sh-card">
            <h4><div className="sh-ico">🎥</div>Micro-Influencers</h4>
            <ul>
              <li>Clear brief with talking points, not a script</li>
              <li>Pay on time — no "exposure" deals</li>
              <li>Give early product access to build authentic opinions</li>
              <li>Monthly check-ins outside campaign launches</li>
              <li>Co-create content ideas with them, not for them</li>
            </ul>
          </div>
          <div className="sh-card">
            <h4><div className="sh-ico">🎓</div>Campus Ambassadors</h4>
            <ul>
              <li>Recruit five per university — redundancy matters</li>
              <li>Pay in wallet credits plus real cash at milestones</li>
              <li>Weekly WhatsApp group check-ins</li>
              <li>Give actual responsibility, not just flyer distribution</li>
              <li>Make them the face of Moni on campus — name and photo visible</li>
            </ul>
          </div>
          <div className="sh-card">
            <h4><div className="sh-ico">📡</div>Media Platforms</h4>
            <ul>
              <li>TechCabal and Techpoint for credibility pieces</li>
              <li>Build journalist relationships before launch, not during</li>
              <li>Press kit ready: one-pager, founder bios, stats, photography</li>
              <li>Don't pitch the product — pitch the story about sapa and young Nigerians</li>
            </ul>
          </div>
          <div className="sh-card">
            <h4><div className="sh-ico">🛠️</div>Product Teams</h4>
            <ul>
              <li>Weekly sync between marketing and product on user feedback</li>
              <li>Share survey data and App Store reviews with engineering weekly</li>
              <li>Shared Notion dashboard for campaign-to-feature feedback loops</li>
              <li>Marketing owns the voice; product owns the solution — align on both</li>
            </ul>
          </div>
          <div className="sh-card">
            <h4><div className="sh-ico">💬</div>Customer Support</h4>
            <ul>
              <li>Support gets advance notice of every campaign</li>
              <li>FAQ documents created before each launch</li>
              <li>Weekly top-5 complaints shared with marketing — these are campaign ideas</li>
              <li>Response SLA: 2 hours on WhatsApp, 4 hours on email during launch month</li>
            </ul>
          </div>
          <div className="sh-card">
            <h4><div className="sh-ico">💼</div>Investors</h4>
            <ul>
              <li>Monthly update deck: five slides, no fluff</li>
              <li>Lead with the metrics that matter: CAC trend, retention, DAU</li>
              <li>Show qualitative wins: testimonials, press, viral moments</li>
              <li>Be honest about what isn't working — investors trust founders who know their numbers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── S13: DOCUMENTATION & REPORTING ─── */}
      <section id="s13">
        <div className="sec-eyebrow">Section E — Task Thirteen</div>
        <h2 className="sec-title">Documentation & Reporting</h2>
        <div className="sec-divider"></div>
        <div className="report-list">
          <div className="rr">
            <div className="rr-ico">WKL</div>
            <div>
              <h5>Weekly Reporting Dashboard</h5>
              <p>Every Monday morning: DAU, new signups, CAC by channel, top referral sources, and one qualitative win. Built in Notion or Google Sheets. Shared with founders and marketing team. Under one page. If it takes more than 15 minutes to compile, the reporting process is too complex.</p>
            </div>
          </div>
          <div className="rr">
            <div className="rr-ico">CAM</div>
            <div>
              <h5>Campaign Performance Tracking</h5>
              <p>UTM parameters on every link. Separate tracking for TikTok, Instagram, referrals, and campus activations. Monthly pivot: which channel delivered signups versus which delivered retained users — these are not the same thing. A signup that churns in week one costs CAC with zero LTV return.</p>
            </div>
          </div>
          <div className="rr">
            <div className="rr-ico">RES</div>
            <div>
              <h5>Research Findings Documentation</h5>
              <p>All user interviews transcribed and tagged in Notion — not stored in one person's head. Themes extracted and surfaced to product and marketing weekly. "Withdrew savings because of emergency" becomes a feature request. "Didn't understand the charges" becomes a messaging fix.</p>
            </div>
          </div>
          <div className="rr">
            <div className="rr-ico">LRN</div>
            <div>
              <h5>Marketing Learnings Log</h5>
              <p>After every campaign: what worked, what didn't, what we'd do differently. Updated in real time — not at the end of the year. The team that doesn't document its learning keeps making the same expensive mistakes. Target: a two-paragraph entry per campaign phase.</p>
            </div>
          </div>
          <div className="rr">
            <div className="rr-ico">FB</div>
            <div>
              <h5>Customer Feedback System</h5>
              <p>In-app NPS survey at Day 7 and Day 30 post-signup. WhatsApp channel for campus ambassadors to funnel raw feedback. Monthly aggregation of App Store reviews. Support ticket tagging by type: bug, confusion, complaint, or suggestion. Every complaint is a product improvement in plain sight.</p>
            </div>
          </div>
          <div className="rr">
            <div className="rr-ico">INV</div>
            <div>
              <h5>Monthly Investor Reporting</h5>
              <p>Five metrics front and center: Monthly Active Users, CAC trend, Day-30 retention trend, total budget spent versus allocated, and Net Promoter Score. Then one narrative paragraph on qualitative momentum. Investors want the numbers first, the story second.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer id="footer-section">
        <p>
          <strong>Moni</strong> · Go-To-Market Strategy · AltSchool Africa Capstone · 2024
          <br style={{ marginBottom: '6px' }} />
          Confidential — For internal and academic review only
        </p>
      </footer>
    </>
  );
}
