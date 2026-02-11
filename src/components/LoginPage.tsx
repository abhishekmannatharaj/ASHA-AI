import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardHeader,
} from './ui/card';
import { Heart, Settings } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onLogin: (userData: { userId: string; role: string; name: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onLogin({ userId: data.userId, role: data.role, name: data.name });
      } else {
        setError('Invalid ASHA ID or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <Heart className="w-10 h-10 text-white" fill="white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-green-600">
          Smart <span className="text-blue-600">ASHA Connect</span>
        </h1>
        <p className="text-gray-600 mb-6">
          Healthcare Management for Rural India
        </p>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            {/* Login / Sign Up tabs (UI only) */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <button className="flex-1 bg-white rounded-full py-2 text-sm font-medium shadow">
                Login
              </button>
              {/* <button className="flex-1 text-sm text-gray-500">
                Sign Up
              </button> */}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <Label>ASHA ID / Admin</Label>
                <Input
                  type="text"
                  placeholder="Enter ASHA ID or admin"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1 ">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <div className="mt-15 text-sm text-gray-600">
          <p className="font-medium">Demo Accounts:</p>
          <p>ASHA: ASHA ID / 12345678]</p>
          <p>Admin: admin / admin</p>
        </div>

       
      </div>
    </div>
  );
}
