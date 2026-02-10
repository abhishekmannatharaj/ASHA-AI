import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SOSButtonProps {
  ashaId: string;
  ashaName: string;
}

export function SOSButton({ ashaId, ashaName }: SOSButtonProps) {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [emergency, setEmergency] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSOS = async () => {
    if (!patientName || !patientAddress || !emergency) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/create-sos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ashaId,
            ashaName,
            patientName,
            patientAddress,
            emergency,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Emergency SOS sent to admin successfully!');
        setShowSearchDialog(false);
        setPatientName('');
        setPatientAddress('');
        setEmergency('');
      } else {
        alert('Failed to send SOS');
      }
    } catch (error) {
      console.error('SOS error:', error);
      alert('Failed to send SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            Emergency SOS
          </CardTitle>
          <CardDescription>Send emergency alert to admin for immediate assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <AlertCircle className="w-4 h-4 mr-2" />
                Create Emergency SOS
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Emergency SOS</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to send an emergency SOS? This will immediately alert the admin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => setShowSearchDialog(true)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Patient Search Dialog */}
      {showSearchDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Emergency Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientAddress">Patient Address</Label>
                  <Input
                    id="patientAddress"
                    placeholder="Enter patient address"
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Details</Label>
                  <Input
                    id="emergency"
                    placeholder="Describe the emergency"
                    value={emergency}
                    onChange={(e) => setEmergency(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSearchDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCreateSOS}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send SOS'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
