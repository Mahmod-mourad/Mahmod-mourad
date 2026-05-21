import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const profileRouter = Router();

profileRouter.get('/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.json({
    userId: req.user.userId,
    username: req.user.username,
    role: req.user.role,
    message: 'Profile retrieved successfully',
  });
});
