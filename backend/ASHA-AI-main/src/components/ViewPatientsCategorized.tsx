import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ArrowLeft, Search, Activity } from 'lucide-react'

import { UpdatePatient } from './UpdatePatient'
import { PatientDetails } from './PatientDetails'
import { AshaChatbot } from './AshaChatbot'
import { EditVisits } from './EditVisits'

import { projectId, publicAnonKey } from '../utils/supabase/info'
import { analyzePatientHealth, getRiskColor } from '../utils/healthRiskAI'

interface ViewPatientsCategorizedProps {
  user: { userId: string; name: string }
  onBack: () => void
}

/* ---------------- CATEGORY INFO ---------------- */
const categoryInfo = {
  pregnant: { color: 'from-pink-50 to-rose-50' },
  child: { color: 'from-blue-50 to-cyan-50' },
  adult: { color: 'from-green-50 to-emerald-50' },
  senior: { color: 'from-amber-50 to-orange-50' },
}

export function ViewPatientsCategorized({
  user,
  onBack,
}: ViewPatientsCategorizedProps) {
  const [patients, setPatients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const [view, setView] = useState<'list' | 'update' | 'details'>('list')
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  /* 🧠 AskBot */
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatPatientId, setChatPatientId] = useState<string | null>(null)

  /* ✏️ Edit Visits */
  const [showEditVisits, setShowEditVisits] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/patients/Area 1`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      )
      const data = await res.json()
      if (data.success) setPatients(data.patients)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryPatients = (category: string) => {
    let list =
      category === 'all'
        ? patients
        : patients.filter((p) => p.category === category)

    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.aadharNumber.includes(searchTerm)
    )
  }

  /* -------- ROUTING -------- */
  if (view === 'update' && selectedPatient) {
    return (
      <UpdatePatient
        patient={selectedPatient}
        ashaId={user.userId}
        onBack={() => {
          setView('list')
          setSelectedPatient(null)
          loadPatients()
        }}
      />
    )
  }

  if (view === 'details' && selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        onBack={() => {
          setView('list')
          setSelectedPatient(null)
        }}
      />
    )
  }

  if (showEditVisits && selectedPatient) {
    return (
      <EditVisits
        patientId={selectedPatient.patient_id || selectedPatient.aadharNumber}
        onBack={() => {
          setShowEditVisits(false)
          setSelectedPatient(null)
        }}
      />
    )
  }

  const bgGradient =
    activeCategory !== 'all'
      ? categoryInfo[activeCategory as keyof typeof categoryInfo]?.color
      : 'from-blue-50 to-green-50'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4`}>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Patient List by Category</CardTitle>
            <CardDescription>
              View patients organized by demographic categories
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by name or Aadhar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pregnant">🤰</TabsTrigger>
                <TabsTrigger value="child">👶</TabsTrigger>
                <TabsTrigger value="adult">👤</TabsTrigger>
                <TabsTrigger value="senior">👴</TabsTrigger>
              </TabsList>

              {['all', 'pregnant', 'child', 'adult', 'senior'].map(
                (category) => (
                  <TabsContent key={category} value={category}>
                    {loading ? (
                      <p className="text-center py-6">Loading...</p>
                    ) : (
                      <div className="space-y-3 mt-4">
                        {getCategoryPatients(category).map((patient) => {
                          const risk =
                            analyzePatientHealth(patient).riskLevel

                          return (
                            <div
                              key={patient.aadharNumber}
                              className="p-4 border rounded-lg bg-white"
                            >
                              <div className="flex justify-between items-center gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {patient.name}
                                    </span>
                                    <Badge
                                      className={`${getRiskColor(
                                        risk
                                      )} text-white`}
                                    >
                                      <Activity className="w-3 h-3 mr-1" />
                                      {risk}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {patient.address}
                                  </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPatient(patient)
                                      setView('details')
                                    }}
                                  >
                                    Details
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPatient(patient)
                                      setView('update')
                                    }}
                                  >
                                    Update
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setChatPatientId(
                                        patient.patient_id ||
                                          patient.aadharNumber
                                      )
                                      setShowChatbot(true)
                                    }}
                                  >
                                    AskBot
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedPatient(patient)
                                      setShowEditVisits(true)
                                    }}
                                  >
                                    Edit Visits
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>
                )
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 🧠 AskBot */}
      {showChatbot && chatPatientId && (
        <AshaChatbot
          patientId={chatPatientId}
          onClose={() => setShowChatbot(false)}
        />
      )}
    </div>
  )
}
