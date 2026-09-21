import React from 'react'
import { authShellStyles as s } from '../assets/dummyStyles';
import { Logo, PageBackdrop } from '../assets/ui';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AuthShell = ({ title, subtitle, children, footer}) => {
  return (
    <div className={s.container}>
      <PageBackdrop grid />

      <header className={s.header}>
        <Logo />
        <Link to='/' className={s.backLink}>
          <ArrowRight className={s.backIcon} /> Back home
        </Link>
      </header>

      <main className={s.main}>
        <div className={s.inner}>
          <div className={s.card}>
            <h1 className={s.title}>{title}</h1>
            <p className={s.subtitle}>{subtitle}</p>
            {children}
          </div>
          {footer && <p className={s.footer}>{footer}</p>}
        </div>
      </main>
    </div>
  )
}

export default AuthShell
