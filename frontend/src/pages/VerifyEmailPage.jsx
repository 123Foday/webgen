import React, { useEffect, useRef, useState } from 'react'
import { verifyEmailPageStyles as s } from '../assets/dummyStyles';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiError, registerResend, registerVerify } from '../utils/api';
import AuthShell from '../components/AuthShell';
import { CheckCircle2, Mail } from 'lucide-react';
import { Input } from '../assets/ui';

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = (params.get("email") || "").toLowerCase();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS); // 60 sec
  const otpRef = useRef(null);

  useEffect(() => {
    otpRef.current?.focus();
  }, []);

  // it will decrease the cooldown timer by -1 sec
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // validate the code and take us to the login page
  async function handleVerify(e) {
    e?.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await registerVerify(email, otp);
      setVerified(true);
      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email)}&verified=1`, {
          replace: true,
        });
      }, 1400);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  // to resend the otp
  async function handleResend() {
    if (cooldown > 0) return;
    setError("");
    setResending(true);
    try {
      await registerResend(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <AuthShell title="Verified" subtitle="">
        <div className={s.verifiedContainer}>
          <div className={s.verifiedIconWrapper}>
            <CheckCircle2 className={s.verifiedIcon} />
          </div>
          <p className={s.verifiedTitle}>Email verified</p>
          <p className={s.verifiedSub}>Taking you to the sign-in page...</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell 
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digits code to{" "}<span className='text-white font-medium'>{email}</span>. Enter it
          below to finish creating your account.
        </>
      }
      footer={
        <>
          Wrong email?{" "}
          <Link to='/register' className={s.signUpLink}>
            Sign up again
          </Link>
        </>
      }
    >

      <form onSubmit={handleVerify} className={s.form}>
        <Input 
          ref={otpRef} 
          label="Verification code" 
          name="otp" 
          value={otp}
          onChange={(e)=> {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(v);
            setError("")
          }} 
          placeholder='123456' 
          inputMode="numeric" 
          autoComplete="one-time-code"
          maxLength={6} 
          error={error} 
          className={s.otpInput}
        />

        <button 
          type='submit'
          className={s.submitButton}
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>

        <div className={s.resendRow}>
          <span className={s.resendLeft}>
            <Mail className={s.resendIcon} /> Didn't get it?
          </span>
          <button 
            type='button' 
            onClick={handleResend} 
            disabled={resending || cooldown > 0}
            className={s.resendButton}
            >
              {resending 
                ? "Sending..." 
                : cooldown > 0 
                  ? `Resend in ${cooldown}s`
                  : "Resend code"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
};

export default VerifyEmailPage
