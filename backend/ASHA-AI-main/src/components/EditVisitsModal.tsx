import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EditVisitsProps {
  patient: any;
  onClose: () => void;
}

export function EditVisits({ patient, onClose }: EditVisitsProps) {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/rest/v1/patient_visits?patient_id=eq.${patient.patient_id}&order=visit_date.desc`,
        {
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await res.json();
      setVisits(data || []);
    } catch (e) {
      console.error('Failed to load visits', e);
    } finally {
      setLoading(false);
    }
  };

  const updateVisit = async (visit: any) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/rest/v1/patient_visits?id=eq.${visit.id}`,
        {
          method: 'PATCH',
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visit),
        }
      );
      alert('Visit updated successfully');
    } catch (e) {
      alert('Failed to update visit');
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading visits...</p>;
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Visits – {patient.name}</CardTitle>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {visits.length === 0 && (
            <p className="text-gray-500">No visits found</p>
          )}

          {visits.map((visit) => (
            <Card key={visit.id} className="p-4 border">
              <p className="text-sm text-gray-500 mb-2">
                Visit Date: {new Date(visit.visit_date).toLocaleDateString()}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={visit.systolic_bp || ''}
                  placeholder="Systolic BP"
                  onChange={(e) =>
                    setVisits((prev) =>
                      prev.map((v) =>
                        v.id === visit.id
                          ? { ...v, systolic_bp: e.target.value }
                          : v
                      )
                    )
                  }
                />
                <Input
                  value={visit.diastolic_bp || ''}
                  placeholder="Diastolic BP"
                  onChange={(e) =>
                    setVisits((prev) =>
                      prev.map((v) =>
                        v.id === visit.id
                          ? { ...v, diastolic_bp: e.target.value }
                          : v
                      )
                    )
                  }
                />
                <Input
                  value={visit.sugar || ''}
                  placeholder="Sugar"
                  onChange={(e) =>
                    setVisits((prev) =>
                      prev.map((v) =>
                        v.id === visit.id
                          ? { ...v, sugar: e.target.value }
                          : v
                      )
                    )
                  }
                />
                <Input
                  value={visit.heart_rate || ''}
                  placeholder="Heart Rate"
                  onChange={(e) =>
                    setVisits((prev) =>
                      prev.map((v) =>
                        v.id === visit.id
                          ? { ...v, heart_rate: e.target.value }
                          : v
                      )
                    )
                  }
                />
              </div>

              <Button
                className="mt-3"
                onClick={() => updateVisit(visit)}
              >
                Save Changes
              </Button>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
