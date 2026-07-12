'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import AiCopilot from '@/components/AiCopilot';
import { 
  LayoutDashboard, 
  Users2, 
  KeyRound, 
  FileLock2, 
  Activity, 
  HelpCircle, 
  Settings, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  Sparkles, 
  Building2,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check session
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
          
          // Load notifications summary
          const sumRes = await fetch('/api/dashboard/summary');
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            setNotifications(sumData.notifications || []);
            setUnreadNotifications(sumData.notifications?.filter((n: any) => !n.isRead).length || 0);
          }
        }
      } catch (err) {
        router.push('/login');
      }
    };
    fetchSession();
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/dashboard/portfolio', label: 'Portfolio Analytics', icon: <Users2 size={18} /> },
    { href: '/dashboard/vault', label: 'Secure Document Vault', icon: <FileLock2 size={18} /> },
    { href: '/dashboard/api-portal', label: 'API & Dev Portal', icon: <KeyRound size={18} /> },
    { href: '/dashboard/audit-logs', label: 'Audit & Activity Logs', icon: <Activity size={18} /> },
    { href: '/dashboard/support', label: 'Customer Support', icon: <HelpCircle size={18} /> },
    { href: '/dashboard/settings', label: 'Billing & Settings', icon: <Settings size={18} /> },
  ];

  if (!user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Drawer Overlay background */}
      {mobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(11, 31, 58, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 899,
          }}
        />
      )}

      {/* Mobile Drawer Navigation Sidebar */}
      <aside 
        className={`mobile-sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '270px',
          height: '100%',
          background: 'var(--card)',
          zIndex: 999,
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-normal)',
        }}
      >
        <div style={{
          height: '64px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-icon">P</div>
            <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>PROVENTA</span>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          margin: '1rem 1.25rem 0.25rem 1.25rem',
          padding: '0.75rem 1rem',
          background: 'rgba(var(--primary-rgb), 0.04)',
          border: '1px solid rgba(var(--primary-rgb), 0.1)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Building2 size={16} style={{ color: 'var(--primary)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Active Workspace</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.organization?.name || 'Default Org'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--background)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>
              Role: {user.role}
            </span>
          </div>
          <button 
            onClick={handleLogout} 
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="sidebar" style={{ display: 'flex', zIndex: 900 }}>
        {/* Sidebar Header */}
        <div style={{
          height: '64px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          gap: '0.75rem'
        }}>
          <div className="logo-icon">P</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>PROVENTA</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em' }}>CREDIT INTELLIGENCE</span>
          </div>
        </div>

        {/* Organization Switcher Banner */}
        <div style={{
          margin: '1rem 1.25rem 0.25rem 1.25rem',
          padding: '0.75rem 1rem',
          background: 'rgba(var(--primary-rgb), 0.04)',
          border: '1px solid rgba(var(--primary-rgb), 0.1)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Building2 size={16} style={{ color: 'var(--primary)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Active Workspace</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.organization?.name || 'Default Org'}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Profile */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--background)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>
              Role: {user.role}
            </span>
          </div>
          <button 
            onClick={handleLogout} 
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation Panel */}
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger button for mobile */}
            <button 
              className="mobile-nav-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--foreground)',
                padding: '0.45rem',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--muted)' }} className="header-greeting">
              Welcome back, <strong>{user.name.split(' ')[0]}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Theme switcher */}
            <button onClick={toggleTheme} className="theme-switch">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications icon */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    background: 'var(--danger)',
                    borderRadius: '50%'
                  }} />
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  width: '320px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '1rem',
                  zIndex: 1002
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Smart Notifications</span>
                    <button 
                      onClick={() => setUnreadNotifications(0)} 
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No recent events</span>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} style={{
                          padding: '0.6rem 0.8rem',
                          background: 'var(--background)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: `3px solid ${n.type === 'WARNING' ? 'var(--warning)' : n.type === 'SUCCESS' ? 'var(--success)' : 'var(--primary)'}`
                        }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)' }}>{n.title}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--muted)', marginTop: '0.15rem' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shield/SSO indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700
            }} className="desktop-only">
              <Sparkles size={12} />
              Zero Trust Protected
            </div>
          </div>
        </header>

        {/* Dashboard Slot Pages */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }} className="dashboard-main">
          {children}
        </main>
      </div>

      {/* Global AI Copilot Component */}
      <AiCopilot />
    </div>
  );
}
