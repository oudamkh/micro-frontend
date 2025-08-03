import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// Mock user database
const users = [
    {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: ['users.read', 'users.write', 'users.delete', 'dashboard.read', 'settings.write']
  },
  {
    id: '2', 
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
    permissions: ['users.read', 'dashboard.read']
  }
];

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        console.log('eeee: ', email, password);

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await new jose.SignJWT({
            userId: user.id,
            email: user.email,
            permissions: user.permissions
        })
            .setIssuedAt()
            .setExpirationTime('24h')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                permissions: user.permissions
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}