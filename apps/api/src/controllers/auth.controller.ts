import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from 'database';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['STUDENT', 'ADMIN']).optional(),
  adminKey: z.string().optional()
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = registerSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ error: 'Invalid input', details: parsedData.error.issues });
      return;
    }
    
    const { email, password, firstName, lastName, role, adminKey } = parsedData.data;

    // Security check for Admin registration
    if (role === 'ADMIN') {
      const EXPECTED_ADMIN_KEY = process.env.ADMIN_SETUP_KEY || "NEXUS-ADMIN-2026";
      if (adminKey !== EXPECTED_ADMIN_KEY) {
        res.status(403).json({ error: 'Forbidden: Invalid Admin Security Key' });
        return;
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'STUDENT',
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ error: 'Invalid input', details: parsedData.error.issues });
      return;
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
