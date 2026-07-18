const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'cancelled'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// Index for common query patterns: browsing published events by date
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
