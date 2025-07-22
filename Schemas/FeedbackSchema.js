import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  // Basic Information
  feedbackGiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    description: 'User who provided the feedback'
  },
  
  // Simple Ratings (1-5 stars)
  overallExperience: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: 'Overall experience rating out of 5 stars'
  },
  
  salesPersonBehavior: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: 'Sales person behavior rating out of 5 stars'
  },
  
  companyRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: 'Company rating out of 5 stars'
  },
  
  // Simple Feedback Text
  whatUserLiked: {
    type: String,
    required: true,
    maxlength: 500,
    description: 'What the user liked about the service'
  },
  
  whatToImprove: {
    type: String,
    required: false,
    maxlength: 500,
    description: 'What can be improved'
  },
  
  // Optional additional comment
  additionalComment: {
    type: String,
    required: false,
    maxlength: 1000,
    description: 'Any additional comments'
  },
  
  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false,
    description: 'Whether feedback was submitted anonymously'
  },
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'addressed', 'closed'],
    default: 'pending',
    description: 'Status of the feedback'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    description: 'Priority level of the feedback'
  },
  
  // Admin Response
  adminResponse: {
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    response: {
      type: String,
      maxlength: 1000
    },
    respondedAt: {
      type: Date
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Audit Fields
  createdByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  
  updatedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
FeedbackSchema.index({ feedbackGiverUserId: 1 });
FeedbackSchema.index({ overallExperience: 1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ priority: 1 });

// Virtual for average rating
FeedbackSchema.virtual('averageRating').get(function() {
  return (this.overallExperience + this.salesPersonBehavior + this.companyRating) / 3;
});

// Pre-save middleware to update timestamps
FeedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const FeedbackModel = mongoose.model('Feedback', FeedbackSchema);
export default FeedbackModel; 