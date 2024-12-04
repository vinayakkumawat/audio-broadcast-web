import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { validateCredentials } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { newEmail, newPassword, currentPassword } = await request.json();

        // Verify current password
        const isValid = await validateCredentials('admin@example.com', currentPassword);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        const csvPath = path.join(process.cwd(), 'data', 'database.csv');
        const fileContent = await fs.readFile(csvPath, 'utf-8');
        const [header, currentLine] = fileContent.split('\n');
        const [currentEmail, currentHashedPassword] = currentLine.split(',');

        // Prepare new credentials
        const newHashedPassword = newPassword ? bcrypt.hashSync(newPassword, 10) : currentHashedPassword;
        const updatedEmail = newEmail || currentEmail;

        // Update CSV file
        const updatedContent = `${header}\n${updatedEmail},${newHashedPassword}`;
        await fs.writeFile(csvPath, updatedContent, 'utf-8');

        // Clear authentication token to force re-login
        (await
            // Clear authentication token to force re-login
            cookies()).delete('auth-token');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating credentials:', error);
        return NextResponse.json(
            { error: 'Failed to update credentials' },
            { status: 500 }
        );
    }
}