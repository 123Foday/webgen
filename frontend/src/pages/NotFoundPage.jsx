import React from 'react'
import { notFoundPageStyles as s } from '../assets/dummyStyles';
import { Logo, PageBackdrop } from '../assets/ui';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className={s.container}>
      <PageBackdrop grid />

      <div className={s.logoWrapper}>
        <Logo />
      </div>

      <div className={s.content}>
        <p className={s.badge}>Error 404</p>
        <h1 className={s.number}>404</h1>
        <h2 className={s.title}> This page wandered off.</h2>
        <p className={s.description}>
          The page you're looking for doesn't exists - but we can build 
          something better.
        </p>

        <div className={s.buttonGroup}>
          <Link to="/" className={s.primaryButton}>
            <Home className={s.icon} /> Back Home
          </Link>

          <button 
            onClick={()=> window.history.back()} 
            className={s.secondaryButton}
          >
            <ArrowLeft className={s.icon} /> Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
