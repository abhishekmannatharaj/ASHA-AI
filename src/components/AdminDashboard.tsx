import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Users, AlertCircle, Bell } from 'lucide-react';
import { SOSManagement } from './SOSManagement';
import { PriorityPatients } from './PriorityPatients';
import { NotificationManager } from './NotificationManager';
import { AllPatientsAdmin } from './AllPatientsAdmin';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [selectedArea, setSelectedArea] = useState('Area 1');
  const [totalPatients, setTotalPatients] = useState(0);
  const [activeSOS, setActiveSOS] = useState(0);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [selectedArea]);

  const loadDashboardData = async () => {
    try {
      // Load patients
      const patientsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/patients`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const patientsData = await patientsResponse.json();
      if (patientsData.success) {
        const areaPatients = patientsData.patients.filter((p: any) => p.area === selectedArea);
        setTotalPatients(areaPatients.length);
      }

      // Load active SOS
      const sosResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/sos/active`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const sosData = await sosResponse.json();
      if (sosData.success) {
        setActiveSOS(sosData.sos.length);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl">Admin Dashboard</h1>
            <p className="text-gray-600">ASHA Karyakarta Management System</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Area Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Area</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Area 1">Area 1 - Rampur Village</SelectItem>
                <SelectItem value="Area 2">Area 2 - Lakshmipur</SelectItem>
                <SelectItem value="Area 3">Area 3 - Ganesh Nagar</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Total Patients
              </CardTitle>
              <CardDescription>in {selectedArea}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl">{totalPatients}</div>
            </CardContent>
          </Card>

          <Card className={activeSOS > 0 ? 'border-red-300 bg-red-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Active SOS Alerts
              </CardTitle>
              <CardDescription>Requires immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl ${activeSOS > 0 ? 'text-red-600' : ''}`}>
                {activeSOS}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sos">SOS Management</TabsTrigger>
            <TabsTrigger value="priority">Priority Patients</TabsTrigger>
            <TabsTrigger value="allpatients">All Patients</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="sos">
            <SOSManagement />
          </TabsContent>

          <TabsContent value="priority">
            <PriorityPatients area={selectedArea} />
          </TabsContent>

          <TabsContent value="allpatients">
            <AllPatientsAdmin />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}