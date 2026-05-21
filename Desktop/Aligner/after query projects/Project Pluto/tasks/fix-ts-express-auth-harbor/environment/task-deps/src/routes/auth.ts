import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../services/jwt';

export const authRouter = Router();

const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
  },
];

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const user = users.find((u) => u.username === username);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ error: message });
  }
});
