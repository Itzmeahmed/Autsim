import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, CheckCircle, Calendar, Clock, Globe, Award, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ClinicalSafetyBanner } from '../components/ClinicalSafetyBanner';
import { ClinicianProfile } from '../types';
import { api } from '../services/api';

export const CliniciansDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [clinicians, setClinicians] = useState<ClinicianProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Modal State
  const [selectedClinician, setSelectedClinician] = useState<ClinicianProfile | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-10-15');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reason, setReason] = useState<string>('Follow-up discussion on AI screening indication');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    loadClinicians();
  }, []);

  const loadClinicians = async () => {
    setLoading(true);
    try {
      const data = await api.clinicians.getDirectory();
      setClinicians(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load clinicians.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = async (clinician: ClinicianProfile) => {
    setSelectedClinician(clinician);
    setBookingSuccess(false);
    setBookingError(null);
    await fetchSlots(clinician.id, appointmentDate);
  };

  const fetchSlots = async (clinicianId: number, dateStr: string) => {
    try {
      const slotData = await api.appointments.getSlots(clinicianId, dateStr);
      setAvailableSlots(slotData.available_slots);
      if (slotData.available_slots.length > 0) {
        setSelectedSlot(slotData.available_slots[0]);
      } else {
        setSelectedSlot('');
      }
    } catch {
      setAvailableSlots(['10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM']);
      setSelectedSlot('10:30 AM');
    }
  };

  const handleDateChange = (newDate: string) => {
    setAppointmentDate(newDate);
    if (selectedClinician) {
      fetchSlots(selectedClinician.id, newDate);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinician || !selectedSlot) return;

    setBookingLoading(true);
    setBookingError(null);
    try {
      await api.appointments.book({
        clinician_id: selectedClinician.id,
        appointment_date: appointmentDate,
        appointment_time: selectedSlot,
        reason_for_visit: reason
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedClinician(null);
        navigate('/patient');
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || 'Unable to book this appointment slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ClinicalSafetyBanner compact />

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block">
            {t('verifiedSpecialist')} Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('cliniciansTitle')}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('cliniciansSubtitle')}
          </p>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Loading verified clinical directory...</p>
        </div>
      )}

      {/* Clinicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clinicians.map((clinician) => (
          <div
            key={clinician.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900">
                      {clinician.full_name}
                    </h2>
                    <p className="text-xs font-semibold text-teal-700">
                      {clinician.specialty}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {clinician.qualification}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {clinician.bio || 'Specialized in developmental milestone tracking, behavioral analysis, and parent-guided support.'}
              </p>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-700">
                  <Award className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><b>{clinician.experience_years} Years</b> Exp.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-700">
                  <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{clinician.languages}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Hours: {clinician.availability_hours}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Consultation Slot Available</span>
              <button
                onClick={() => handleOpenBooking(clinician)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                {t('bookSlot')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Booking Modal */}
      {selectedClinician && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedClinician(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Clinical Consultation Booking
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Appointment with {selectedClinician.full_name}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedClinician.specialty}
              </p>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">
                  {t('bookingConfirmed')}
                </h4>
                <p className="text-xs text-slate-500">
                  Redirecting to your patient dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {t('selectDate')}
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {t('selectTimeSlot')}
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                            selectedSlot === slot
                              ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
                      No slots available for this date. Please pick another date.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Reason for Consultation
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 text-slate-900"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClinician(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSlot}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs disabled:opacity-50"
                  >
                    {bookingLoading ? 'Reserving...' : t('confirmBooking')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
