const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const scheduleSchema = {
    title: { type: String, required: true },
    message: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Projects', required: false },
    scheduledDate: { type: Date, required: true },
    attachments: [{
      fileName: { type: String },
      fileUrl: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: ObjectId, ref: 'Users', required: true }
  };

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;