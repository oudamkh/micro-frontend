import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request: NextRequest) {
    try {
        const authorization = request.headers.get('authorization');

        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authorization.split(' ')[1];
        const { payload } = await jose.jwtVerify(token, secret);

        return NextResponse.json({
            id: payload.userId,
            email: payload.email,
            permissions: payload.permissions
        });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}