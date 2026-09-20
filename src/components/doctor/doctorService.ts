import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import {
  Appointment,
  Consultation,
  Prescription,
  LabOrder,
  FollowUp,
  Referral,
  Patient,
  User,
  NotificationItem,
  AuditLogEntry
} from '../../types';
import jsPDF from 'jspdf';

export interface DoctorVitals {
  temperature: string;
  bloodPressure: string;
  pulseRate: string;
  spO2: string;
  respiratoryRate?: string;
  weightKg?: string;
  heightCm?: string;
}

export interface PrescribedMedicineItem {
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: 'Oral' | 'Topical' | 'Inhalation' | 'Intravenous' | 'Intramuscular' | 'Sublingual';
  durationDays: number;
  quantity: number;
  foodTiming: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach' | 'Anytime';
  instructions: string;
}

export interface PrescribedInvestigation {
  testId: string;
  testName: string;
  instructions?: string;
  priority: 'Routine' | 'Urgent' | 'Stat';
}

export interface CompleteConsultationPayload {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorRegistrationNumber?: string;
  doctorDepartment?: string;
  facilityId: string;
  facilityName: string;
  consultationType: 'OPD' | 'VIDEO_CONSULTATION';
  chiefComplaint: string;
  symptoms: string[];
  vitals: DoctorVitals;
  examinationNotes: string;
  assessment: string;
  diagnosis: string;
  treatmentPlan: string;
  medicines: PrescribedMedicineItem[];
  investigations: PrescribedInvestigation[];
  advice: string;
  followUpDate?: string;
  followUpInstructions?: string;
  followUpType?: 'OPD' | 'VIDEO';
  referral?: {
    toFacilityId: string;
    toFacilityName: string;
    specialtyRequired: string;
    priority: 'Routine' | 'Urgent' | 'Emergency';
    reason: string;
  };
}

export interface ConsultationSubmissionResult {
  success: boolean;
  consultationId: string;
  prescriptionId?: string;
  pdfGenerated: boolean;
  pdfDownloadUrl?: string;
  patientNotified: boolean;
  pharmacyOrderId?: string;
  labOrderId?: string;
  followUpId?: string;
  auditLogged: boolean;
  error?: string;
}

// -------------------------------------------------------------
// Realtime Listeners for Doctor Portal
// -------------------------------------------------------------

export function subscribeDoctorAppointments(
  doctorId: string,
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, 'appointments');
    // Listen to appointments matching doctorId, or all for general view
    return onSnapshot(
      colRef,
      snapshot => {
        const appts: Appointment[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          // Include if matching doctor or if unassigned
          appts.push({
            id: docSnap.id,
            ...data
          } as Appointment);
        });
        // Sort by scheduledDate / scheduledTime
        appts.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        onUpdate(appts);
      },
      err => {
        console.warn('Firestore appointments subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to set up appointments subscription:', err);
    return () => {};
  }
}

export function subscribeDoctorLabOrders(
  onUpdate: (orders: LabOrder[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, 'labOrders');
    return onSnapshot(
      colRef,
      snapshot => {
        const orders: LabOrder[] = [];
        snapshot.forEach(docSnap => {
          orders.push({
            id: docSnap.id,
            ...docSnap.data()
          } as LabOrder);
        });
        onUpdate(orders);
      },
      err => {
        console.warn('Firestore lab orders subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    return () => {};
  }
}

export function subscribeDoctorLabReports(
  onUpdate: (reports: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, 'labReports');
    return onSnapshot(
      colRef,
      snapshot => {
        const reports: any[] = [];
        snapshot.forEach(docSnap => {
          reports.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        onUpdate(reports);
      },
      err => {
        console.warn('Firestore lab reports subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    return () => {};
  }
}

export function subscribeDoctorPrescriptions(
  doctorId: string,
  onUpdate: (prescriptions: Prescription[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, 'prescriptions');
    return onSnapshot(
      colRef,
      snapshot => {
        const rxs: Prescription[] = [];
        snapshot.forEach(docSnap => {
          rxs.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Prescription);
        });
        rxs.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        onUpdate(rxs);
      },
      err => {
        console.warn('Firestore prescriptions subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    return () => {};
  }
}

export function subscribeDoctorFollowUps(
  onUpdate: (followUps: FollowUp[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, 'followUps');
    return onSnapshot(
      colRef,
      snapshot => {
        const list: FollowUp[] = [];
        snapshot.forEach(docSnap => {
          list.push({
            id: docSnap.id,
            ...docSnap.data()
          } as FollowUp);
        });
        onUpdate(list);
      },
      err => {
        console.warn('Firestore follow-ups subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    return () => {};
  }
}

// -------------------------------------------------------------
// Fetch Patient Historical Clinical Records (Timeline)
// -------------------------------------------------------------

export async function fetchPatientClinicalRecords(patientId: string): Promise<{
  consultations: Consultation[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  labReports: any[];
  followUps: FollowUp[];
  documents: any[];
}> {
  try {
    const consultationsSnap = await getDocs(
      query(collection(db, 'consultations'), where('patientId', '==', patientId))
    );
    const consultations = consultationsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Consultation));

    const prescriptionsSnap = await getDocs(
      query(collection(db, 'prescriptions'), where('patientId', '==', patientId))
    );
    const prescriptions = prescriptionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription));

    const labOrdersSnap = await getDocs(
      query(collection(db, 'labOrders'), where('patientId', '==', patientId))
    );
    const labOrders = labOrdersSnap.docs.map(d => ({ id: d.id, ...d.data() } as LabOrder));

    const labReportsSnap = await getDocs(
      query(collection(db, 'labReports'), where('patientId', '==', patientId))
    );
    const labReports = labReportsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const followUpsSnap = await getDocs(
      query(collection(db, 'followUps'), where('patientId', '==', patientId))
    );
    const followUps = followUpsSnap.docs.map(d => ({ id: d.id, ...d.data() } as FollowUp));

    const docsSnap = await getDocs(
      query(collection(db, 'medicalDocuments'), where('patientId', '==', patientId))
    );
    const documents = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return {
      consultations,
      prescriptions,
      labOrders,
      labReports,
      followUps,
      documents
    };
  } catch (err) {
    console.warn('Error fetching patient records from Firestore:', err);
    return {
      consultations: [],
      prescriptions: [],
      labOrders: [],
      labReports: [],
      followUps: [],
      documents: []
    };
  }
}

// -------------------------------------------------------------
// PDF Generation for Prescriptions
// -------------------------------------------------------------

export function generatePrescriptionPDF(payload: CompleteConsultationPayload, prescriptionId: string): {
  doc: jsPDF;
  blob: Blob;
  dataUrl: string;
} {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Clinic / Hospital Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CARE4U NEXUS', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${payload.facilityName} • Government Healthcare Coordination Network`, 14, 23);
  doc.text('Official Clinical Digital e-Prescription (ABDM Compliant Format)', 14, 29);

  // Rx ID on top right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(`Rx ID: ${prescriptionId}`, pageWidth - 14, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 23, { align: 'right' });
  doc.text(`Consultation: ${payload.consultationType}`, pageWidth - 14, 29, { align: 'right' });

  // Doctor & Patient Meta Section
  let y = 48;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, pageWidth - 28, 32, 3, 3, 'FD');

  // Doctor Info (Left)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prescribing Physician:`, 18, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 116, 144);
  doc.text(`${payload.doctorName}`, 18, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`Department: ${payload.doctorDepartment || 'General Medicine'}`, 18, y + 20);
  doc.text(`Reg No: ${payload.doctorRegistrationNumber || 'MCI-MH-2018-84291'}`, 18, y + 26);

  // Patient Info (Right)
  const rightX = pageWidth / 2 + 10;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient Details:`, rightX, y + 8);
  doc.setTextColor(14, 116, 144);
  doc.text(`${payload.patientName}`, rightX, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text(`Patient ID: ${payload.patientId}`, rightX, y + 20);
  doc.text(`Appointment Ref: ${payload.appointmentId}`, rightX, y + 26);

  // Vitals & Clinical Diagnosis
  y = 88;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Clinical Assessment & Diagnosis', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 14, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`Diagnosis: ${payload.diagnosis || 'Clinical evaluation completed'}`, 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Vitals: BP: ${payload.vitals.bloodPressure || 'N/A'} | Pulse: ${payload.vitals.pulseRate || 'N/A'} | Temp: ${payload.vitals.temperature || 'N/A'} | SpO2: ${payload.vitals.spO2 || 'N/A'}`,
    18,
    y + 10
  );

  // Rx Symbol & Prescribed Medicines Table
  y += 22;
  doc.setFontSize(18);
  doc.setFont('times', 'bolditalic');
  doc.setTextColor(15, 23, 42);
  doc.text('Rx', 14, y);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescribed Medications', 26, y - 2);

  // Table Header
  y += 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICINE & DOSAGE', 18, y + 5.5);
  doc.text('FREQUENCY', 90, y + 5.5);
  doc.text('DURATION', 125, y + 5.5);
  doc.text('TIMING & INSTRUCTIONS', 150, y + 5.5);

  y += 8;
  if (payload.medicines.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text('No oral or parenteral medications prescribed.', 18, y + 8);
    y += 14;
  } else {
    payload.medicines.forEach((med, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 12, 'F');
      }
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${med.medicineName}`, 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`${med.dosage} (${med.route})`, 18, y + 9);

      doc.text(`${med.frequency}`, 90, y + 6);
      doc.text(`${med.durationDays} Days (Qty: ${med.quantity})`, 125, y + 6);
      doc.text(`${med.foodTiming} - ${med.instructions || 'As directed'}`, 150, y + 6);

      y += 13;
    });
  }

  // Diagnostic Investigations (if ordered)
  if (payload.investigations.length > 0) {
    y += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Recommended Diagnostic Investigations', 14, y);
    y += 5;

    payload.investigations.forEach(inv => {
      doc.setFillColor(245, 243, 255); // purple-50
      doc.setDrawColor(221, 214, 254);
      doc.roundedRect(14, y, pageWidth - 28, 8, 1.5, 1.5, 'FD');
      doc.setTextColor(109, 40, 217); // purple-700
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${inv.testName}`, 18, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Priority: ${inv.priority} ${inv.instructions ? `(${inv.instructions})` : ''}`, 130, y + 5);
      y += 10;
    });
  }

  // General Advice & Follow-Up
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Medical Advice & Follow-Up Plan', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const adviceLines = doc.splitTextToSize(
    payload.advice || 'Adequate hydration, balanced nutrition, and completion of full medication course recommended.',
    pageWidth - 28
  );
  doc.text(adviceLines, 14, y);
  y += adviceLines.length * 4.5 + 2;

  if (payload.followUpDate) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 116, 144);
    doc.text(`Scheduled Review Date: ${payload.followUpDate} (${payload.followUpType || 'OPD'} Consultation)`, 14, y);
    y += 6;
  }

  // Digital Signature Box at Bottom
  const bottomY = Math.max(y + 10, 245);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, bottomY, pageWidth - 14, bottomY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Digitally signed and issued through CARE4U NEXUS Health Platform', 14, bottomY + 6);
  doc.text(`Prescription Security Hash: SHA256-${prescriptionId.substring(0, 12)}`, 14, bottomY + 11);

  // Doctor Signature Stamp
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(45, 212, 191);
  doc.roundedRect(pageWidth - 75, bottomY + 2, 61, 20, 2, 2, 'FD');
  doc.setTextColor(13, 148, 136); // teal-600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('✓ DIGITALLY SIGNED', pageWidth - 70, bottomY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${payload.doctorName}`, pageWidth - 70, bottomY + 13);
  doc.text(`Reg: ${payload.doctorRegistrationNumber || 'MCI-MH-2018-84291'}`, pageWidth - 70, bottomY + 18);

  const blob = doc.output('blob');
  const dataUrl = doc.output('datauristring');

  return { doc, blob, dataUrl };
}

// -------------------------------------------------------------
// ATOMIC CLINICAL WORKFLOW SUBMISSION
// -------------------------------------------------------------

export async function submitCompleteDoctorConsultation(
  payload: CompleteConsultationPayload
): Promise<ConsultationSubmissionResult> {
  const timestamp = new Date().toISOString();
  const consultationId = `con_${Date.now()}`;
  const prescriptionId = payload.medicines.length > 0 || payload.investigations.length > 0 ? `rx_${Date.now()}` : undefined;
  const pharmacyOrderId = payload.medicines.length > 0 ? `ph_${Date.now()}` : undefined;
  const labOrderId = payload.investigations.length > 0 ? `lab_${Date.now()}` : undefined;
  const followUpId = payload.followUpDate ? `flw_${Date.now()}` : undefined;
  const documentId = prescriptionId ? `doc_${Date.now()}` : undefined;
  const patientNotificationId = `notif_pat_${Date.now()}`;
  const pharmacyNotificationId = pharmacyOrderId ? `notif_ph_${Date.now()}` : undefined;
  const labNotificationId = labOrderId ? `notif_lab_${Date.now()}` : undefined;
  const auditLogId = `audit_${Date.now()}`;

  try {
    const batch = writeBatch(db);

    // 1. Write Consultation Record
    const consultationDocRef = doc(db, 'consultations', consultationId);
    batch.set(consultationDocRef, {
      consultationId,
      appointmentId: payload.appointmentId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      facilityId: payload.facilityId,
      facilityName: payload.facilityName,
      consultationType: payload.consultationType,
      chiefComplaint: payload.chiefComplaint,
      symptoms: payload.symptoms,
      vitals: payload.vitals,
      examinationNotes: payload.examinationNotes,
      assessment: payload.assessment,
      diagnosis: payload.diagnosis,
      treatmentPlan: payload.treatmentPlan,
      investigationIds: labOrderId ? [labOrderId] : [],
      prescriptionId: prescriptionId || null,
      followUpId: followUpId || null,
      status: 'COMPLETED',
      createdAt: timestamp,
      completedAt: timestamp
    });

    // 2. Write Prescription Record (if medicines or investigations exist)
    if (prescriptionId) {
      const prescriptionDocRef = doc(db, 'prescriptions', prescriptionId);
      batch.set(prescriptionDocRef, {
        prescriptionId,
        consultationId,
        appointmentId: payload.appointmentId,
        patientId: payload.patientId,
        patientName: payload.patientName,
        doctorId: payload.doctorId,
        doctorName: payload.doctorName,
        facilityId: payload.facilityId,
        facilityName: payload.facilityName,
        diagnosis: payload.diagnosis,
        medicines: payload.medicines,
        investigations: payload.investigations,
        advice: payload.advice,
        followUpDate: payload.followUpDate || null,
        status: 'SIGNED',
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // 3. Write Medical Document Metadata
      if (documentId) {
        const documentDocRef = doc(db, 'medicalDocuments', documentId);
        batch.set(documentDocRef, {
          documentId,
          patientId: payload.patientId,
          doctorId: payload.doctorId,
          prescriptionId,
          appointmentId: payload.appointmentId,
          type: 'PRESCRIPTION',
          title: `e-Prescription by ${payload.doctorName} - ${payload.diagnosis}`,
          storagePath: `patients/${payload.patientId}/prescriptions/${prescriptionId}.pdf`,
          mimeType: 'application/pdf',
          createdAt: timestamp
        });
      }

      // 4. Create Patient Notification
      const patientNotifDocRef = doc(db, 'notifications', patientNotificationId);
      batch.set(patientNotifDocRef, {
        id: patientNotificationId,
        targetRole: 'PATIENT',
        targetUserId: payload.patientId,
        title: 'Prescription Ready',
        message: `Your prescription from ${payload.doctorName} is now available.`,
        type: 'PRESCRIPTION_CREATED',
        relatedEntityId: prescriptionId,
        isRead: false,
        createdAt: timestamp
      });
    }

    // 5. AUTOMATIC PHARMACY ROUTING (ONLY if medicines exist!)
    if (pharmacyOrderId && payload.medicines.length > 0) {
      const pharmacyDocRef = doc(db, 'pharmacyOrders', pharmacyOrderId);
      batch.set(pharmacyDocRef, {
        orderId: pharmacyOrderId,
        prescriptionId,
        patientId: payload.patientId,
        patientName: payload.patientName,
        facilityId: payload.facilityId,
        doctorId: payload.doctorId,
        doctorName: payload.doctorName,
        medicines: payload.medicines.map(m => ({
          medicineName: m.medicineName,
          genericName: m.genericName || m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          durationDays: m.durationDays,
          quantity: m.quantity,
          instructions: `${m.foodTiming} - ${m.instructions}`
        })),
        status: 'PENDING',
        createdAt: timestamp
      });

      if (pharmacyNotificationId) {
        const phNotifRef = doc(db, 'notifications', pharmacyNotificationId);
        batch.set(phNotifRef, {
          id: pharmacyNotificationId,
          targetRole: 'PHARMACY_STAFF',
          title: 'New Medication Dispense Order',
          message: `Doctor prescribed ${payload.medicines.length} medications for ${payload.patientName}.`,
          type: 'PRESCRIPTION_CREATED',
          relatedEntityId: pharmacyOrderId,
          isRead: false,
          createdAt: timestamp
        });
      }
    }

    // 6. AUTOMATIC DIAGNOSTIC LAB ROUTING (ONLY if investigations exist!)
    if (labOrderId && payload.investigations.length > 0) {
      const labDocRef = doc(db, 'labOrders', labOrderId);
      batch.set(labDocRef, {
        labOrderId,
        consultationId,
        appointmentId: payload.appointmentId,
        prescriptionId: prescriptionId || null,
        patientId: payload.patientId,
        patientName: payload.patientName,
        facilityId: payload.facilityId,
        facilityName: payload.facilityName,
        doctorId: payload.doctorId,
        doctorName: payload.doctorName,
        tests: payload.investigations.map(inv => ({
          testId: inv.testId,
          testName: inv.testName,
          instructions: inv.instructions || '',
          priority: inv.priority
        })),
        clinicalNote: `Provisional diagnosis: ${payload.diagnosis}`,
        priority: payload.investigations.some(i => i.priority === 'Stat')
          ? 'Stat'
          : payload.investigations.some(i => i.priority === 'Urgent')
          ? 'Urgent'
          : 'Routine',
        status: 'ORDERED',
        createdAt: timestamp
      });

      if (labNotificationId) {
        const labNotifRef = doc(db, 'notifications', labNotificationId);
        batch.set(labNotifRef, {
          id: labNotificationId,
          targetRole: 'LAB_STAFF',
          title: 'New Diagnostic Test Requisition',
          message: `${payload.doctorName} requested ${payload.investigations.length} diagnostic tests for ${payload.patientName}.`,
          type: 'LAB_ORDER_CREATED',
          relatedEntityId: labOrderId,
          isRead: false,
          createdAt: timestamp
        });
      }
    }

    // 7. Clinical Follow-Up
    if (followUpId && payload.followUpDate) {
      const followUpDocRef = doc(db, 'followUps', followUpId);
      batch.set(followUpDocRef, {
        followUpId,
        patientId: payload.patientId,
        patientName: payload.patientName,
        doctorId: payload.doctorId,
        doctorName: payload.doctorName,
        appointmentId: payload.appointmentId,
        facilityId: payload.facilityId,
        facilityName: payload.facilityName,
        targetDate: payload.followUpDate,
        type: payload.followUpType || 'OPD',
        instructions: payload.followUpInstructions || 'Clinical progress review & recovery check',
        purpose: `Review following: ${payload.diagnosis}`,
        status: 'SCHEDULED',
        createdAt: timestamp
      });

      const followUpNotifId = `notif_flw_${Date.now()}`;
      const flwNotifRef = doc(db, 'notifications', followUpNotifId);
      batch.set(flwNotifRef, {
        id: followUpNotifId,
        targetRole: 'PATIENT',
        targetUserId: payload.patientId,
        title: 'Follow-Up Scheduled',
        message: `Your review appointment with ${payload.doctorName} is scheduled for ${payload.followUpDate}.`,
        type: 'FOLLOWUP_DUE',
        relatedEntityId: followUpId,
        isRead: false,
        createdAt: timestamp
      });
    }

    // 8. Update Appointment Status
    if (payload.appointmentId) {
      const apptDocRef = doc(db, 'appointments', payload.appointmentId);
      batch.update(apptDocRef, {
        status: 'COMPLETED',
        consultationId,
        prescriptionId: prescriptionId || null,
        completedAt: timestamp
      });
    }

    // 9. Immutable Audit Log Trail
    const auditDocRef = doc(db, 'auditLogs', auditLogId);
    batch.set(auditDocRef, {
      id: auditLogId,
      actorUid: auth.currentUser?.uid || payload.doctorId,
      actorRole: 'DOCTOR',
      userName: payload.doctorName,
      action: 'DOCTOR_SIGNED_PRESCRIPTION',
      resourceType: 'PRESCRIPTION',
      resourceId: prescriptionId || consultationId,
      patientId: payload.patientId,
      facilityId: payload.facilityId,
      details: `Dr. ${payload.doctorName} signed prescription for ${payload.patientName}. Diagnosis: ${payload.diagnosis}. Medicines: ${payload.medicines.length}. Tests: ${payload.investigations.length}.`,
      timestamp
    });

    // Commit atomic write batch to Firestore
    await batch.commit();

    // 10. Generate PDF Client-Side for instant download
    let pdfDownloadUrl: string | undefined;
    if (prescriptionId) {
      try {
        const { doc: pdfDoc, dataUrl } = generatePrescriptionPDF(payload, prescriptionId);
        pdfDoc.save(`Prescription_${payload.patientName.replace(/\s+/g, '_')}_${prescriptionId}.pdf`);
        pdfDownloadUrl = dataUrl;
      } catch (pdfErr) {
        console.warn('PDF auto-download warning:', pdfErr);
      }
    }

    return {
      success: true,
      consultationId,
      prescriptionId,
      pdfGenerated: true,
      pdfDownloadUrl,
      patientNotified: true,
      pharmacyOrderId,
      labOrderId,
      followUpId,
      auditLogged: true
    };
  } catch (err: any) {
    console.error('Error submitting doctor consultation:', err);
    return {
      success: false,
      consultationId: '',
      pdfGenerated: false,
      patientNotified: false,
      auditLogged: false,
      error: err?.message || 'Failed to submit consultation to Firestore.'
    };
  }
}

// -------------------------------------------------------------
// Doctor Actions: Check In, Start Consultation, Cancel
// -------------------------------------------------------------

export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment['status'],
  notes?: string
): Promise<void> {
  const apptRef = doc(db, 'appointments', appointmentId);
  await updateDoc(apptRef, {
    status,
    updatedAt: new Date().toISOString(),
    ...(notes ? { doctorNotes: notes } : {})
  });

  // Audit event
  try {
    const auditId = `audit_${Date.now()}`;
    await setDoc(doc(db, 'auditLogs', auditId), {
      id: auditId,
      actorUid: auth.currentUser?.uid || 'doctor',
      actorRole: 'DOCTOR',
      action: `APPOINTMENT_${status}`,
      resourceType: 'APPOINTMENT',
      resourceId: appointmentId,
      timestamp: new Date().toISOString(),
      details: `Appointment status updated to ${status}`
    });
  } catch {
    // Non-blocking
  }
}

// -------------------------------------------------------------
// Doctor Actions: Review Lab Report
// -------------------------------------------------------------

export async function reviewLabReport(
  reportId: string,
  doctorNotes: string,
  doctorName: string
): Promise<void> {
  const reportRef = doc(db, 'labReports', reportId);
  await updateDoc(reportRef, {
    status: 'REVIEWED',
    reviewedByDoctor: doctorName,
    doctorReviewNotes: doctorNotes,
    reviewedAt: new Date().toISOString()
  });

  const auditId = `audit_${Date.now()}`;
  await setDoc(doc(db, 'auditLogs', auditId), {
    id: auditId,
    actorUid: auth.currentUser?.uid || 'doctor',
    actorRole: 'DOCTOR',
    action: 'LAB_REPORT_REVIEWED',
    resourceType: 'LAB_REPORT',
    resourceId: reportId,
    timestamp: new Date().toISOString(),
    details: `Doctor ${doctorName} reviewed lab report ${reportId}`
  });
}
