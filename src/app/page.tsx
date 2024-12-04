'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, SkipForward } from 'lucide-react';
import type { AudioItem, QueueState } from '@/lib/types';
import { initSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export default function Home() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueState>({ items: [], currentlyPlaying: null });
  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('newAudio', (audio: AudioItem) => {
      console.log('New audio received:', audio);
      setQueue(prev => {
        const newQueue = {
          ...prev,
          items: [...prev.items, audio]
        };

        // If nothing is currently playing, start playing this audio
        if (!prev.currentlyPlaying) {
          newQueue.currentlyPlaying = audio;
          newQueue.items = prev.items;
          
          // Use setTimeout to ensure the audio element is ready
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = audio.url;
              audioRef.current.play().catch(console.error);
            }
          }, 0);
        }

        return newQueue;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const playNext = () => {
    if (queue.items.length > 0) {
      const nextItem = queue.items[0];
      const newQueue = {
        currentlyPlaying: nextItem,
        items: queue.items.slice(1)
      };
      setQueue(newQueue);
      
      if (audioRef.current) {
        audioRef.current.src = nextItem.url;
        audioRef.current.play().catch(console.error);
      }
    } else {
      setQueue({ items: [], currentlyPlaying: null });
    }
  };

  const handleAudioEnd = () => {
    playNext();
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Audio Speaker Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/test')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Test Audio Upload
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Audio Player */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Now Playing</h2>
          {queue.currentlyPlaying ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{queue.currentlyPlaying.username}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(queue.currentlyPlaying.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => audioRef.current?.play()}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Play className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => audioRef.current?.pause()}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Pause className="h-6 w-6" />
                  </button>
                  <button
                    onClick={playNext}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <SkipForward className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <audio
                ref={audioRef}
                onEnded={handleAudioEnd}
                controls
                className="w-full"
              />
            </div>
          ) : (
            <p className="text-gray-500">No audio playing</p>
          )}
        </div>

        {/* Queue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Queue</h2>
          {queue.items.length > 0 ? (
            <ul className="space-y-4">
              {queue.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Queue is empty</p>
          )}
        </div>
      </main>
    </div>
  );
}