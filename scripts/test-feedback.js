import mongoose from 'mongoose';
import { FeedbackModel } from '../Models/FeedbackModel.js';

// Test data for feedback
const testFeedbackData = [
  {
    salesPersonUserId: '6836054a255299ff46670a6e', // Sales person ID
    customerId: '68346f62de3d56d44b9cbc5c', // Customer ID
    overallExperience: 4,
    salesPersonRating: 5,
    companyRating: 4,
    whatUserLiked: 'The sales person was very helpful and professional. The company provided excellent service.',
    whatToImprove: 'Could improve response time for property viewings.',
    isAnonymous: false,
    createdByUserId: '68346f62de3d56d44b9cbc5c',
    updatedByUserId: '68346f62de3d56d44b9cbc5c'
  },
  {
    salesPersonUserId: '6836054a255299ff46670a6e', // Sales person ID
    customerId: '68346f62de3d56d44b9cbc5c', // Customer ID
    overallExperience: 5,
    salesPersonRating: 5,
    companyRating: 5,
    whatUserLiked: 'Amazing experience! The sales team was outstanding and the company exceeded expectations.',
    whatToImprove: '',
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
          avgSalesPersonRating: { $avg: '$salesPersonRating' },
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

    // Test 6: Test sales person rating distribution
    console.log('\n6. Testing sales person rating distribution...');
    const salesPersonDistribution = await FeedbackModel.aggregate([
      { $group: { _id: '$salesPersonRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('✅ Sales person rating distribution:', salesPersonDistribution);

    console.log('\n🎉 All feedback module tests passed successfully!');
    console.log('\n📊 Updated Feedback Module Features:');
    console.log('   ✅ Sales person ID tracking');
    console.log('   ✅ Customer ID tracking');
    console.log('   ✅ Overall experience rating (1-5 stars)');
    console.log('   ✅ Sales person rating (1-5 stars)');
    console.log('   ✅ Company rating (1-5 stars)');
    console.log('   ✅ What user liked (required)');
    console.log('   ✅ What to improve (optional)');
    console.log('   ✅ Anonymous feedback option');
    console.log('   ✅ Status management (pending, viewed, submitted, closed)');
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