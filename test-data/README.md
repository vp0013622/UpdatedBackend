# Rental Booking API Test Data

This directory contains test data and scripts to help you test the Rental Booking API endpoints.

## Files

- `rental-booking-test-data.json` - Sample JSON data for testing
- `../scripts/generate-test-booking.js` - Script to create real test data in your database

## Quick Start

### Option 1: Use the Script (Recommended)

The script will automatically find existing properties and users in your database and create a real rental booking record.

```bash
cd Backend/scripts
node generate-test-booking.js
```

This will:
1. Connect to your MongoDB database
2. Find existing properties, customers, and salespeople
3. Create a test rental booking with real IDs
4. Show you the created booking details
5. Provide sample cURL commands for testing

### Option 2: Manual Testing with Sample Data

Use the sample data from `rental-booking-test-data.json` but replace the ObjectIds with real ones from your database.

## Required Fields

When creating a rental booking, you need these fields:

```json
{
  "propertyId": "REAL_PROPERTY_ID",
  "customerId": "REAL_CUSTOMER_ID", 
  "assignedSalespersonId": "REAL_SALESPERSON_ID",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "monthlyRent": 2500,
  "rentDueDate": 5
}
```

## Optional Fields

```json
{
  "securityDeposit": 5000,
  "maintenanceCharges": 200,
  "advanceRent": 2,
  "lateFeePercentage": 5
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rental-booking/create` | Create new rental booking |
| GET | `/api/rental-booking/all` | Get all rental bookings |
| GET | `/api/rental-booking/:id` | Get specific rental booking |
| PUT | `/api/rental-booking/update/:id` | Update rental booking |
| DELETE | `/api/rental-booking/delete/:id` | Delete rental booking |
| POST | `/api/rental-booking/:id/record-rent-payment` | Record rent payment |
| GET | `/api/rental-booking/:id/rent-schedule` | Get rent schedule |
| PUT | `/api/rental-booking/:id/update-month-status` | Update month status |

## Testing with cURL

### Create a Rental Booking

```bash
curl -X POST http://localhost:3001/api/rental-booking/create \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "propertyId": "REAL_PROPERTY_ID",
    "customerId": "REAL_CUSTOMER_ID",
    "assignedSalespersonId": "REAL_SALESPERSON_ID",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "monthlyRent": 2500,
    "securityDeposit": 5000,
    "maintenanceCharges": 200,
    "advanceRent": 2,
    "rentDueDate": 5
  }'
```

### Get All Rental Bookings

```bash
curl -X GET http://localhost:3001/api/rental-booking/all \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Get Specific Rental Booking

```bash
curl -X GET http://localhost:3001/api/rental-booking/BOOKING_ID_HERE \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Prerequisites

Before testing, ensure you have:

1. **MongoDB running** and accessible
2. **Properties created** in your database
3. **Users created** (customers and salespeople)
4. **JWT token** for authentication
5. **Backend server running** on port 3001 (or your configured port)

## Getting Real IDs

To get real ObjectIds for testing:

1. **Properties**: Check your properties collection
2. **Users**: Check your users collection  
3. **Salespeople**: Check your users collection for users with sales roles

## Troubleshooting

### Common Issues

1. **"Property not found"** - Create a property first or use existing property ID
2. **"Customer not found"** - Create a user first or use existing user ID
3. **"Salesperson not found"** - Create a user with sales role or use existing user ID
4. **Authentication errors** - Ensure you have a valid JWT token
5. **Database connection issues** - Check your MongoDB connection string

### Validation Errors

The API validates:
- All required fields are present
- Property, customer, and salesperson exist
- Dates are valid
- Rent amounts are positive numbers
- Rent due date is between 1-31

## Next Steps

After creating a test booking:

1. Test the GET endpoints to retrieve the booking
2. Test the rent schedule endpoint
3. Test updating the booking
4. Test recording payments
5. Test the reporting endpoints

Happy testing! 🎉
