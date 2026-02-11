import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage bucket
const bucketName = 'make-13d5531e-patient-photos';
const initStorage = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
  }
};
initStorage();

// Login endpoint
app.post('/make-server-13d5531e/login', async (c) => {
  try {
    const { userId, password } = await c.req.json();
    
    // Admin login
    if (userId === 'admin' && password === 'admin') {
      return c.json({ success: true, role: 'admin', userId: 'admin', name: 'Admin' });
    }
    
    // ASHA login - check if ASHA exists
    const ashaKey = `asha:${userId}`;
    const ashaData = await kv.get(ashaKey);
    
    if (ashaData) {
      return c.json({ success: true, role: 'asha', userId, name: ashaData.name });
    }
    
    // Create new ASHA if doesn't exist (for demo purposes)
    const newAsha = {
      id: userId,
      name: `ASHA Worker ${userId}`,
      area: 'Area 1',
      phone: '9876543210',
      createdAt: new Date().toISOString()
    };
    await kv.set(ashaKey, newAsha);
    
    return c.json({ success: true, role: 'asha', userId, name: newAsha.name });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Register patient
app.post('/make-server-13d5531e/register-patient', async (c) => {
  try {
    const formData = await c.req.formData();
    const patientData = JSON.parse(formData.get('data') as string);
    const photo = formData.get('photo') as File | null;
    
    let photoUrl = '';
    if (photo) {
      const fileName = `${Date.now()}-${patientData.aadharNumber}.jpg`;
      const arrayBuffer = await photo.arrayBuffer();
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
      
      if (!error && data) {
        const { data: signedUrl } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(data.path, 60 * 60 * 24 * 365);
        photoUrl = signedUrl?.signedUrl || '';
      }
    }
    
    const patient = {
      ...patientData,
      photoUrl,
      id: `patient:${patientData.aadharNumber}`,
      registeredAt: new Date().toISOString(),
      visits: []
    };
    
    await kv.set(`patient:${patientData.aadharNumber}`, patient);
    
    // Update ASHA stats
    const statsKey = `stats:${patientData.registeredBy}:${new Date().toISOString().split('T')[0]}`;
    const stats = await kv.get(statsKey) || { visits: 0, newRegistrations: 0, followUps: 0 };
    stats.newRegistrations += 1;
    await kv.set(statsKey, stats);
    
    return c.json({ success: true, patient });
  } catch (error) {
    console.log('Register patient error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get patients by area
app.get('/make-server-13d5531e/patients/:area', async (c) => {
  try {
    const area = c.req.param('area');
    const allPatients = await kv.getByPrefix('patient:');
    const patients = allPatients.filter((p: any) => p.area === area);
    return c.json({ success: true, patients });
  } catch (error) {
    console.log('Get patients error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all patients for admin
app.get('/make-server-13d5531e/patients', async (c) => {
  try {
    const patients = await kv.getByPrefix('patient:');
    return c.json({ success: true, patients });
  } catch (error) {
    console.log('Get all patients error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update patient visit
app.post('/make-server-13d5531e/update-visit', async (c) => {
  try {
    const formData = await c.req.formData();
    const visitData = JSON.parse(formData.get('data') as string);
    const photos = [];
    
    // Handle multiple photo uploads
    for (let i = 0; i < 5; i++) {
      const photo = formData.get(`photo${i}`) as File | null;
      if (photo) {
        const fileName = `visit-${Date.now()}-${i}.jpg`;
        const arrayBuffer = await photo.arrayBuffer();
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
        
        if (!error && data) {
          const { data: signedUrl } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(data.path, 60 * 60 * 24 * 365);
          if (signedUrl) photos.push(signedUrl.signedUrl);
        }
      }
    }
    
    const patient = await kv.get(`patient:${visitData.aadharNumber}`);
    if (!patient) {
      return c.json({ success: false, error: 'Patient not found' }, 404);
    }
    
    const visit = {
      ...visitData,
      photos,
      timestamp: new Date().toISOString()
    };
    
    patient.visits = patient.visits || [];
    patient.visits.push(visit);
    patient.lastVisit = visit.timestamp;
    
    await kv.set(`patient:${visitData.aadharNumber}`, patient);
    
    // Update ASHA stats
    const statsKey = `stats:${visitData.ashaId}:${new Date().toISOString().split('T')[0]}`;
    const stats = await kv.get(statsKey) || { visits: 0, newRegistrations: 0, followUps: 0 };
    stats.visits += 1;
    stats.followUps += 1;
    await kv.set(statsKey, stats);
    
    return c.json({ success: true, patient });
  } catch (error) {
    console.log('Update visit error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create SOS
app.post('/make-server-13d5531e/create-sos', async (c) => {
  try {
    const sosData = await c.req.json();
    const sosId = `sos:${Date.now()}`;
    const sos = {
      ...sosData,
      id: sosId,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(sosId, sos);
    return c.json({ success: true, sos });
  } catch (error) {
    console.log('Create SOS error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get active SOS
app.get('/make-server-13d5531e/sos/active', async (c) => {
  try {
    const allSos = await kv.getByPrefix('sos:');
    const activeSos = allSos.filter((s: any) => s.status === 'active');
    return c.json({ success: true, sos: activeSos });
  } catch (error) {
    console.log('Get active SOS error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Assign ambulance and doctor to SOS
app.post('/make-server-13d5531e/assign-sos', async (c) => {
  try {
    const { sosId, ambulance, doctor } = await c.req.json();
    const sos = await kv.get(sosId);
    
    if (!sos) {
      return c.json({ success: false, error: 'SOS not found' }, 404);
    }
    
    sos.ambulance = ambulance;
    sos.doctor = doctor;
    sos.status = 'assigned';
    sos.assignedAt = new Date().toISOString();
    
    await kv.set(sosId, sos);
    return c.json({ success: true, sos });
  } catch (error) {
    console.log('Assign SOS error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get ASHA stats
app.get('/make-server-13d5531e/stats/:ashaId/:date', async (c) => {
  try {
    const ashaId = c.req.param('ashaId');
    const date = c.req.param('date');
    const statsKey = `stats:${ashaId}:${date}`;
    const stats = await kv.get(statsKey) || { visits: 0, newRegistrations: 0, followUps: 0 };
    return c.json({ success: true, stats });
  } catch (error) {
    console.log('Get stats error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create appointment
app.post('/make-server-13d5531e/create-appointment', async (c) => {
  try {
    const appointmentData = await c.req.json();
    const appointmentId = `appointment:${Date.now()}`;
    const appointment = {
      ...appointmentData,
      id: appointmentId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(appointmentId, appointment);
    return c.json({ success: true, appointment });
  } catch (error) {
    console.log('Create appointment error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get appointments for ASHA
app.get('/make-server-13d5531e/appointments/:ashaId', async (c) => {
  try {
    const ashaId = c.req.param('ashaId');
    const allAppointments = await kv.getByPrefix('appointment:');
    const appointments = allAppointments.filter((a: any) => a.ashaId === ashaId);
    return c.json({ success: true, appointments });
  } catch (error) {
    console.log('Get appointments error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Complete appointment
app.post('/make-server-13d5531e/complete-appointment', async (c) => {
  try {
    const { appointmentId } = await c.req.json();
    const appointment = await kv.get(appointmentId);
    
    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }
    
    appointment.status = 'completed';
    appointment.completedAt = new Date().toISOString();
    
    await kv.set(appointmentId, appointment);
    return c.json({ success: true, appointment });
  } catch (error) {
    console.log('Complete appointment error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get priority patients (sorted by severity)
app.get('/make-server-13d5531e/priority-patients/:area', async (c) => {
  try {
    const area = c.req.param('area');
    const allPatients = await kv.getByPrefix('patient:');
    const areaPatients = allPatients.filter((p: any) => p.area === area);
    
    // Calculate severity score based on latest visit
    const patientsWithSeverity = areaPatients.map((p: any) => {
      let severityScore = 0;
      const lastVisit = p.visits?.[p.visits.length - 1];
      
      if (lastVisit) {
        if (lastVisit.screening?.oralCancer) severityScore += 5;
        if (lastVisit.screening?.cervicalCancer) severityScore += 5;
        if (lastVisit.screening?.breastCancer) severityScore += 5;
        if (lastVisit.screening?.communicableDisease) severityScore += 4;
        if (lastVisit.vitals?.bloodSugar > 200) severityScore += 3;
        if (lastVisit.vitals?.bp?.systolic > 140) severityScore += 3;
      }
      
      return { ...p, severityScore };
    });
    
    patientsWithSeverity.sort((a, b) => b.severityScore - a.severityScore);
    
    return c.json({ success: true, patients: patientsWithSeverity });
  } catch (error) {
    console.log('Get priority patients error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create notification
app.post('/make-server-13d5531e/create-notification', async (c) => {
  try {
    const { text } = await c.req.json();
    const notificationId = `notification:${Date.now()}`;
    const notification = {
      id: notificationId,
      text,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(notificationId, notification);
    return c.json({ success: true, notification });
  } catch (error) {
    console.log('Create notification error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get notifications
app.get('/make-server-13d5531e/notifications', async (c) => {
  try {
    const allNotifications = await kv.getByPrefix('notification:');
    // Sort by createdAt descending (most recent first)
    allNotifications.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ success: true, notifications: allNotifications });
  } catch (error) {
    console.log('Get notifications error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete notification
app.post('/make-server-13d5531e/delete-notification', async (c) => {
  try {
    const { notificationId } = await c.req.json();
    await kv.del(notificationId);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete notification error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete patient
app.post('/make-server-13d5531e/delete-patient', async (c) => {
  try {
    const { aadharNumber } = await c.req.json();
    await kv.del(`patient:${aadharNumber}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete patient error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);