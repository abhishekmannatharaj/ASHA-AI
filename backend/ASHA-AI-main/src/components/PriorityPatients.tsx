import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Calendar, Activity, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { analyzePatientHealth, getRiskColor, getSeverityColor } from '../utils/healthRiskAI';

interface PriorityPatientsProps {
  area: string;
}

export function PriorityPatients({ area }: PriorityPatientsProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointmentData, setAppointmentData] = useState({
    doctorName: '',
    doctorSpecialty: '',
    appointmentDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  // List of doctors with specializations and availability
  const doctors = [
    { name: 'Dr. Priya Sharma', specialty: 'General Practitioner', availability: 'green' },
    { name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', availability: 'green' },
    { name: 'Dr. Anjali Verma', specialty: 'Gynecologist', availability: 'yellow' },
    { name: 'Dr. Suresh Patel', specialty: 'Endocrinologist', availability: 'green' },
    { name: 'Dr. Meera Singh', specialty: 'Oncologist', availability: 'red' },
    { name: 'Dr. Arjun Reddy', specialty: 'Infectious Disease Specialist', availability: 'yellow' },
    { name: 'Dr. Kavita Desai', specialty: 'Dermatologist', availability: 'green' },
    { name: 'Dr. Vikram Gupta', specialty: 'Orthopedic', availability: 'green' },
    { name: 'Dr. Sneha Joshi', specialty: 'Pediatrician', availability: 'yellow' },
    { name: 'Dr. Amit Mehta', specialty: 'Neurologist', availability: 'red' },
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    loadPriorityPatients();
  }, [area]);

  const loadPriorityPatients = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/priority-patients/${area}`,
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
      console.error('Failed to load priority patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityLevel = (score: number) => {
    if (score >= 10) return { label: 'Critical', color: 'bg-red-500' };
    if (score >= 5) return { label: 'High', color: 'bg-orange-500' };
    if (score >= 1) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-green-500' };
  };

  const suggestDoctor = (patient: any) => {
    const lastVisit = patient.visits?.[patient.visits.length - 1];
    if (!lastVisit?.screening) return 'General Practitioner';

    if (lastVisit.screening.oralCancer) return 'Oncologist (Oral Cancer)';
    if (lastVisit.screening.cervicalCancer || lastVisit.screening.breastCancer) return 'Gynecologist/Oncologist';
    if (lastVisit.screening.communicableDisease) return 'Infectious Disease Specialist';
    if (lastVisit.vitals?.bloodSugar > 200) return 'Endocrinologist (Diabetes)';
    if (lastVisit.vitals?.bp?.systolic > 140) return 'Cardiologist (Hypertension)';
    
    return 'General Practitioner';
  };

  const handleBookAppointment = async () => {
    if (!selectedPatient || !appointmentData.doctorName || !appointmentData.appointmentDate) {
      alert('Please fill required fields');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/create-appointment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            patientName: selectedPatient.name,
            patientAadhar: selectedPatient.aadharNumber,
            ashaId: selectedPatient.registeredBy,
            ...appointmentData,
            reason: `Priority case - Severity: ${getSeverityLevel(selectedPatient.severityScore).label}`,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Appointment booked and assigned to ASHA worker!');
        setSelectedPatient(null);
        setAppointmentData({
          doctorName: '',
          doctorSpecialty: '',
          appointmentDate: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Failed to book appointment');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Priority Patient List
          </CardTitle>
          <CardDescription>Patients sorted by severity (Critical to Healthy)</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Filter */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, Aadhar, or Family ID"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading patients...</p>
          ) : patients.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.aadharNumber.includes(searchTerm) ||
              (p.familyId && p.familyId.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length === 0 ? (
            <p className="text-center text-gray-500">No patients found</p>
          ) : (
            <div className="space-y-3">
              {patients.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.aadharNumber.includes(searchTerm) ||
                (p.familyId && p.familyId.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((patient) => {
                const severity = getSeverityLevel(patient.severityScore);
                const lastVisit = patient.visits?.[patient.visits.length - 1];
                const suggestedDoctor = suggestDoctor(patient);

                // AI Health Risk Assessment
                const aiRisk = analyzePatientHealth(patient);

                return (
                  <div
                    key={patient.aadharNumber}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3>{patient.name}</h3>
                          <Badge className={`${severity.color} text-white`}>
                            {severity.label}
                          </Badge>
                          <Badge className={`${getRiskColor(aiRisk.riskLevel)} text-white`}>
                            <Activity className="w-3 h-3 mr-1" />
                            AI: {aiRisk.riskLevel}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} | Gender: {patient.gender}</div>
                          <div>Address: {patient.address}</div>
                          
                          {/* AI Risk Categories */}
                          {aiRisk.riskCategories.length > 0 && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-800">AI Detected Risks:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {aiRisk.riskCategories.map((category, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className={`${getSeverityColor(category.severity)} text-xs`}
                                  >
                                    {category.category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {lastVisit && (
                            <>
                              <div className="mt-2">
                                Last Visit: {lastVisit.dateOfVisit}
                              </div>
                              {lastVisit.vitals && (
                                <div>
                                  BP: {lastVisit.vitals.bp?.systolic}/{lastVisit.vitals.bp?.diastolic} mmHg
                                  {lastVisit.vitals.bloodSugar && ` | Sugar: ${lastVisit.vitals.bloodSugar} mg/dL`}
                                </div>
                              )}
                              {lastVisit.screening && (
                                <div className="text-red-600">
                                  {lastVisit.screening.oralCancer && '⚠️ Oral Cancer Signs '}
                                  {lastVisit.screening.cervicalCancer && '⚠️ Cervical Cancer Signs '}
                                  {lastVisit.screening.breastCancer && '⚠️ Breast Cancer Signs '}
                                  {lastVisit.screening.communicableDisease && '⚠️ Communicable Disease'}
                                </div>
                              )}
                            </>
                          )}
                          <div className="mt-2 text-blue-600">
                            Suggested: {suggestedDoctor}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setAppointmentData({
                            ...appointmentData,
                            doctorSpecialty: suggestedDoctor,
                          });
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Booking Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>
                Patient: {selectedPatient.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* AI Risk Summary */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">AI Health Assessment:</div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getRiskColor(analyzePatientHealth(selectedPatient).riskLevel)} text-white text-xs`}>
                        {analyzePatientHealth(selectedPatient).riskLevel}
                      </Badge>
                      {analyzePatientHealth(selectedPatient).riskCategories.length > 0 && (
                        <span className="text-xs">
                          {analyzePatientHealth(selectedPatient).riskCategories.map(c => c.category).join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs">{analyzePatientHealth(selectedPatient).explanation}</div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="doctorSpecialty">Specialty (Suggested)</Label>
                  <Input
                    id="doctorSpecialty"
                    value={appointmentData.doctorSpecialty}
                    onChange={(e) => setAppointmentData({ ...appointmentData, doctorSpecialty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Select Doctor *</Label>
                  <Select 
                    value={appointmentData.doctorName} 
                    onValueChange={(value) => {
                      const selectedDoctor = doctors.find(d => d.name === value);
                      setAppointmentData({ 
                        ...appointmentData, 
                        doctorName: value,
                        doctorSpecialty: selectedDoctor?.specialty || appointmentData.doctorSpecialty
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.name} value={doctor.name}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(doctor.availability)}`} />
                            <span>{doctor.name}</span>
                            <span className="text-sm text-gray-500">({doctor.specialty})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Appointment Date *</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={appointmentData.appointmentDate}
                    onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional instructions for ASHA"
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPatient(null);
                      setAppointmentData({
                        doctorName: '',
                        doctorSpecialty: '',
                        appointmentDate: '',
                        notes: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBookAppointment}
                  >
                    Book & Assign
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