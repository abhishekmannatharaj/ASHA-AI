/**
 * AI-Based Health Risk Assessment System
 * 
 * This system analyzes patient health data to identify possible medical problems
 * and early health risks. It is designed for AWARENESS and EARLY DETECTION only.
 * 
 * ⚠️ IMPORTANT SAFETY DISCLAIMER:
 * This AI does NOT provide medical diagnosis, prescribe medicines, or replace doctors.
 * All predictions are risk assessments for early awareness only.
 */

export interface HealthRiskAssessment {
  riskLevel: 'Normal' | 'At Risk' | 'High Risk';
  riskCategories: RiskCategory[];
  overallScore: number;
  explanation: string;
  recommendations: string[];
  lastAnalyzed: string;
}

export interface RiskCategory {
  category: 'Diabetic Risk' | 'Cardiac Risk' | 'Maternal Risk' | 'Infection Risk' | 'Cancer Risk' | 'Obesity Risk' | 'Malnutrition Risk';
  severity: 'Low' | 'Medium' | 'High';
  score: number;
  explanation: string;
  indicators: string[];
}

/**
 * Main AI function to analyze patient health data
 */
export function analyzePatientHealth(patient: any): HealthRiskAssessment {
  const riskCategories: RiskCategory[] = [];
  let totalScore = 0;
  
  // Get latest visit data
  const latestVisit = patient.visits && patient.visits.length > 0 
    ? patient.visits[patient.visits.length - 1] 
    : null;
  
  // Analyze each health aspect
  const diabeticRisk = analyzeDiabeticRisk(patient, latestVisit);
  if (diabeticRisk.score > 0) {
    riskCategories.push(diabeticRisk);
    totalScore += diabeticRisk.score;
  }
  
  const cardiacRisk = analyzeCardiacRisk(patient, latestVisit);
  if (cardiacRisk.score > 0) {
    riskCategories.push(cardiacRisk);
    totalScore += cardiacRisk.score;
  }
  
  const cancerRisk = analyzeCancerRisk(patient, latestVisit);
  if (cancerRisk.score > 0) {
    riskCategories.push(cancerRisk);
    totalScore += cancerRisk.score;
  }
  
  const infectionRisk = analyzeInfectionRisk(patient, latestVisit);
  if (infectionRisk.score > 0) {
    riskCategories.push(infectionRisk);
    totalScore += infectionRisk.score;
  }
  
  const maternalRisk = analyzeMaternalRisk(patient, latestVisit);
  if (maternalRisk && maternalRisk.score > 0) {
    riskCategories.push(maternalRisk);
    totalScore += maternalRisk.score;
  }
  
  const bmiRisk = analyzeBMIRisk(patient, latestVisit);
  if (bmiRisk && bmiRisk.score > 0) {
    riskCategories.push(bmiRisk);
    totalScore += bmiRisk.score;
  }
  
  // Determine overall risk level
  const riskLevel = determineRiskLevel(totalScore);
  
  // Generate explanation and recommendations
  const explanation = generateExplanation(riskLevel, riskCategories);
  const recommendations = generateRecommendations(riskCategories);
  
  return {
    riskLevel,
    riskCategories,
    overallScore: totalScore,
    explanation,
    recommendations,
    lastAnalyzed: new Date().toISOString()
  };
}

/**
 * Analyze diabetic risk based on blood sugar levels and trends
 */
function analyzeDiabeticRisk(patient: any, latestVisit: any): RiskCategory {
  let score = 0;
  const indicators: string[] = [];
  let severity: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (!latestVisit?.vitals?.bloodSugar) {
    return { category: 'Diabetic Risk', severity: 'Low', score: 0, explanation: '', indicators: [] };
  }
  
  const bloodSugar = parseInt(latestVisit.vitals.bloodSugar);
  
  // Analyze current blood sugar level
  if (bloodSugar >= 200) {
    score += 8;
    severity = 'High';
    indicators.push(`Very high blood sugar: ${bloodSugar} mg/dL (normal: 70-140)`);
  } else if (bloodSugar >= 140) {
    score += 5;
    severity = 'Medium';
    indicators.push(`Elevated blood sugar: ${bloodSugar} mg/dL (normal: 70-140)`);
  } else if (bloodSugar >= 100) {
    score += 2;
    severity = 'Low';
    indicators.push(`Slightly elevated blood sugar: ${bloodSugar} mg/dL`);
  }
  
  // Analyze trends if multiple visits
  if (patient.visits && patient.visits.length >= 2) {
    const sugarTrend = analyzeBloodSugarTrend(patient.visits);
    if (sugarTrend.increasing) {
      score += 2;
      indicators.push(`Blood sugar showing upward trend over ${patient.visits.length} visits`);
    }
    if (sugarTrend.consistentlyHigh) {
      score += 3;
      indicators.push('Consistently high blood sugar across multiple visits');
    }
  }
  
  // BMI factor for diabetes
  const bmi = calculateBMI(latestVisit.vitals);
  if (bmi > 30) {
    score += 2;
    indicators.push('High BMI increases diabetes risk');
  }
  
  const explanation = score === 0 
    ? 'Blood sugar levels are normal'
    : `Patient shows signs of diabetic risk. ${indicators.join('. ')}.`;
  
  return {
    category: 'Diabetic Risk',
    severity,
    score,
    explanation,
    indicators
  };
}

/**
 * Analyze cardiac risk based on blood pressure and related factors
 */
function analyzeCardiacRisk(patient: any, latestVisit: any): RiskCategory {
  let score = 0;
  const indicators: string[] = [];
  let severity: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (!latestVisit?.vitals?.bp) {
    return { category: 'Cardiac Risk', severity: 'Low', score: 0, explanation: '', indicators: [] };
  }
  
  const systolic = parseInt(latestVisit.vitals.bp.systolic || 0);
  const diastolic = parseInt(latestVisit.vitals.bp.diastolic || 0);
  
  // Analyze blood pressure
  if (systolic >= 180 || diastolic >= 120) {
    score += 10;
    severity = 'High';
    indicators.push(`Critical hypertension: ${systolic}/${diastolic} mmHg (normal: 120/80)`);
  } else if (systolic >= 140 || diastolic >= 90) {
    score += 6;
    severity = 'High';
    indicators.push(`High blood pressure: ${systolic}/${diastolic} mmHg (normal: 120/80)`);
  } else if (systolic >= 130 || diastolic >= 85) {
    score += 3;
    severity = 'Medium';
    indicators.push(`Elevated blood pressure: ${systolic}/${diastolic} mmHg`);
  } else if (systolic >= 120 || diastolic >= 80) {
    score += 1;
    severity = 'Low';
    indicators.push(`Pre-hypertension: ${systolic}/${diastolic} mmHg`);
  }
  
  // Analyze BP trends
  if (patient.visits && patient.visits.length >= 2) {
    const bpTrend = analyzeBPTrend(patient.visits);
    if (bpTrend.increasing) {
      score += 2;
      indicators.push('Blood pressure showing upward trend');
    }
    if (bpTrend.consistentlyHigh) {
      score += 3;
      indicators.push('Consistently high BP across visits');
    }
  }
  
  // Age factor
  const age = calculateAge(patient.dateOfBirth);
  if (age > 60 && systolic > 130) {
    score += 2;
    indicators.push('Advanced age with elevated BP increases cardiac risk');
  }
  
  const explanation = score === 0 
    ? 'Blood pressure is within normal range'
    : `Patient shows signs of cardiac risk. ${indicators.join('. ')}.`;
  
  return {
    category: 'Cardiac Risk',
    severity,
    score,
    explanation,
    indicators
  };
}

/**
 * Analyze cancer risk based on screening results
 */
function analyzeCancerRisk(patient: any, latestVisit: any): RiskCategory {
  let score = 0;
  const indicators: string[] = [];
  let severity: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (!latestVisit?.screening) {
    return { category: 'Cancer Risk', severity: 'Low', score: 0, explanation: '', indicators: [] };
  }
  
  const screening = latestVisit.screening;
  
  if (screening.oralCancer) {
    score += 8;
    severity = 'High';
    indicators.push('Oral cancer warning signs detected during screening');
    if (screening.oralCancerComments) {
      indicators.push(`Details: ${screening.oralCancerComments}`);
    }
  }
  
  if (screening.cervicalCancer) {
    score += 8;
    severity = 'High';
    indicators.push('Cervical cancer warning signs detected');
    if (screening.cervicalCancerComments) {
      indicators.push(`Details: ${screening.cervicalCancerComments}`);
    }
  }
  
  if (screening.breastCancer) {
    score += 8;
    severity = 'High';
    indicators.push('Breast cancer warning signs detected');
    if (screening.breastCancerComments) {
      indicators.push(`Details: ${screening.breastCancerComments}`);
    }
  }
  
  // Check history of cancer screening
  if (patient.visits && patient.visits.length >= 2) {
    const previousCancerSigns = patient.visits.slice(0, -1).some((visit: any) => 
      visit.screening?.oralCancer || visit.screening?.cervicalCancer || visit.screening?.breastCancer
    );
    
    if (previousCancerSigns && score > 0) {
      score += 3;
      indicators.push('Persistent cancer warning signs across multiple visits');
    }
  }
  
  const explanation = score === 0 
    ? 'No cancer warning signs detected in screening'
    : `Patient shows cancer risk indicators. ${indicators.join('. ')}.`;
  
  return {
    category: 'Cancer Risk',
    severity,
    score,
    explanation,
    indicators
  };
}

/**
 * Analyze infection risk based on communicable disease screening
 */
function analyzeInfectionRisk(patient: any, latestVisit: any): RiskCategory {
  let score = 0;
  const indicators: string[] = [];
  let severity: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (!latestVisit?.screening) {
    return { category: 'Infection Risk', severity: 'Low', score: 0, explanation: '', indicators: [] };
  }
  
  if (latestVisit.screening.communicableDisease) {
    score += 7;
    severity = 'High';
    indicators.push('Communicable disease detected during screening');
    if (latestVisit.screening.communicableDiseaseComments) {
      indicators.push(`Details: ${latestVisit.screening.communicableDiseaseComments}`);
    }
  }
  
  // Check for recurring infections
  if (patient.visits && patient.visits.length >= 2) {
    const recentInfections = patient.visits.slice(-3).filter((visit: any) => 
      visit.screening?.communicableDisease
    ).length;
    
    if (recentInfections >= 2) {
      score += 3;
      severity = 'High';
      indicators.push('Recurring infections detected in recent visits');
    }
  }
  
  const explanation = score === 0 
    ? 'No signs of communicable disease'
    : `Patient shows infection risk. ${indicators.join('. ')}.`;
  
  return {
    category: 'Infection Risk',
    severity,
    score,
    explanation,
    indicators
  };
}

/**
 * Analyze maternal health risk for pregnant women
 */
function analyzeMaternalRisk(patient: any, latestVisit: any): RiskCategory | null {
  if (patient.gender !== 'Female' || !latestVisit?.pregnancy?.isPregnant) {
    return null;
  }
  
  let score = 0;
  const indicators: string[] = [];
  let severity: 'Low' | 'Medium' | 'High' = 'Low';
  
  const pregnancy = latestVisit.pregnancy;
  const weeks = parseInt(pregnancy.weeks || 0);
  
  indicators.push(`Currently pregnant - ${weeks} weeks`);
  
  // High-risk pregnancy factors
  if (pregnancy.complications) {
    score += 6;
    severity = 'High';
    indicators.push(`Complications reported: ${pregnancy.complications}`);
  }
  
  // Age factors
  const age = calculateAge(patient.dateOfBirth);
  if (age < 18 || age > 35) {
    score += 3;
    severity = age > 40 ? 'High' : 'Medium';
    indicators.push(`Age ${age} increases pregnancy risk`);
  }
  
  // BP during pregnancy
  if (latestVisit.vitals?.bp) {
    const systolic = parseInt(latestVisit.vitals.bp.systolic || 0);
    if (systolic >= 140) {
      score += 5;
      severity = 'High';
      indicators.push('High blood pressure during pregnancy (pre-eclampsia risk)');
    }
  }
  
  // Blood sugar during pregnancy
  if (latestVisit.vitals?.bloodSugar) {
    const bloodSugar = parseInt(latestVisit.vitals.bloodSugar);
    if (bloodSugar >= 140) {
      score += 4;
      severity = 'High';
      indicators.push('Elevated blood sugar during pregnancy (gestational diabetes risk)');
    }
  }
  
  const explanation = score === 0 
    ? 'Normal pregnancy with no identified risk factors'
    : `Maternal health requires attention. ${indicators.join('. ')}.`;
  
  return {
    category: 'Maternal Risk',
    severity,
    score,
    explanation,
    indicators
  };
}

/**
 * Analyze BMI-related risks (obesity or malnutrition)
 */
function analyzeBMIRisk(patient: any, latestVisit: any): RiskCategory | null {
  if (!latestVisit?.vitals?.weight || !latestVisit?.vitals?.height) {
    return null;
  }
  
  let score = 0;
  const indicators: string[] = [];
  let severity: 'Low' | 'Medium' | 'High' = 'Low';
  let category: 'Obesity Risk' | 'Malnutrition Risk' = 'Obesity Risk';
  
  const bmi = calculateBMI(latestVisit.vitals);
  
  if (bmi >= 35) {
    score += 6;
    severity = 'High';
    category = 'Obesity Risk';
    indicators.push(`Severe obesity: BMI ${bmi.toFixed(1)} (normal: 18.5-24.9)`);
    indicators.push('Increased risk for diabetes, heart disease, and joint problems');
  } else if (bmi >= 30) {
    score += 4;
    severity = 'Medium';
    category = 'Obesity Risk';
    indicators.push(`Obesity: BMI ${bmi.toFixed(1)} (normal: 18.5-24.9)`);
    indicators.push('Elevated risk for chronic diseases');
  } else if (bmi >= 25) {
    score += 2;
    severity = 'Low';
    category = 'Obesity Risk';
    indicators.push(`Overweight: BMI ${bmi.toFixed(1)} (normal: 18.5-24.9)`);
  } else if (bmi < 16) {
    score += 6;
    severity = 'High';
    category = 'Malnutrition Risk';
    indicators.push(`Severe underweight: BMI ${bmi.toFixed(1)} (normal: 18.5-24.9)`);
    indicators.push('Risk of weakened immune system and health complications');
  } else if (bmi < 18.5) {
    score += 3;
    severity = 'Medium';
    category = 'Malnutrition Risk';
    indicators.push(`Underweight: BMI ${bmi.toFixed(1)} (normal: 18.5-24.9)`);
  }
  
  if (score === 0) return null;
  
  const explanation = `Patient's BMI indicates ${category.toLowerCase()}. ${indicators.join('. ')}.`;
  
  return {
    category,
    severity,
    score,
    explanation,
    indicators
  };
}

/**
 * Helper function to analyze blood sugar trends
 */
function analyzeBloodSugarTrend(visits: any[]) {
  const sugarValues = visits
    .filter(v => v.vitals?.bloodSugar)
    .map(v => parseInt(v.vitals.bloodSugar));
  
  if (sugarValues.length < 2) {
    return { increasing: false, consistentlyHigh: false };
  }
  
  // Check if trending upward
  const recentAvg = sugarValues.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const olderAvg = sugarValues.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const increasing = recentAvg > olderAvg + 10;
  
  // Check if consistently high
  const highCount = sugarValues.filter(v => v >= 140).length;
  const consistentlyHigh = highCount >= sugarValues.length * 0.6;
  
  return { increasing, consistentlyHigh };
}

/**
 * Helper function to analyze BP trends
 */
function analyzeBPTrend(visits: any[]) {
  const bpValues = visits
    .filter(v => v.vitals?.bp?.systolic)
    .map(v => parseInt(v.vitals.bp.systolic));
  
  if (bpValues.length < 2) {
    return { increasing: false, consistentlyHigh: false };
  }
  
  // Check if trending upward
  const recentAvg = bpValues.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const olderAvg = bpValues.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const increasing = recentAvg > olderAvg + 5;
  
  // Check if consistently high
  const highCount = bpValues.filter(v => v >= 140).length;
  const consistentlyHigh = highCount >= bpValues.length * 0.6;
  
  return { increasing, consistentlyHigh };
}

/**
 * Calculate BMI from vitals
 */
function calculateBMI(vitals: any): number {
  const weight = parseFloat(vitals.weight);
  const height = parseFloat(vitals.height) / 100; // Convert cm to meters
  return weight / (height * height);
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Determine overall risk level based on total score
 */
function determineRiskLevel(score: number): 'Normal' | 'At Risk' | 'High Risk' {
  if (score >= 10) return 'High Risk';
  if (score >= 4) return 'At Risk';
  return 'Normal';
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(
  riskLevel: 'Normal' | 'At Risk' | 'High Risk',
  categories: RiskCategory[]
): string {
  if (riskLevel === 'Normal') {
    return 'Based on current health data, no significant health risks detected. Continue regular check-ups and maintain healthy habits.';
  }
  
  const highRiskCategories = categories.filter(c => c.severity === 'High');
  const mediumRiskCategories = categories.filter(c => c.severity === 'Medium');
  
  let explanation = '⚠️ IMPORTANT: This is a risk prediction for early awareness and NOT a medical diagnosis. ';
  
  if (highRiskCategories.length > 0) {
    explanation += `High risk detected in: ${highRiskCategories.map(c => c.category).join(', ')}. `;
  }
  
  if (mediumRiskCategories.length > 0) {
    explanation += `Moderate concerns in: ${mediumRiskCategories.map(c => c.category).join(', ')}. `;
  }
  
  explanation += 'Please consult a qualified doctor for proper medical examination and diagnosis.';
  
  return explanation;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(categories: RiskCategory[]): string[] {
  const recommendations: string[] = [];
  
  const hasHighRisk = categories.some(c => c.severity === 'High');
  
  if (hasHighRisk) {
    recommendations.push('🏥 URGENT: Schedule doctor consultation as soon as possible');
  } else {
    recommendations.push('📅 Schedule a doctor consultation for thorough check-up');
  }
  
  categories.forEach(category => {
    switch (category.category) {
      case 'Diabetic Risk':
        recommendations.push('🍎 Monitor blood sugar regularly and maintain healthy diet');
        recommendations.push('🚶 Increase physical activity to 30 minutes daily');
        break;
      case 'Cardiac Risk':
        recommendations.push('❤️ Monitor blood pressure regularly');
        recommendations.push('🧂 Reduce salt intake and avoid fatty foods');
        break;
      case 'Cancer Risk':
        recommendations.push('🔬 Immediate medical screening and biopsy required');
        recommendations.push('📋 Bring all screening reports to specialist doctor');
        break;
      case 'Infection Risk':
        recommendations.push('💊 Complete prescribed antibiotic course if any');
        recommendations.push('🧼 Maintain hygiene and avoid contact with others');
        break;
      case 'Maternal Risk':
        recommendations.push('🤰 Regular prenatal check-ups are essential');
        recommendations.push('👶 Monitor fetal movements and report any concerns');
        break;
      case 'Obesity Risk':
        recommendations.push('⚖️ Consult nutritionist for weight management plan');
        recommendations.push('🏃 Gradual increase in daily physical activity');
        break;
      case 'Malnutrition Risk':
        recommendations.push('🥗 Consult nutritionist for proper diet planning');
        recommendations.push('💪 Ensure adequate protein and calorie intake');
        break;
    }
  });
  
  // Remove duplicates
  return [...new Set(recommendations)];
}

/**
 * Get risk level color for UI display
 */
export function getRiskColor(riskLevel: 'Normal' | 'At Risk' | 'High Risk'): string {
  switch (riskLevel) {
    case 'Normal': return 'bg-green-500';
    case 'At Risk': return 'bg-yellow-500';
    case 'High Risk': return 'bg-red-500';
  }
}

/**
 * Get severity color for UI display
 */
export function getSeverityColor(severity: 'Low' | 'Medium' | 'High'): string {
  switch (severity) {
    case 'Low': return 'text-yellow-600';
    case 'Medium': return 'text-orange-600';
    case 'High': return 'text-red-600';
  }
}
