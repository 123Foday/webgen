import { Router } from "express";
import { User } from "../models/User.js";
import { generateOtp, peekOtp, saveOtp, sendOtpEmail, verifyOtp } from "../utils/services.js";

const router = Router();

// to forgot password
router.post('/request', async (req, res, next)=> {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if(!email) return res.status(400).json({
      error: "Email is required."
    });

    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ error: "No account found with that email." });

    const code = generateOtp();
    saveOtp(email, code);
    await sendOtpEmail({ to: user.email, name: user.name, code });

    res.json({ ok: true, email: user.email });
  } 
  catch (err) {
    next();
  }
});

// step 2 to verify the code
router.post('/verify-code', async (req, res, next)=> {
  try {
    const { email, code } = req.body;
    if(!email || !code)
      return res.status(400).json({ error: "Email and code are required." });

    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ error: "No account found with this email." });

    const result = peekOtp(email, code);
    if(!result.ok) return res.status(400).json({ error: result.reason });
    res.json({ ok: true });
  } 

  catch (err) {
    next(err);
  }
});

// step 3 to change the password
router.post('/reset', async (req, res, next)=> {
  try {
    const { email, code, newPassword } = req.body;
    if(!email || !code) 
      return res.status(400).json({ error: "Email and code are required." });

    if(newPassword.length < 6)
      return res.status(400).json({ error: "New Password must be at least 6 characters." });
    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ error: "No account found with that email." });

    const result = verifyOtp(email, code);
    if(!result.ok) return res.status(400).json({ error: result.reason });

    user.passwordHash = await User.hashPassword(newPassword);
    if(!user.emailVerified) user.emailVerified = true;
    await user.save();
    res.json({ ok: true });

  } 
  catch (err) {
    next(err);
  }
});

export default router;