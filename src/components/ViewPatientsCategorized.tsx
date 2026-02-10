import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Search, Activity } from 'lucide-react';
import { UpdatePatient } from './UpdatePatient';
import { PatientDetails } from './PatientDetails';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { analyzePatientHealth, getRiskColor } from '../utils/healthRiskAI';

interface ViewPatientsCategorizedProps {
  user: { userId: string; name: string };
  onBack: () => void;
}

// Category-specific information
const categoryInfo = {
  pregnant: {
    title: 'Pregnant Women',
    emoji: '🤰',
    color: 'from-pink-50 to-rose-50',
    bgColor: 'bg-pink-50',
    benefits: [
      '✓ Free prenatal care and check-ups',
      '✓ Nutritional supplements (IFA tablets)',
      '✓ Free institutional delivery',
      '✓ Janani Suraksha Yojana cash benefits',
      '✓ Postnatal care for mother and child'
    ]
  },
  child: {
    title: 'Children',
    emoji: '👶',
    color: 'from-blue-50 to-cyan-50',
    bgColor: 'bg-blue-50',
    vaccines: [
      'BCG, OPV, Hepatitis B (at birth)',
      'DPT, Pentavalent, IPV (6, 10, 14 weeks)',
      'Measles & Rubella (9-12 months)',
      'DPT, OPV Booster (16-24 months)',
      'Vitamin A supplementation'
    ],
    benefits: [
      '✓ Free immunization',
      '✓ Nutritional supplements',
      '✓ Growth monitoring'
    ]
  },
  adult: {
    title: 'Adults',
    emoji: '👤',
    color: 'from-green-50 to-emerald-50',
    bgColor: 'bg-green-50',
    benefits: [
      '✓ Free health screening',
      '✓ Non-communicable disease screening',
      '✓ Free treatment at government hospitals',
      '✓ Ayushman Bharat health coverage (eligible families)',
      '✓ National TB Elimination Programme'
    ]
  },
  senior: {
    title: 'Senior Citizens',
    emoji: '👴',
    color: 'from-amber-50 to-orange-50',
    bgColor: 'bg-amber-50',
    benefits: [
      '✓ Free comprehensive health check-ups',
      '✓ Subsidized medicines and treatment',
      '✓ Ayushman Bharat coverage (up to ₹5 lakh)',
      '✓ National Programme for Health Care of Elderly',
      '✓ Priority treatment at government facilities',
      '✓ Pension schemes (eligible individuals)'
    ]
  }
};

export function ViewPatientsCategorized({ user, onBack }: ViewPatientsCategorizedProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [view, setView] = useState<'list' | 'update' | 'details'>('list');
  const [activeCategory, setActiveCategory] = useState('all');
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

  const getCategoryPatients = (category: string) => {
    let filtered = patients;
    if (category !== 'all') {
      filtered = patients.filter(p => p.category === category);
    }
    return filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.aadharNumber.includes(searchTerm) ||
        (p.familyId && p.familyId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

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

  const currentCategoryInfo = activeCategory !== 'all' ? categoryInfo[activeCategory as keyof typeof categoryInfo] : null;
  const bgGradient = currentCategoryInfo ? currentCategoryInfo.color : 'from-blue-50 to-green-50';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4`}>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Patient List by Category</CardTitle>
            <CardDescription>View patients organized by demographic categories</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, Aadhar, or Family ID"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pregnant">🤰 Pregnant</TabsTrigger>
                <TabsTrigger value="child">👶 Children</TabsTrigger>
                <TabsTrigger value="adult">👤 Adults</TabsTrigger>
                <TabsTrigger value="senior">👴 Seniors</TabsTrigger>
              </TabsList>

              {/* Category Information */}
              {currentCategoryInfo && (
                <Card className={`mt-4 ${currentCategoryInfo.bgColor}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{currentCategoryInfo.emoji}</span>
                      {currentCategoryInfo.title} - Government Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentCategoryInfo.vaccines && (
                      <div className="mb-3">
                        <p className="font-semibold mb-2">💉 Vaccination Schedule:</p>
                        <ul className="space-y-1 text-sm">
                          {currentCategoryInfo.vaccines.map((vaccine, i) => (
                            <li key={i} className="ml-4">• {vaccine}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold mb-2">🏥 Healthcare Benefits:</p>
                      <ul className="space-y-1 text-sm">
                        {currentCategoryInfo.benefits.map((benefit, i) => (
                          <li key={i} className="ml-4">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patient Lists for Each Category */}
              {['all', 'pregnant', 'child', 'adult', 'senior'].map((category) => (
                <TabsContent key={category} value={category}>
                  {loading ? (
                    <p className="text-center text-gray-500 py-8">Loading patients...</p>
                  ) : getCategoryPatients(category).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No patients found in this category</p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {getCategoryPatients(category).map((patient) => (
                        <div
                          key={patient.aadharNumber}
                          className="p-4 border rounded-lg hover:bg-white cursor-pointer transition-colors"
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
                              <div className="flex items-center gap-2 flex-wrap">
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
                                } | {patient.address}
                              </div>
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
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
