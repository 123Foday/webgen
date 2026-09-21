import React from 'react'
import { footerStyles as s } from '../assets/dummyStyles'
import { Logo } from '../assets/ui'
import { Link } from 'react-router-dom';

const links = [
  { label: "Features", to: "/#features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Community", to: "/community" },
];

const Footer = () => {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.brand}>
          <Logo />
          <p className={s.brandText}>
            Turn thoughts into websites instantly with AI
          </p>
        </div>

        <nav className={s.nav}>
          {links.map(((l)=> (
            <Link key={l.label} className={s.navLinks} to={l.to}>
              {l.label}
            </Link>
          )))}
        </nav>
      </div>

      <p className={s.copyright}>
        &copy; 2026 WebGen. All rights reserved.</p>
    </footer>
  )
}

export default Footer
