import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ArrowLeft, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyzePatientHealth, getRiskColor, getSeverityColor } from '../utils/healthRiskAI';

interface PatientDetailsProps {
  patient: any;
  onBack: () => void;
}

export function PatientDetails({ patient, onBack }: PatientDetailsProps) {
  // Prepare chart data from visit history
  const chartData = (patient.visits || []).map((visit: any, index: number) => ({
    visit: `Visit ${index + 1}`,
    bp: visit.vitals?.bp?.systolic ? parseInt(visit.vitals.bp.systolic) : null,
    bloodSugar: visit.vitals?.bloodSugar ? parseInt(visit.vitals.bloodSugar) : null,
    weight: visit.vitals?.weight ? parseFloat(visit.vitals.weight) : null,
  }));

  // AI Health Risk Analysis
  const healthRisk = analyzePatientHealth(patient);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* AI Health Risk Assessment */}
        <Card className="mb-4 border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              AI Health Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Overall Risk Level */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Overall Health Status:</span>
                <Badge className={`${getRiskColor(healthRisk.riskLevel)} text-white px-4 py-1 text-sm`}>
                  {healthRisk.riskLevel}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Risk Score:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getRiskColor(healthRisk.riskLevel)}`}
                    style={{ width: `${Math.min(healthRisk.overallScore * 10, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{healthRisk.overallScore}</span>
              </div>
            </div>

            {/* AI Explanation */}
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>AI Analysis</AlertTitle>
              <AlertDescription className="text-sm">
                {healthRisk.explanation}
              </AlertDescription>
            </Alert>

            {/* Risk Categories */}
            {healthRisk.riskCategories.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Identified Health Risk Categories
                </h4>
                <div className="space-y-3">
                  {healthRisk.riskCategories.map((category, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{category.category}</span>
                        <Badge className={`${getSeverityColor(category.severity)} border px-2 py-0.5 text-xs`} variant="outline">
                          {category.severity} Severity
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{category.explanation}</p>
                      {category.indicators.length > 0 && (
                        <ul className="text-xs text-gray-500 space-y-1">
                          {category.indicators.map((indicator, idx) => (
                            <li key={idx}>• {indicator}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {healthRisk.recommendations.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-800">📋 Recommended Actions</h4>
                <ul className="space-y-2">
                  {healthRisk.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-green-900">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety Disclaimer */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-xs text-gray-700">
                <strong>⚠️ Safety Notice:</strong> This AI assessment is for early awareness and screening purposes only. 
                It does NOT provide medical diagnosis, prescribe medicines, or replace professional medical consultation. 
                Always consult a qualified doctor for proper diagnosis and treatment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {patient.photoUrl ? (
                <img
                  src={patient.photoUrl}
                  alt={patient.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                  {patient.name.charAt(0)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div>{patient.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Aadhar Number</div>
                  <div>{patient.aadharNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div>{patient.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Gender</div>
                  <div>{patient.gender}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Blood Group</div>
                  <div>{patient.bloodGroup}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date of Birth</div>
                  <div>{patient.dateOfBirth}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-500">Address</div>
                  <div>{patient.address}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Trends */}
        {chartData.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Blood Pressure */}
                <div>
                  <h4 className="mb-2">Blood Pressure (Systolic)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="visit" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="bp" stroke="#ef4444" name="BP (mmHg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Blood Sugar */}
                <div>
                  <h4 className="mb-2">Blood Sugar</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="visit" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="bloodSugar" stroke="#3b82f6" name="Sugar (mg/dL)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Weight */}
                <div>
                  <h4 className="mb-2">Weight</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="visit" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="#10b981" name="Weight (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visit History */}
        <Card>
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.visits && patient.visits.length > 0 ? (
              <div className="space-y-4">
                {patient.visits.map((visit: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Visit Date: </span>
                      <span>{visit.dateOfVisit}</span>
                      <span className="text-sm text-gray-500 ml-4">Location: </span>
                      <span>{visit.location}</span>
                    </div>
                    
                    {visit.vitals && (
                      <div className="mb-2">
                        <div>
                          BP: {visit.vitals.bp?.systolic}/{visit.vitals.bp?.diastolic} mmHg
                          {visit.vitals.bloodSugar && ` | Sugar: ${visit.vitals.bloodSugar} mg/dL`}
                          {visit.vitals.weight && ` | Weight: ${visit.vitals.weight} kg`}
                          {visit.vitals.height && ` | Height: ${visit.vitals.height} cm`}
                        </div>
                      </div>
                    )}

                    {visit.screening && (
                      <div className="mb-2">
                        <div className="text-sm">
                          {visit.screening.oralCancer && '⚠️ Oral Cancer Signs Detected '}
                          {visit.screening.cervicalCancer && '⚠️ Cervical Cancer Signs Detected '}
                          {visit.screening.breastCancer && '⚠️ Breast Cancer Signs Detected '}
                          {visit.screening.communicableDisease && '⚠️ Communicable Disease Detected'}
                        </div>
                      </div>
                    )}

                    {visit.additionalComments && (
                      <div className="text-sm text-gray-600">
                        Comments: {visit.additionalComments}
                      </div>
                    )}

                    {visit.photos && visit.photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {visit.photos.map((photo: string, photoIndex: number) => (
                          <img
                            key={photoIndex}
                            src={photo}
                            alt={`Visit photo ${photoIndex + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No visit history available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}