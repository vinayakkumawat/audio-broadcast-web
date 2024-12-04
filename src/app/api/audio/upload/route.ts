import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

declare global {
  var io: any;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const filename = `${uuidv4()}.webm`;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    // Create audio item
    const audioItem = {
      id: uuidv4(),
      userId: 'test-user',
      username: 'Test User',
      url: `/uploads/${filename}`,
      duration: 0,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Emit the new audio item to all connected clients
    if (global.io) {
      console.log('Emitting new audio to clients:', audioItem);
      global.io.emit('newAudio', audioItem);
    } else {
      console.warn('Socket.IO instance not found');
    }

    return NextResponse.json(audioItem);
  } catch (error) {
    console.error('Error uploading audio:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};