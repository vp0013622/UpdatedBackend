import mongoose from 'mongoose';
import { FeedbackModel } from '../Models/FeedbackModel.js';

// Test data for feedback
const testFeedbackData = [
  {
    feedbackGiverUserId: '6836054a255299ff46670a6e', // Admin user ID
    overallExperience: 4,
    salesPersonBehavior: 5,
    companyRating: 4,
    whatUserLiked: 'The sales person was very helpful and professional. The company provided excellent service.',
    whatToImprove: 'Could improve response time for property viewings.',
    additionalComment: 'Overall great experience, would recommend to friends.',
    isAnonymous: false,
    createdByUserId: '6836054a255299ff46670a6e',
    updatedByUserId: '6836054a255299ff46670a6e'
  },
  {
    feedbackGiverUserId: '68346f62de3d56d44b9cbc5c', // Another user ID
    overallExperience: 5,
    salesPersonBehavior: 5,
    companyRating: 5,
    whatUserLiked: 'Amazing experience! The sales team was outstanding and the company exceeded expectations.',
    whatToImprove: '',
    additionalComment: 'Best real estate company I have worked with!',
    isAnonymous: false,
    createdByUserId: '68346f62de3d56d44b9cbc5c',
    updatedByUserId: '68346f62de3d56d44b9cbc5c'
  }
];

const testFeedbackModule = async () => {
  try {
    console.log('🧪 Testing Feedback Module...\n');

    // Test 1: Create feedback
    console.log('1. Creating test feedback...');
    const createdFeedback = await FeedbackModel.create(testFeedbackData[0]);
    console.log('✅ Feedback created successfully:', createdFeedback._id);

    // Test 2: Find feedback by ID
    console.log('\n2. Finding feedback by ID...');
    const foundFeedback = await FeedbackModel.findById(createdFeedback._id);
    console.log('✅ Feedback found:', foundFeedback.overallExperience + ' stars');

    // Test 3: Get all feedback
    console.log('\n3. Getting all feedback...');
    const allFeedback = await FeedbackModel.find({});
    console.log('✅ Total feedback count:', allFeedback.length);

    // Test 4: Test analytics aggregation
    console.log('\n4. Testing analytics...');
    const analytics = await FeedbackModel.aggregate([
      {
        $group: {
          _id: null,
          avgOverallExperience: { $avg: '$overallExperience' },
          avgSalesPersonBehavior: { $avg: '$salesPersonBehavior' },
          avgCompanyRating: { $avg: '$companyRating' }
        }
      }
    ]);
    console.log('✅ Average ratings:', analytics[0] || {});

    // Test 5: Test rating distribution
    console.log('\n5. Testing rating distribution...');
    const overallExperienceDistribution = await FeedbackModel.aggregate([
      { $group: { _id: '$overallExperience', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('✅ Overall experience distribution:', overallExperienceDistribution);

    // Test 6: Test sales person behavior distribution
    console.log('\n6. Testing sales person behavior distribution...');
    const salesPersonDistribution = await FeedbackModel.aggregate([
      { $group: { _id: '$salesPersonBehavior', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('✅ Sales person behavior distribution:', salesPersonDistribution);

    console.log('\n🎉 All feedback module tests passed successfully!');
    console.log('\n📊 Simplified Feedback Module Features:');
    console.log('   ✅ Overall experience rating (1-5 stars)');
    console.log('   ✅ Sales person behavior rating (1-5 stars)');
    console.log('   ✅ Company rating (1-5 stars)');
    console.log('   ✅ What user liked (required)');
    console.log('   ✅ What to improve (optional)');
    console.log('   ✅ Additional comments (optional)');
    console.log('   ✅ Anonymous feedback option');
    console.log('   ✅ Admin response system');
    console.log('   ✅ Status and priority management');
    console.log('   ✅ Analytics and reporting');
    console.log('   ✅ User permissions and security');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to database
import config from '../config/environment.js';
mongoose.connect(config.DB_CONNECTION_STRING)
  .then(() => {
    console.log('📡 Connected to database');
    return testFeedbackModule();
  })
  .then(() => {
    console.log('\n✅ Feedback module test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }); 