import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UserPlus, Users, AlertCircle, Calendar, LogOut, MessageCircle, Bell } from 'lucide-react';
import { RegisterPatient } from './RegisterPatient';
import { ViewPatientsCategorized } from './ViewPatientsCategorized';
import { SOSButton } from './SOSButton';
import { Appointments } from './Appointments';
import { AshaChatbot } from './AshaChatbot';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AshaConnectProps {
  user: { userId: string; role: string; name: string };
  onLogout: () => void;
}

export function AshaConnect({ user, onLogout }: AshaConnectProps) {
  const [activeView, setActiveView] = useState<'home' | 'register' | 'viewPatients' | 'appointments'>('home');
  const [stats, setStats] = useState({ visits: 0, newRegistrations: 0, followUps: 0 });
  const [showChatbot, setShowChatbot] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/stats/${user.userId}/${today}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  if (activeView === 'register') {
    return <RegisterPatient user={user} onBack={() => { setActiveView('home'); loadStats(); }} />;
  }

  if (activeView === 'viewPatients') {
    return <ViewPatientsCategorized user={user} onBack={() => { setActiveView('home'); loadStats(); }} />;
  }

  if (activeView === 'appointments') {
    return <Appointments user={user} onBack={() => setActiveView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl">Smart ASHA Connect</h1>
            <p className="text-gray-600">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('register')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Register Patient
              </CardTitle>
              <CardDescription>Add new patient to the system</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('viewPatients')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                View Patient List
              </CardTitle>
              <CardDescription>Search and manage patient records</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Today's Review */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl">{stats.visits}</div>
                <div className="text-sm text-gray-600">Visits</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl">{stats.newRegistrations}</div>
                <div className="text-sm text-gray-600">New Registrations</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl">{stats.followUps}</div>
                <div className="text-sm text-gray-600">Follow-ups</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('appointments')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointments
            </CardTitle>
            <CardDescription>View and manage patient appointments</CardDescription>
          </CardHeader>
        </Card>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Bell className="w-5 h-5" />
                Notifications & Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-white rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start gap-2">
                      <Bell className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency SOS */}
        <SOSButton ashaId={user.userId} ashaName={user.name} />
      </div>

      {/* Floating Chatbot Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chatbot */}
      {showChatbot && <AshaChatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
}