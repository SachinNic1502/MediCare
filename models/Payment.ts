import mongoose, { Schema, Document, models } from 'mongoose';

interface IPayment extends Document {
  appointmentId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

const PaymentSchema = new Schema<IPayment>({
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  }
});

// Add pre-save middleware
PaymentSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}

const Payment = mongoose.model('Payment', PaymentSchema);

export { Payment };
