import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'MyJWTSecretkeyforthisapp');

export async function GET() {
    try {
        const token = (await cookies()).get('auth-token');

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        await jwtVerify(token.value, secret);
        return NextResponse.json({ authenticated: true });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}