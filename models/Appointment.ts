import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    trim: true,
  },
  symptoms: [{
    type: String,
    trim: true,
  }],
  diagnosis: {
    type: String,
    trim: true,
  },
  prescription: {
    type: String,
    trim: true,
  },
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

appointmentSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 });

if (mongoose.models.Appointment) {
  delete mongoose.models.Appointment;
}

export const Appointment = mongoose.model('Appointment', appointmentSchema);
