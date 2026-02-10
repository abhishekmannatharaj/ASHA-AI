import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Search, Activity } from 'lucide-react';
import { UpdatePatient } from './UpdatePatient';
import { PatientDetails } from './PatientDetails';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { analyzePatientHealth, getRiskColor } from '../utils/healthRiskAI';

interface ViewPatientsProps {
  user: { userId: string; name: string };
  onBack: () => void;
}

export function ViewPatients({ user, onBack }: ViewPatientsProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [view, setView] = useState<'list' | 'update' | 'details'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/patients/Area 1`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.aadharNumber.includes(searchTerm)
  );

  if (view === 'update' && selectedPatient) {
    return (
      <UpdatePatient
        patient={selectedPatient}
        ashaId={user.userId}
        onBack={() => {
          setView('list');
          setSelectedPatient(null);
          loadPatients();
        }}
      />
    );
  }

  if (view === 'details' && selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        onBack={() => {
          setView('list');
          setSelectedPatient(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or Aadhar number"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Patient List */}
            {loading ? (
              <p className="text-center text-gray-500">Loading patients...</p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-center text-gray-500">No patients found</p>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.aadharNumber}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {patient.photoUrl ? (
                        <img
                          src={patient.photoUrl}
                          alt={patient.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          {patient.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{patient.name}</span>
                          <Badge className={`${getRiskColor(analyzePatientHealth(patient).riskLevel)} text-white text-xs`}>
                            <Activity className="w-3 h-3 mr-1" />
                            {analyzePatientHealth(patient).riskLevel}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">{patient.address}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setView('details');
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setView('update');
                          }}
                        >
                          Update
                        </Button>
                      </div>
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