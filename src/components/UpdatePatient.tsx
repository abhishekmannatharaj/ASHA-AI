import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Camera } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UpdatePatientProps {
  patient: any;
  ashaId: string;
  onBack: () => void;
}

export function UpdatePatient({ patient, ashaId, onBack }: UpdatePatientProps) {
  const [visitData, setVisitData] = useState({
    dateOfVisit: new Date().toISOString().split('T')[0],
    location: '',
  });

  const [vitals, setVitals] = useState({
    bp: { systolic: '', diastolic: '' },
    bloodSugar: '',
    weight: '',
    height: '',
  });

  const [pregnancy, setPregnancy] = useState({
    isPregnant: false,
    weeks: '',
    complications: '',
  });

  const [screening, setScreening] = useState({
    oralCancer: false,
    oralCancerComments: '',
    cervicalCancer: false,
    cervicalCancerComments: '',
    breastCancer: false,
    breastCancerComments: '',
    communicableDisease: false,
    communicableDiseaseComments: '',
    generalCheck: '',
  });

  const [additionalComments, setAdditionalComments] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        aadharNumber: patient.aadharNumber,
        ashaId,
        ...visitData,
        vitals,
        pregnancy: patient.gender === 'Female' ? pregnancy : undefined,
        screening,
        additionalComments,
      }));

      photos.forEach((photo, index) => {
        formData.append(`photo${index}`, photo);
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/update-visit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Patient visit updated successfully!');
        onBack();
      } else {
        alert('Failed to update visit');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Update Patient Visit - {patient.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Visit Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Visit Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date of Visit</Label>
                    <Input
                      id="date"
                      type="date"
                      value={visitData.dateOfVisit}
                      onChange={(e) => setVisitData({ ...visitData, dateOfVisit: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Patient's home"
                      value={visitData.location}
                      onChange={(e) => setVisitData({ ...visitData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="space-y-4">
                <h3 className="font-semibold">Vitals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Blood Pressure (mmHg)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Systolic"
                        value={vitals.bp.systolic}
                        onChange={(e) => setVitals({ ...vitals, bp: { ...vitals.bp, systolic: e.target.value } })}
                      />
                      <span className="self-center">/</span>
                      <Input
                        placeholder="Diastolic"
                        value={vitals.bp.diastolic}
                        onChange={(e) => setVitals({ ...vitals, bp: { ...vitals.bp, diastolic: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodSugar">Blood Sugar (mg/dL)</Label>
                    <Input
                      id="bloodSugar"
                      placeholder="e.g., 120"
                      value={vitals.bloodSugar}
                      onChange={(e) => setVitals({ ...vitals, bloodSugar: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      placeholder="e.g., 65"
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      placeholder="e.g., 165"
                      value={vitals.height}
                      onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Pregnancy (if female) */}
              {patient.gender === 'Female' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Pregnancy Information</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pregnant"
                      checked={pregnancy.isPregnant}
                      onCheckedChange={(checked) =>
                        setPregnancy({ ...pregnancy, isPregnant: checked as boolean })
                      }
                    />
                    <Label htmlFor="pregnant">Patient is pregnant</Label>
                  </div>
                  {pregnancy.isPregnant && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weeks">Weeks</Label>
                        <Input
                          id="weeks"
                          placeholder="e.g., 12"
                          value={pregnancy.weeks}
                          onChange={(e) => setPregnancy({ ...pregnancy, weeks: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complications">Complications</Label>
                        <Input
                          id="complications"
                          placeholder="Any complications"
                          value={pregnancy.complications}
                          onChange={(e) => setPregnancy({ ...pregnancy, complications: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Screening */}
              <div className="space-y-4">
                <h3 className="font-semibold">Health Screening</h3>
                
                {/* Oral Cancer */}
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="oralCancer"
                      checked={screening.oralCancer}
                      onCheckedChange={(checked) =>
                        setScreening({ ...screening, oralCancer: checked as boolean })
                      }
                    />
                    <Label htmlFor="oralCancer">Oral Cancer Signs Detected</Label>
                  </div>
                  <Textarea
                    placeholder="Comments (if any)"
                    value={screening.oralCancerComments}
                    onChange={(e) => setScreening({ ...screening, oralCancerComments: e.target.value })}
                  />
                </div>

                {/* Cervical Cancer */}
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cervicalCancer"
                      checked={screening.cervicalCancer}
                      onCheckedChange={(checked) =>
                        setScreening({ ...screening, cervicalCancer: checked as boolean })
                      }
                    />
                    <Label htmlFor="cervicalCancer">Cervical Cancer Signs Detected</Label>
                  </div>
                  <Textarea
                    placeholder="Comments (if any)"
                    value={screening.cervicalCancerComments}
                    onChange={(e) => setScreening({ ...screening, cervicalCancerComments: e.target.value })}
                  />
                </div>

                {/* Breast Cancer */}
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breastCancer"
                      checked={screening.breastCancer}
                      onCheckedChange={(checked) =>
                        setScreening({ ...screening, breastCancer: checked as boolean })
                      }
                    />
                    <Label htmlFor="breastCancer">Breast Cancer Signs Detected</Label>
                  </div>
                  <Textarea
                    placeholder="Comments (if any)"
                    value={screening.breastCancerComments}
                    onChange={(e) => setScreening({ ...screening, breastCancerComments: e.target.value })}
                  />
                </div>

                {/* Communicable Disease */}
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="communicableDisease"
                      checked={screening.communicableDisease}
                      onCheckedChange={(checked) =>
                        setScreening({ ...screening, communicableDisease: checked as boolean })
                      }
                    />
                    <Label htmlFor="communicableDisease">Communicable Disease Detected</Label>
                  </div>
                  <Textarea
                    placeholder="Comments (if any)"
                    value={screening.communicableDiseaseComments}
                    onChange={(e) => setScreening({ ...screening, communicableDiseaseComments: e.target.value })}
                  />
                </div>

                {/* General Check */}
                <div className="space-y-2">
                  <Label htmlFor="generalCheck">General Check (Eyes, Skin, etc.)</Label>
                  <Textarea
                    id="generalCheck"
                    placeholder="Notes on eyes, skin, and general health"
                    value={screening.generalCheck}
                    onChange={(e) => setScreening({ ...screening, generalCheck: e.target.value })}
                  />
                </div>
              </div>

              {/* Additional Comments */}
              <div className="space-y-2">
                <Label htmlFor="additionalComments">Additional Comments & Observations</Label>
                <Textarea
                  id="additionalComments"
                  placeholder="e.g., Varicose veins observed, skin rashes, etc."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                />
              </div>

              {/* Photo Attachments */}
              <div className="space-y-2">
                <Label>Photo Attachments</Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoCapture}
                />
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {photoPreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Submit Visit Update'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
