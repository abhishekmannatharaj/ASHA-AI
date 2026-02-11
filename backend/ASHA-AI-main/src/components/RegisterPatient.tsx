import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Camera } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RegisterPatientProps {
  user: { userId: string; name: string };
  onBack: () => void;
}

export function RegisterPatient({ user, onBack }: RegisterPatientProps) {
  const [formData, setFormData] = useState({
    name: '',
    aadharNumber: '',
    phoneNumber: '',
    address: '',
    gender: '',
    bloodGroup: '',
    dateOfBirth: '',
    familyId: '',
    memberId: '',
    category: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify({
        ...formData,
        registeredBy: user.userId,
        area: 'Area 1', // Default area
      }));
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-13d5531e/register-patient`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Patient registered successfully!');
        onBack();
      } else {
        alert('Failed to register patient');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register patient');
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
            <CardTitle>Register New Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo */}
              <div className="space-y-2">
                <Label>Patient Photo</Label>
                <div className="flex flex-col items-center gap-4">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Patient" className="w-32 h-32 rounded-full object-cover" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Rajesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Aadhar Number */}
              <div className="space-y-2">
                <Label htmlFor="aadhar">Aadhar Number *</Label>
                <Input
                  id="aadhar"
                  placeholder="e.g., 1234 5678 9012"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Current Address *</Label>
                <Input
                  id="address"
                  placeholder="e.g., Village Rampur, District Varanasi"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group *</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              {/* Family ID */}
              <div className="space-y-2">
                <Label htmlFor="familyId">Family ID *</Label>
                <Input
                  id="familyId"
                  placeholder="e.g., FAM001 (Same for all family members)"
                  value={formData.familyId}
                  onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                  required
                />
              </div>

              {/* Member ID */}
              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID *</Label>
                <Input
                  id="memberId"
                  placeholder="e.g., 01, 02, 03 (Unique within family)"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500">Full ID will be: {formData.familyId || 'FAM???'}-{formData.memberId || '??'}</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Patient Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pregnant">🤰 Pregnant Woman</SelectItem>
                    <SelectItem value="child">👶 Child (0-17 years)</SelectItem>
                    <SelectItem value="adult">👤 Adult (18-59 years)</SelectItem>
                    <SelectItem value="senior">👴 Senior Citizen (60+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register Patient'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}