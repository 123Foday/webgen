import express from "express";
import { createSession, listHistory, listPackages, verifySession } from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/auth.js";

const paymentRouter = express.Router();

paymentRouter.get('/packages', listPackages);
paymentRouter.post('/create-checkout-session', requireAuth, createSession);

paymentRouter.post('/verify-session', requireAuth, verifySession);
paymentRouter.get('/history', requireAuth, listHistory);

export default paymentRouter;