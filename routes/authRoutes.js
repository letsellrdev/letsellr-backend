// authRoutes.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/unauthorized',
    failureMessage: true,
  }),
  (req, res) => {
    // login succeeded
    // e.g. redirect to front-end with some token or data
    return res.redirect(`http://localhost:3000?user=${encodeURIComponent(req.user.email)}`);
  }
);

export default router;


