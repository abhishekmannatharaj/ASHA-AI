import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, Save } from 'lucide-react'

import {
  getPatientVisits,
  updatePatientVisit,
} from '../utils/supabase/visits'

interface EditVisitsProps {
  patientId: string
  onBack: () => void
}

export function EditVisits({ patientId, onBack }: EditVisitsProps) {
  const [visits, setVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVisits()
  }, [])

  const loadVisits = async () => {
    try {
      const data = await getPatientVisits(patientId)
      setVisits(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...visits]
    updated[index] = { ...updated[index], [field]: value }
    setVisits(updated)
  }

  const handleSave = async (visitId: string, visitData: any) => {
    try {
      await updatePatientVisit(visitId, visitData)
      alert('Visit updated successfully')
    } catch (e) {
      console.error(e)
      alert('Failed to update visit')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Patient Visits</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p>Loading visits...</p>
            ) : visits.length === 0 ? (
              <p>No visits found</p>
            ) : (
              <div className="space-y-4">
                {visits.map((visit, index) => (
                  <Card key={visit.id} className="border">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Visit Date: {visit.visit_date}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Systolic BP"
                        value={visit.systolic_bp || ''}
                        onChange={(e) =>
                          handleChange(index, 'systolic_bp', e.target.value)
                        }
                      />

                      <Input
                        placeholder="Diastolic BP"
                        value={visit.diastolic_bp || ''}
                        onChange={(e) =>
                          handleChange(index, 'diastolic_bp', e.target.value)
                        }
                      />

                      <Input
                        placeholder="Blood Sugar"
                        value={visit.sugar || ''}
                        onChange={(e) =>
                          handleChange(index, 'sugar', e.target.value)
                        }
                      />

                      <Input
                        placeholder="Weight (kg)"
                        value={visit.weight || ''}
                        onChange={(e) =>
                          handleChange(index, 'weight', e.target.value)
                        }
                      />

                      <Input
                        placeholder="Height (cm)"
                        value={visit.height || ''}
                        onChange={(e) =>
                          handleChange(index, 'height', e.target.value)
                        }
                      />

                      <Input
                        placeholder="Notes"
                        value={visit.notes || ''}
                        onChange={(e) =>
                          handleChange(index, 'notes', e.target.value)
                        }
                      />

                      <div className="col-span-2">
                        <Button
                          onClick={() => handleSave(visit.id, visit)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Visit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
