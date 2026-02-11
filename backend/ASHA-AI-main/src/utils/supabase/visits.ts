import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export async function getPatientVisits(patientId: string) {
  const { data, error } = await supabase
    .from('patient_visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updatePatientVisit(visitId: string, payload: any) {
  const { error } = await supabase
    .from('patient_visits')
    .update(payload)
    .eq('id', visitId);

  if (error) throw error;
}
