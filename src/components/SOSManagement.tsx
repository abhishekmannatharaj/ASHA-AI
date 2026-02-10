import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Ambulance, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function SOSManagement() {
  const [sosList, setSosList] = useState<any[]>([]);
  const [selectedSOS, setSelectedSOS] = useState<any>(null);
  const [ambulance, setAmbulance] = useState('');
  const [doctor, setDoctor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSOS();
    const interval = setInterval(loadSOS, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSOS = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/sos/active`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSosList(data.sos);
      }
    } catch (error) {
      console.error('Failed to load SOS:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedSOS || !ambulance || !doctor) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/assign-sos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            sosId: selectedSOS.id,
            ambulance,
            doctor,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Ambulance and doctor assigned successfully!');
        setSelectedSOS(null);
        setAmbulance('');
        setDoctor('');
        loadSOS();
      }
    } catch (error) {
      console.error('Failed to assign:', error);
      alert('Failed to assign resources');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active SOS Alerts
          </CardTitle>
          <CardDescription>Emergency cases requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading SOS alerts...</p>
          ) : sosList.length === 0 ? (
            <p className="text-center text-gray-500">No active SOS alerts</p>
          ) : (
            <div className="space-y-4">
              {sosList.map((sos) => (
                <div
                  key={sos.id}
                  className={`p-4 border rounded-lg ${
                    sos.status === 'assigned' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">Emergency Alert</span>
                      </div>
                      <div>Patient: {sos.patientName}</div>
                      <div className="text-sm text-gray-600">Address: {sos.patientAddress}</div>
                      <div className="text-sm text-gray-600">Emergency: {sos.emergency}</div>
                      <div className="text-sm text-gray-600">
                        Reported by: {sos.ashaName} (ID: {sos.ashaId})
                      </div>
                      <div className="text-sm text-gray-500">
                        Time: {new Date(sos.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {sos.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedSOS(sos)}
                      >
                        Assign Resources
                      </Button>
                    ) : (
                      <div className="text-sm text-green-600">
                        <div>✓ Assigned</div>
                        <div>Ambulance: {sos.ambulance}</div>
                        <div>Doctor: {sos.doctor}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      {selectedSOS && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign Emergency Resources</CardTitle>
              <CardDescription>
                Patient: {selectedSOS.patientName} - {selectedSOS.emergency}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ambulance" className="flex items-center gap-2">
                    <Ambulance className="w-4 h-4" />
                    Ambulance
                  </Label>
                  <Input
                    id="ambulance"
                    placeholder="e.g., AMB-101 (Driver: Raju, Contact: 9876543210)"
                    value={ambulance}
                    onChange={(e) => setAmbulance(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Doctor
                  </Label>
                  <Input
                    id="doctor"
                    placeholder="e.g., Dr. Sharma (Emergency Medicine, Contact: 9876543211)"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedSOS(null);
                      setAmbulance('');
                      setDoctor('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleAssign}
                  >
                    Assign & Dispatch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
