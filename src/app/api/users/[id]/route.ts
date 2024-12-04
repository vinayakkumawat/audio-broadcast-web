import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.csv');

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }
) {
  try {
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => !line.startsWith(params.id + ','));
    await fs.writeFile(USERS_FILE, filteredLines.join('\n'));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}