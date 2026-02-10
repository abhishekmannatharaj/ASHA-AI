import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AppointmentsProps {
  user: { userId: string; name: string };
  onBack: () => void;
}

export function Appointments({ user, onBack }: AppointmentsProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/appointments/${user.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/complete-appointment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ appointmentId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        loadAppointments();
        alert('Appointment marked as completed!');
      }
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="text-center text-gray-500">No appointments scheduled</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 border rounded-lg ${
                      appointment.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3>{appointment.patientName}</h3>
                          {appointment.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Doctor: {appointment.doctorName}</div>
                          <div>Specialty: {appointment.doctorSpecialty}</div>
                          <div>Appointment Date: {appointment.appointmentDate}</div>
                          <div>Reason: {appointment.reason}</div>
                          {appointment.notes && <div>Notes: {appointment.notes}</div>}
                        </div>
                      </div>
                      {appointment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleComplete(appointment.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
