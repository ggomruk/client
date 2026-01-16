'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import LogoutButton from './LogoutButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/app', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/app/chart', label: 'Chart', icon: <ChartIcon /> },
    { href: '/app/optimizer', label: 'Optimizer', icon: <OptimizerIcon /> },
    { href: '/app/compare', label: 'Compare', icon: <CompareIcon /> },
    // { href: '/app/walkforward', label: 'Walk-Forward', icon: <WalkForwardIcon /> },
    { href: '/app/history', label: 'History', icon: <HistoryIcon /> },
    { href: '/app/onchain', label: 'Onchain', icon: <OnchainIcon /> },
  ];

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Left: Logo and App Name */}
        <div className={styles.leftSection}>
          <Link href="/app" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Image 
                src="/logo/logo_128_128.svg" 
                alt="Stratyix Logo" 
                width={42} 
                height={42}
              />
            </div>
            <span className={styles.logoText}>Stratyix</span>
          </Link>
        </div>

        {/* Center: Navigation Tabs */}
        <div className={styles.centerSection}>
          <div className={styles.desktopNav}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.href) && <div className={styles.activeIndicator} />}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: User Info and Logout */}
        <div className={styles.rightSection}>
          <div className={styles.userMenu}>
            {isAuthenticated && user && (
              <>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.username}>{user.username}</span>
                </div>
                <button onClick={logout} className={styles.logoutBtn}>
                  <LogoutIcon />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.mobileNavLinkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          {isAuthenticated && user && (
            <LogoutButton />
          )}
        </div>
      )}
    </nav>
  );
};

// Icons
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 3V17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 13L10 9L13 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OptimizerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 10L7 6L11 10L17 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 8V4H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CompareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 3L10 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const WalkForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 10H10M10 10L7 7M10 10L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 10H17M17 10L14 7M17 10L14 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const OnchainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 4H16V16H4V4Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 7H13V13H7V7Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M7 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13 13L18 10L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default Navbar;
