import React, { useState, useEffect } from 'react';
import azuloLogo from '../images/azulobooksbluetransparent.png';
import { BookOpen, Receipt, Package, ShoppingCart, Handshake, CreditCard, Users, Monitor, Store, ClipboardList, RefreshCw, BarChart2 } from 'lucide-react';
import { fetchPlatformPlans, type PlatformPlan } from '../services/platformBillingService';

//  Shared data 
const MODULES = [
  { icon: BookOpen,      color: '#0891b2', bg: '#e0f2fe', name: 'Accounting',     desc: 'Double-entry ledger, P&L, balance sheet',       cat: 'Finance' },
  { icon: Receipt,       color: '#0d9488', bg: '#ccfbf1', name: 'Invoicing',      desc: 'Quotes, invoices, receipts and payments',        cat: 'Finance' },
  { icon: Package,       color: '#d97706', bg: '#fef3c7', name: 'Inventory',      desc: 'Multi-warehouse stock with real-time valuation', cat: 'Operations' },
  { icon: ShoppingCart,  color: '#ea580c', bg: '#ffedd5', name: 'Purchasing',     desc: 'Purchase orders, bills & supplier management',   cat: 'Operations' },
  { icon: Handshake,     color: '#7c3aed', bg: '#ede9fe', name: 'CRM',            desc: 'Leads, pipeline & opportunity management',       cat: 'Commerce' },
  { icon: CreditCard,    color: '#0284c7', bg: '#dbeafe', name: 'Payroll',        desc: 'Automated payroll with built-in tax & compliance', cat: 'HR' },
  { icon: Users,         color: '#be185d', bg: '#fce7f3', name: 'HR & Leave',     desc: 'Employee records, leave and attendance',          cat: 'HR' },
  { icon: Monitor,       color: '#0f766e', bg: '#ccfbf1', name: 'Point of Sale',  desc: 'Touch-screen POS with offline mode',              cat: 'Commerce' },
  { icon: Store,         color: '#9333ea', bg: '#f3e8ff', name: 'E-Commerce',     desc: 'Online storefront, orders, shipping',             cat: 'Commerce' },
  { icon: ClipboardList, color: '#b45309', bg: '#fef9c3', name: 'Projects',       desc: 'Tasks, milestones, timesheets, billing',          cat: 'Operations' },
  { icon: RefreshCw,     color: '#065f46', bg: '#d1fae5', name: 'Subscriptions',  desc: 'Recurring billing and MRR tracking',              cat: 'Finance' },
  { icon: BarChart2,     color: '#1d4ed8', bg: '#dbeafe', name: 'Reports',        desc: 'Dashboards, analytics, export to Excel',          cat: 'Finance' },
];

const TESTIMONIALS = [
  { quote: "AzuloBooks replaced three separate systems we were running. Our accountant was on board within a day.", name: "Sarah M.", role: "CEO, Metro Retail Group", avatar: "SM", location: "London, UK" },
  { quote: "Payroll used to take us two days every month. Now it's done in 20 minutes — fully compliant with zero manual effort.", name: "James K.", role: "HR Manager, Logistics Co.", avatar: "JK", location: "Dubai, UAE" },
  { quote: "The inventory module alone saved us from over-ordering. We cut stock losses by 40% in the first quarter.", name: "Aisha R.", role: "Operations Director", avatar: "AR", location: "Singapore, SG" },
];

const DEFAULT_PUBLIC_PLANS: PlatformPlan[] = [
  {
    id: 'community-fallback',
    name: 'Community',
    code: 'community',
    description: 'Free forever for churches, temples, mosques, NGOs and non-profits',
    price: 0,
    priceSuffix: '/user/mo',
    billingCycle: 'monthly',
    modules: ['accounting', 'contacts', 'documents'],
    features: ['Up to 5 users', 'Free forever', 'No credit card required', 'Requires NPO verification'],
    maxUsers: 5,
    trialDays: 0,
    isPopular: false,
    sortOrder: 0,
    color: '#16a34a',
    archived: false,
  },
  {
    id: 'starter-fallback',
    name: 'Starter',
    code: 'starter',
    description: 'Great for small growing businesses',
    price: 8,
    priceSuffix: '/user/mo',
    billingCycle: 'monthly',
    modules: ['accounting', 'contacts', 'documents', 'sales'],
    features: ['Up to 10 users', 'All core modules', 'Email support'],
    maxUsers: 10,
    trialDays: 14,
    isPopular: false,
    sortOrder: 10,
    color: '#3b82f6',
    archived: false,
  },
  {
    id: 'professional-fallback',
    name: 'Professional',
    code: 'professional',
    description: 'For established businesses needing full control',
    price: 10,
    priceSuffix: '/user/mo',
    billingCycle: 'monthly',
    modules: ['accounting', 'contacts', 'documents', 'sales', 'payroll', 'crm'],
    features: ['Up to 50 users', 'All standard modules', 'Priority support', 'Advanced reports'],
    maxUsers: 50,
    trialDays: 14,
    isPopular: true,
    sortOrder: 20,
    color: '#8b5cf6',
    archived: false,
  },
];

const mergeStarterAndProfessional = (source: PlatformPlan[]): PlatformPlan[] => {
  const plans = [...source];
  const starter = plans.find(p => p.code?.toLowerCase() === 'starter');
  const mergeCandidates = plans.filter(p => ['professional', 'enterprise', 'enterprice'].includes((p.code || '').toLowerCase()));

  if (!starter || mergeCandidates.length === 0) return plans;

  const mergedFeatures = Array.from(
    new Set([
      ...(starter.features || []),
      ...mergeCandidates.flatMap(p => p.features || []),
      'All modules',
      'Up to 50 users',
    ])
  ).filter(f => !['Financial modules', 'All core modules', 'All standard modules'].includes(f));
  const mergedMaxUsers = Math.max(
    50,
    mergeCandidates.reduce((max, p) => Math.max(max, p.maxUsers ?? 0), starter.maxUsers ?? 0)
  );
  const mergedModules = Array.from(new Set(plans.flatMap(p => p.modules || [])));
  const mergedPlan: PlatformPlan = {
    ...starter,
    id: `${starter.id}-merged`,
    name: 'Standard',
    description: 'Unified plan for growing and established businesses',
    price: 8,
    priceSuffix: '/user/mo',
    modules: mergedModules,
    features: mergedFeatures,
    maxUsers: mergedMaxUsers,
    isPopular: starter.isPopular || mergeCandidates.some(p => !!p.isPopular),
    sortOrder: Math.min(starter.sortOrder ?? 99, ...mergeCandidates.map(p => p.sortOrder ?? 99)),
  };

  return plans
    .filter(p => p.id !== starter.id && !mergeCandidates.some(c => c.id === p.id))
    .concat(mergedPlan);
};

//  Star icon 
const Star = () => (
  <svg width="14" height="14" fill="#facc15" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

//  Dashboard mockup 
const DashboardMockup = ({ dark = false, tilt = false }: { dark?: boolean; tilt?: boolean }) => {
  const bg = dark ? '#1e293b' : '#fff';
  const border = dark ? '#334155' : '#e2e8f0';
  const lc = dark ? '#94a3b8' : '#9ca3af';
  const vc = dark ? '#f1f5f9' : '#0f172a';
  const rb = dark ? '#0f172a' : '#f8fafc';
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: `1px solid ${border}`, background: bg, ...(tilt ? { transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg)' } : {}) }}>
      <div style={{ background: dark ? '#0f172a' : '#f1f5f9', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: `1px solid ${border}` }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
        <div style={{ marginLeft: 10, flex: 1, background: dark ? '#1e293b' : '#fff', borderRadius: 4, padding: '4px 10px', fontSize: 10, color: lc, border: `1px solid ${border}` }}>app.azulobooks.com/dashboard</div>
      </div>
      <div style={{ display: 'flex', height: 260 }}>
        <div style={{ width: 56, background: dark ? '#020617' : '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14, gap: 8 }}>
          {['#06b6d4','#475569','#475569','#475569','#475569'].map((c, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: i === 0 ? 'rgba(6,182,212,0.18)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: rb, padding: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
            {[['Revenue','$2.4M','#06b6d4'],['Expenses','$890K','#f59e0b'],['Profit','$1.5M','#10b981'],['Invoices','48 Open','#8b5cf6']].map(([l,v,c]) => (
              <div key={String(l)} style={{ background: bg, borderRadius: 8, padding: 10, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 9, color: lc, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: vc }}>{v}</div>
                <div style={{ marginTop: 5, height: 3, borderRadius: 2, background: dark ? '#1e293b' : '#e5e7eb' }}>
                  <div style={{ width: '65%', height: '100%', background: String(c), borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 8 }}>
            <div style={{ background: bg, borderRadius: 8, padding: 10, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 9, color: lc, marginBottom: 6, fontWeight: 600 }}>Revenue vs Expenses  2026</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
                {[38,64,48,79,58,90,68,84,54,70,86,94].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: '#06b6d4', opacity: 0.85, height: `${h * 0.58}%` }} />
                    <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: '#f59e0b', opacity: 0.65, height: `${h * 0.32}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: bg, borderRadius: 8, padding: 10, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 9, color: lc, marginBottom: 6, fontWeight: 600 }}>Recent Invoices</div>
              {[['INV-1024','45,000','Paid'],['INV-1023','12,500','Open'],['INV-1022','88,000','Paid'],['INV-1021','6,200','Overdue']].map(([ref,amt,s]) => (
                <div key={String(ref)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: vc }}>{ref}</div>
                    <div style={{ fontSize: 8, color: lc }}>$ {amt}</div>
                  </div>
                  <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 999, fontWeight: 600, background: s==='Paid'?'#dcfce7':s==='Overdue'?'#fee2e2':'#dbeafe', color: s==='Paid'?'#15803d':s==='Overdue'?'#dc2626':'#1d4ed8' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [step, setStep] = useState(0);
  const [moduleFilter, setModuleFilter] = useState('All');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pricingView, setPricingView] = useState<'monthly' | 'yearly'>('monthly');
  const [pricingProduct, setPricingProduct] = useState<'azulobooks' | 'docconvert'>('azulobooks');
  const [signInOpen, setSignInOpen] = useState(false);
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const [publicPlans, setPublicPlans] = useState<PlatformPlan[]>(DEFAULT_PUBLIC_PLANS);
  const moduleCats = ['All','Finance','HR','Operations','Commerce'];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setStep(x => (x + 1) % 4), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const loadPublicPlans = async () => {
      try {
        const plans = await fetchPlatformPlans();
        if (plans.length > 0) {
          const sorted = [...plans].sort((a, b) => {
            if (a.code === 'community') return -1;
            if (b.code === 'community') return 1;
            return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
          });
          setPublicPlans(sorted);
        }
      } catch {
        // Keep fallback cards when public plan fetch is unavailable.
      }
    };
    loadPublicPlans();
  }, []);

  const STEPS = [
    { n: '01', title: 'Create your account', body: 'Sign up in 2 minutes. Pick your modules. No technical setup, no IT department required.', icon: '✦' },
    { n: '02', title: 'Bring your data in', body: 'Upload your chart of accounts, customers and products from Excel. We walk you through every field.', icon: '⬆' },
    { n: '03', title: 'Run everything from one place', body: 'Invoices, payroll, stock levels, POS sales — all in one tab, on any device, updated in real time.', icon: '◎' },
    { n: '04', title: 'Know your numbers every morning', body: 'Open your dashboard. Revenue, costs, overdue invoices — no spreadsheet archaeology required.', icon: '◈' },
  ];

  const visiblePublicPlans = mergeStarterAndProfessional(publicPlans)
    .sort((a, b) => {
      if (a.code === 'community') return -1;
      if (b.code === 'community') return 1;
      return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
    })
    .slice(0, 4);

  return (
    <div style={{ background: '#fff', color: '#111827', minHeight: '100vh', fontFamily: '"Inter",system-ui,-apple-system,sans-serif', overflowX: 'hidden' }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: scrolled ? '#fff' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid transparent', boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.2s' }}>
        <nav style={{ maxWidth: 1240, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <img src={azuloLogo} alt="AzuloBooks" style={{ height: 34 }} />
            {!isMobile && (
              <div style={{ display: 'flex', gap: 28, fontSize: 13.5, fontWeight: 500, color: '#374151' }}>
                {[['Products','products'],['Solutions','solutions'],['Pricing','pricing'],['Customers','customers']].map(([label,id]) => (
                  <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>{label}</a>
                ))}
              </div>
            )}
          </div>
          {isMobile ? (
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ width: 22, height: 2, background: '#374151', borderRadius: 2, display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
              <span style={{ width: 22, height: 2, background: '#374151', borderRadius: 2, display: 'block', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ width: 22, height: 2, background: '#374151', borderRadius: 2, display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* Backdrop closes both dropdowns */}
              {(signInOpen || getStartedOpen) && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => { setSignInOpen(false); setGetStartedOpen(false); }} />
              )}

              {/* Sign in dropdown */}
              <div style={{ position: 'relative', zIndex: 99 }}>
                <button
                  onClick={() => { setSignInOpen(o => !o); setGetStartedOpen(false); }}
                  style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#0891b2', background: 'none', border: '1.5px solid #bae6fd', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Go to your product
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.15s', transform: signInOpen ? 'rotate(180deg)' : 'none' }}><path d="M2 4l4 4 4-4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {signInOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 6, minWidth: 210, zIndex: 99 }}>
                    <a href="https://apps.azulobooks.com/#/login" target="_blank" rel="noopener noreferrer" onClick={() => setSignInOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#111827' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>📊</span>
                      <div><div style={{ fontWeight: 700, fontSize: 13 }}>AzuloBooks ERP</div><div style={{ fontSize: 11, color: '#6b7280' }}>Business management</div></div>
                    </a>
                    <div style={{ height: 1, background: '#f3f4f6', margin: '4px 6px' }} />
                    <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" onClick={() => setSignInOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#111827' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>📄</span>
                      <div><div style={{ fontWeight: 700, fontSize: 13 }}>Doc Convert</div><div style={{ fontSize: 11, color: '#6b7280' }}>File converter</div></div>
                    </a>
                  </div>
                )}
              </div>

              {/* Get started dropdown */}
              <div style={{ position: 'relative', zIndex: 99 }}>
                <button
                  onClick={() => { setGetStartedOpen(o => !o); setSignInOpen(false); }}
                  style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Get started free
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.15s', transform: getStartedOpen ? 'rotate(180deg)' : 'none' }}><path d="M2 4l4 4 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {getStartedOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 6, minWidth: 230, zIndex: 99 }}>
                    <a href="https://apps.azulobooks.com/#/register" target="_blank" rel="noopener noreferrer" onClick={() => setGetStartedOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#111827' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>📊</span>
                      <div><div style={{ fontWeight: 700, fontSize: 13 }}>AzuloBooks ERP</div><div style={{ fontSize: 11, color: '#6b7280' }}>Free 30-day trial</div></div>
                    </a>
                    <div style={{ height: 1, background: '#f3f4f6', margin: '4px 6px' }} />
                    <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" onClick={() => setGetStartedOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#111827' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>📄</span>
                      <div><div style={{ fontWeight: 700, fontSize: 13 }}>Doc Convert</div><div style={{ fontSize: 11, color: '#6b7280' }}>Free · Pro from $3/mo</div></div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
        {isMobile && menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['Products','products'],['Solutions','solutions'],['Pricing','pricing'],['Customers','customers']].map(([label,id]) => (
              <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} style={{ fontSize: 15, fontWeight: 500, color: '#374151', textDecoration: 'none', padding: '8px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>{label}</a>
            ))}
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12, marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Go to your product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a href="https://apps.azulobooks.com/#/login" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📊</span> AzuloBooks ERP
                </a>
                <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📄</span> Doc Convert
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="https://apps.azulobooks.com/#/register" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', borderRadius: 8, textDecoration: 'none', textAlign: 'center' }}>Get started — AzuloBooks ERP</a>
              <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius: 8, textDecoration: 'none', textAlign: 'center' }}>Try Doc Convert free</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: isMobile ? 'auto' : '88vh' }}>
        <div style={{ background: '#0f172a', padding: isMobile ? '56px 24px' : '80px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>The Azulo Platform</div>
            <h1 style={{ fontSize: 'clamp(2rem,3.8vw,3rem)', fontWeight: 800, color: '#f8fafc', lineHeight: 1.12, letterSpacing: '-0.025em', marginBottom: 20 }}>
              Run your entire business<br />from <span style={{ color: '#22d3ee' }}>one platform.</span>
            </h1>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8, marginBottom: 36, maxWidth: 400 }}>
              Accounting, payroll, inventory, POS and CRM — unified under one login. No integrations. No data silos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="https://apps.azulobooks.com/#/register" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 22px', fontSize: 13.5, fontWeight: 700, color: '#0f172a', background: '#22d3ee', borderRadius: 8, textDecoration: 'none' }}>Start AzuloBooks free</a>
                <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 22px', fontSize: 13.5, fontWeight: 700, color: '#fff', background: 'rgba(124,58,237,0.85)', borderRadius: 8, textDecoration: 'none' }}>Try Doc Convert free</a>
              </div>
              <a href="#products" onClick={e => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ fontSize: 13, color: '#475569', textDecoration: 'none', cursor: 'pointer' }}>→ See all products</a>
            </div>
            <div style={{ marginTop: 40, display: 'flex', gap: 36, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[['520+','businesses'],['12','modules'],['$0','to start']].map(([v,l]) => (
                <div key={String(l)}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{v}</div>
                  <div style={{ fontSize: 11.5, color: '#475569', fontWeight: 500, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: '#f8fafc', display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 520 }}><DashboardMockup tilt /></div>
        </div>
      </section>

      {/* Platform Apps */}
      <section id="products" style={{ padding: '80px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#0f172a' }}>Our products</h2>
            <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>Two focused tools. One platform. Built to work together.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>

            {/* AzuloBooks */}
            <div style={{ background: '#fff', border: '2px solid #e0f2fe', borderRadius: 20, padding: '36px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(6,182,212,0.08)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#06b6d4,#0891b2)' }} />
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>AzuloBooks</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24, maxWidth: 380 }}>A complete business ERP — accounting, payroll, inventory, POS, CRM and HR unified under one login.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['12 integrated modules, all included','Free to start — no credit card required','Used by 520+ businesses worldwide'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#374151' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#e0f2fe"/><path d="M5 8l2 2 4-4" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <a href="https://apps.azulobooks.com/#/register" target="_blank" rel="noopener noreferrer" style={{ padding: '11px 24px', fontSize: 13.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', borderRadius: 10, textDecoration: 'none' }}>Get started free →</a>
                <span style={{ fontSize: 12.5, color: '#9ca3af' }}>Free 30-day trial</span>
              </div>
            </div>

            {/* Azulo Doc Convert */}
            <div style={{ background: '#fff', border: '2px solid #ede9fe', borderRadius: 20, padding: '36px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(124,58,237,0.07)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }} />
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>Azulo Doc Convert</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24, maxWidth: 380 }}>Convert PDF, Word and Excel files in seconds. AI-powered extraction, batch processing — no desktop software needed.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['PDF, Word & Excel — all formats supported','AI-powered data extraction built in','Works in your browser, nothing to install'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#374151' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#ede9fe"/><path d="M5 8l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" style={{ padding: '11px 24px', fontSize: 13.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius: 10, textDecoration: 'none' }}>Try free →</a>
                <span style={{ fontSize: 12.5, color: '#9ca3af' }}>Free · Pro from $3/mo</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="solutions" style={{ padding: '88px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>How it works</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#0f172a' }}>Up and running the same day</h2>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Most businesses send their first invoice within hours of signing up.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 16 : 2, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 36, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg,#06b6d4,#a7f3d0)', zIndex: 0, borderRadius: 1 }} />
            {STEPS.map((s, i) => (
              <div key={i} onClick={() => setStep(i)} style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 16px', cursor: 'pointer' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', background: step === i ? '#06b6d4' : '#f0f9ff', border: `2px solid ${step === i ? '#06b6d4' : '#bae6fd'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, transition: 'all 0.2s', boxShadow: step === i ? '0 0 0 6px rgba(6,182,212,0.15)' : 'none' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: step === i ? '#06b6d4' : '#111827', marginBottom: 8, transition: 'color 0.2s' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" style={{ padding: '80px 32px', background: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Modules</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8, color: '#0f172a' }}>12 modules. One monthly bill.</h2>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Turn on only what you need. Everything talks to everything else — no glue required.</p>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
            {moduleCats.map(c => (
              <button key={c} onClick={() => setModuleFilter(c)} style={{ padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${moduleFilter === c ? '#06b6d4' : '#e5e7eb'}`, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', background: moduleFilter === c ? '#06b6d4' : '#fff', color: moduleFilter === c ? '#fff' : '#374151' }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
            {MODULES.filter(m => moduleFilter === 'All' || m.cat === moduleFilter).map(m => (
              <div key={m.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><m.icon size={20} color={m.color} strokeWidth={1.75} /></div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '88px 32px', background: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Pricing</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 10, color: '#0f172a' }}>Simple, transparent pricing</h2>
            <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>Choose the product you want to price. Each one is independently priced with no surprises.</p>
          </div>

          {/* Product tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', background: '#f8fafc', padding: 4, gap: 4 }}>
              <button
                onClick={() => setPricingProduct('azulobooks')}
                style={{ padding: '10px 24px', fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 10, transition: 'all 0.18s', background: pricingProduct === 'azulobooks' ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'transparent', color: pricingProduct === 'azulobooks' ? '#fff' : '#6b7280', boxShadow: pricingProduct === 'azulobooks' ? '0 2px 10px rgba(6,182,212,0.25)' : 'none' }}
              >
                AzuloBooks ERP
              </button>
              <button
                onClick={() => setPricingProduct('docconvert')}
                style={{ padding: '10px 24px', fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 10, transition: 'all 0.18s', background: pricingProduct === 'docconvert' ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'transparent', color: pricingProduct === 'docconvert' ? '#fff' : '#6b7280', boxShadow: pricingProduct === 'docconvert' ? '0 2px 10px rgba(124,58,237,0.2)' : 'none' }}
              >
                Doc Convert
              </button>
            </div>
          </div>

          {/* ── AzuloBooks plans ── */}
          {pricingProduct === 'azulobooks' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 12 }}>Per-user pricing · All 12 modules included · Community tier free for non-profits</p>
                <p style={{ color: '#92400e', fontSize: 12.5, maxWidth: 700, margin: '0 auto 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', fontWeight: 600 }}>
                  Light seats give employees access to leave, payslips and profile only — billed at <strong>$1 / user / month</strong>.
                </p>
                <div style={{ display: 'inline-flex', border: '1px solid #d1d5db', borderRadius: 999, overflow: 'hidden', background: '#fff' }}>
                  <button onClick={() => setPricingView('yearly')} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: pricingView === 'yearly' ? '#0f172a' : '#fff', color: pricingView === 'yearly' ? '#fff' : '#374151' }}>Yearly</button>
                  <button onClick={() => setPricingView('monthly')} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: pricingView === 'monthly' ? '#0f172a' : '#fff', color: pricingView === 'monthly' ? '#fff' : '#374151' }}>Monthly</button>
                </div>
              </div>
              <div className="grid gap-6" style={{ gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.max(1, Math.min(4, visiblePublicPlans.length))}, minmax(0, 1fr))` }}>
                {visiblePublicPlans.map((plan) => {
                  const isCommunity = plan.code === 'community';
                  const isPopular = !!plan.isPopular;
                  const displayPrice = isCommunity ? 0 : pricingView === 'yearly' ? Number((plan.price * 0.8).toFixed(2)) : plan.price;
                  return (
                    <div key={plan.id} className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all ${isPopular ? 'border-blue-300 ring-2 ring-blue-200 z-10' : 'border-gray-200'}`}>
                      <div className="h-1 w-full" style={{ backgroundColor: plan.color ?? '#3b82f6' }} />
                      <div className="p-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                          {plan.description && <p className="text-xs text-gray-500 mt-0.5 leading-snug max-w-xs">{plan.description}</p>}
                        </div>
                        {isPopular && <div className="flex-shrink-0 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full whitespace-nowrap">POPULAR</div>}
                        {isCommunity && <div className="flex-shrink-0 px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded-full whitespace-nowrap">FREE</div>}
                      </div>
                      <div className="px-4">
                        {isCommunity ? (
                          <><div className="text-4xl font-extrabold text-green-600">Free forever</div><p className="text-xs text-green-700 mt-1">Churches · Temples · Mosques · NGOs</p></>
                        ) : (
                          <div className="flex items-baseline gap-1"><span className="text-4xl font-extrabold text-gray-900">${displayPrice}</span><span className="text-sm text-gray-500">/ user / mo</span></div>
                        )}
                      </div>
                      <div className="px-4 mt-3 pb-4">
                        {isCommunity ? (
                          <div className="p-2 bg-green-50 rounded border border-green-100 text-xs text-green-700">No credit card required · Requires NPO verification</div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-600 font-medium">All 12 modules included</span>
                            {plan.price > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Light seats $1/mo</span>}
                          </div>
                        )}
                      </div>
                      {plan.features.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200">
                          <ul className="space-y-1.5">
                            {plan.features.slice(0, 5).map((f, i) => (
                              <li key={`${plan.id}-f-${i}`} className="flex items-start gap-2 text-xs text-gray-600">
                                <svg className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                {f}
                              </li>
                            ))}
                          </ul>
                          {plan.features.length > 5 && <p className="text-xs text-gray-400 mt-2">+ {plan.features.length - 5} more</p>}
                        </div>
                      )}
                      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50/70">{pricingView === 'yearly' ? 'Billed yearly · Save 20%' : 'Billed monthly'}</div>
                      <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                        <a href={isCommunity ? 'https://apps.azulobooks.com/#/register?plan=community' : 'https://apps.azulobooks.com/#/register'} target="_blank" rel="noopener noreferrer" className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center transition-colors ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {isCommunity ? 'Apply now' : 'Get started'}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', marginTop: 32 }}>All plans include support, hosting and maintenance · No hidden costs · Light seats at $1/mo</p>
            </>
          )}

          {/* ── Doc Convert plans ── */}
          {pricingProduct === 'docconvert' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <p style={{ color: '#6b7280', fontSize: 14 }}>Convert PDFs, Word and Excel files — no desktop software needed. Start free, upgrade when you need more.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 24, maxWidth: 860, margin: '0 auto' }}>

                {/* Free */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 4, background: '#e5e7eb' }} />
                  <div style={{ padding: '24px 24px 0' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Free</h3>
                    <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 16 }}>Try it out — no account needed</p>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>$0</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>forever free</div>
                  </div>
                  <div style={{ padding: '0 24px', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {['5 conversions per day','PDF, Word & Excel supported','Browser-based — nothing to install','Standard processing speed'].map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#374151' }}>
                          <svg width="14" height="14" style={{ marginTop: 1, flexShrink: 0 }} fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#f3f4f6"/><path d="M5 8l2 2 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '11px 0', fontSize: 13, fontWeight: 700, color: '#374151', background: '#f3f4f6', borderRadius: 10, textDecoration: 'none' }}>Try for free →</a>
                  </div>
                </div>

                {/* Pro */}
                <div style={{ background: '#fff', border: '2px solid #c4b5fd', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(124,58,237,0.12)', position: 'relative' }}>
                  <div style={{ height: 4, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }} />
                  <div style={{ position: 'absolute', top: 16, right: 16, background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 999, padding: '3px 10px' }}>POPULAR</div>
                  <div style={{ padding: '24px 24px 0' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Pro</h3>
                    <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 16 }}>For individuals and small teams</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: '#0f172a' }}>$3</span>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>/ month</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>billed monthly</div>
                  </div>
                  <div style={{ padding: '0 24px', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {['Unlimited conversions','AI-powered data extraction','Batch file processing','Priority processing speed','Email support'].map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#374151' }}>
                          <svg width="14" height="14" style={{ marginTop: 1, flexShrink: 0 }} fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#ede9fe"/><path d="M5 8l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '11px 0', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius: 10, textDecoration: 'none' }}>Get Pro →</a>
                  </div>
                </div>

                {/* Team */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 4, background: 'linear-gradient(90deg,#0891b2,#06b6d4)' }} />
                  <div style={{ padding: '24px 24px 0' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Team</h3>
                    <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 16 }}>Shared workspace for your whole team</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: '#0f172a' }}>$9</span>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>/ month</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>up to 5 seats</div>
                  </div>
                  <div style={{ padding: '0 24px', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {['Everything in Pro','5 team seats included','Shared conversion history','Admin dashboard','Priority support'].map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#374151' }}>
                          <svg width="14" height="14" style={{ marginTop: 1, flexShrink: 0 }} fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#e0f2fe"/><path d="M5 8l2 2 4-4" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '11px 0', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#0891b2,#06b6d4)', borderRadius: 10, textDecoration: 'none' }}>Get Team →</a>
                  </div>
                </div>

              </div>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', marginTop: 32 }}>No conversion limits on paid plans · Cancel anytime · Works in any browser</p>
            </>
          )}

        </div>
      </section>

      {/* Testimonials */}
      <section id="customers" style={{ padding: '80px 32px', background: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>From the people using it every day</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>Don't take our word for it</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #e0f2fe', boxShadow: '0 2px 16px rgba(6,182,212,0.07)' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>{[1,2,3,4,5].map(i => <Star key={i} />)}</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 20 }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.role}</div>
                    <div style={{ fontSize: 11, color: '#06b6d4', marginTop: 2 }}> {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0f172a', padding: '96px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,0.05) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Get started today</div>
          <h2 style={{ fontSize: 'clamp(2rem,4.5vw,3rem)', fontWeight: 900, color: '#f8fafc', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 18 }}>
            Your first invoice could be<br />10 minutes away.
          </h2>
          <p style={{ color: '#64748b', fontSize: 15.5, marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>
            Free to start, no credit card, cancel whenever. Most businesses send their first invoice the same day they sign up.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <a href="https://apps.azulobooks.com/#/register" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '15px 36px', fontSize: 14.5, fontWeight: 800, color: '#0f172a', background: '#22d3ee', borderRadius: 12, textDecoration: 'none', letterSpacing: '-0.01em' }}>Start AzuloBooks free</a>
              <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>ERP · Free 30-day trial · No credit card</p>
            </div>
            <div style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>or</div>
            <div style={{ textAlign: 'center' }}>
              <a href="https://converter.azulobooks.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '15px 36px', fontSize: 14.5, fontWeight: 800, color: '#fff', background: 'rgba(124,58,237,0.9)', borderRadius: 12, textDecoration: 'none', letterSpacing: '-0.01em' }}>Try Doc Convert free</a>
              <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>File converter · Free · Pro from $3/mo</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0c4a6e', padding: '48px 32px 24px', color: 'rgba(186,230,253,0.7)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 24 : 40, marginBottom: 36, paddingBottom: 36, borderBottom: '1px solid rgba(186,230,253,0.1)' }}>
            <div>
              <img src={azuloLogo} alt="AzuloBooks" style={{ height: 30, filter: 'brightness(0) invert(1)', marginBottom: 14, opacity: 0.9 }} />
              <p style={{ fontSize: 13, color: 'rgba(186,230,253,0.6)', lineHeight: 1.6, maxWidth: 240 }}>Complete business software for companies worldwide.</p>
              <p style={{ fontSize: 12, color: 'rgba(186,230,253,0.4)', marginTop: 10 }}> Built for businesses everywhere </p>
            </div>
            {[
              { label: 'Products', links: ['AzuloBooks','Azulo Doc Convert','Accounting','Payroll','Inventory'] },
              { label: 'Company', links: ['About','Blog','Careers','Contact'] },
              { label: 'Legal', links: ['Privacy','Terms','Security','Status'] },
            ].map(col => (
              <div key={col.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(186,230,253,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>{col.label}</div>
                {col.links.map(l => <div key={l} style={{ marginBottom: 9 }}><a href="#" style={{ fontSize: 13, color: 'rgba(186,230,253,0.6)', textDecoration: 'none' }}>{l}</a></div>)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'rgba(186,230,253,0.35)' }}>
            <span> {new Date().getFullYear()} AzuloBooks. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
