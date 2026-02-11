import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Trash2, ArrowUpDown, Activity } from 'lucide-react';
import { PatientDetails } from './PatientDetails';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { analyzePatientHealth, getRiskColor } from '../utils/healthRiskAI';

export function AllPatientsAdmin() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'familyId' | 'date'>('name');
  const [filterArea, setFilterArea] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/patients`,
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

  const handleDelete = async (aadharNumber: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete ${patientName}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/delete-patient`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ aadharNumber }),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Patient deleted successfully');
        loadPatients();
      } else {
        alert('Failed to delete patient');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete patient');
    }
  };

  // Filter and sort patients
  let filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.aadharNumber.includes(searchTerm) ||
      (p.familyId && p.familyId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.patientId && p.patientId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesArea = filterArea === 'all' || p.area === filterArea;
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    
    return matchesSearch && matchesArea && matchesCategory;
  });

  // Sort patients
  filteredPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'familyId') {
      const aFamily = a.familyId || '';
      const bFamily = b.familyId || '';
      if (aFamily === bFamily) {
        const aId = a.memberId || '999';
        const bId = b.memberId || '999';
        return aId.localeCompare(bId);
      }
      return aFamily.localeCompare(bFamily);
    } else {
      return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
    }
  });

  if (selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Patients Database</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, ID, family ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="familyId">Sort by Family ID</SelectItem>
              <SelectItem value="date">Sort by Registration Date</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              <SelectItem value="Area 1">Area 1 - Rampur Village</SelectItem>
              <SelectItem value="Area 2">Area 2 - Lakshmipur</SelectItem>
              <SelectItem value="Area 3">Area 3 - Ganesh Nagar</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pregnant">Pregnant Women</SelectItem>
              <SelectItem value="child">Children</SelectItem>
              <SelectItem value="adult">Adults</SelectItem>
              <SelectItem value="senior">Senior Citizens</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>

        {/* Patient List */}
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading patients...</p>
        ) : filteredPatients.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No patients found</p>
        ) : (
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <div
                key={patient.aadharNumber}
                className="p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-4"
              >
                {patient.photoUrl ? (
                  <img
                    src={patient.photoUrl}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
                    {patient.name.charAt(0)}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{patient.name}</span>
                    <Badge className={`${getRiskColor(analyzePatientHealth(patient).riskLevel)} text-white text-xs`}>
                      <Activity className="w-3 h-3 mr-1" />
                      {analyzePatientHealth(patient).riskLevel}
                    </Badge>
                    {patient.category && (
                      <Badge variant="outline" className="text-xs">
                        {patient.category === 'pregnant' && '🤰 Pregnant'}
                        {patient.category === 'child' && '👶 Child'}
                        {patient.category === 'adult' && '👤 Adult'}
                        {patient.category === 'senior' && '👴 Senior'}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {patient.familyId && patient.memberId 
                      ? `ID: ${patient.familyId}-${patient.memberId}`
                      : `Aadhar: ${patient.aadharNumber}`
                    } | {patient.area} | {patient.address}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(patient.aadharNumber, patient.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
