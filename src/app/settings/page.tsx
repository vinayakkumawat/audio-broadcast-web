'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: newEmail || undefined,
          newPassword: newPassword || undefined,
          currentPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Update failed');
      }

      setSuccess('Credentials updated successfully! Please log in again.');
      setNewEmail('');
      setNewPassword('');
      setCurrentPassword('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <Settings className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Update Admin Credentials
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-500 p-4 rounded-md text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                New Email (optional)
              </label>
              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password (optional)
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password (required)
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Update Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}