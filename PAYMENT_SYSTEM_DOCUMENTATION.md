# SMIS Payment Management System

## Overview
The SMIS Payment Management System is a comprehensive solution for handling student payments, processing transactions, and managing payment plans. It integrates with PayHere payment gateway for secure online payments.

## Database Schema

### Tables Created

#### 1. `fee_structure`
Defines fee structure for different programs:
- `id` (UUID): Primary key
- `program_id` (UUID): Reference to programs table
- `fee_type` (VARCHAR): Type of fee (registration, tuition_semester, etc.)
- `amount` (DECIMAL): Fee amount
- `currency` (VARCHAR): Currency code (default: LKR)
- `is_mandatory` (BOOLEAN): Whether fee is mandatory
- `description` (TEXT): Fee description

#### 2. `payment_plans`
Manages student payment plans:
- `id` (UUID): Primary key
- `student_id` (UUID): Reference to students table
- `program_id` (UUID): Reference to programs table
- `total_amount` (DECIMAL): Total amount to be paid
- `paid_amount` (DECIMAL): Amount already paid
- `remaining_amount` (DECIMAL): Remaining amount
- `plan_type` (VARCHAR): Payment plan type (full, installment)
- `installments` (INTEGER): Number of installments
- `status` (VARCHAR): Plan status (active, completed, overdue)

#### 3. `payment_transactions`
Enhanced transaction tracking:
- `id` (UUID): Primary key
- `student_id` (UUID): Reference to students table
- `payment_plan_id` (UUID): Reference to payment_plans table
- `transaction_id` (VARCHAR): Unique transaction identifier
- `amount` (DECIMAL): Transaction amount
- `currency` (VARCHAR): Currency code
- `payment_method` (VARCHAR): Payment method (card, bank_transfer, cash, online)
- `payment_gateway` (VARCHAR): Gateway used (stripe, payhere, manual)
- `gateway_transaction_id` (VARCHAR): Gateway-specific transaction ID
- `status` (VARCHAR): Transaction status (pending, completed, failed, refunded)
- `payment_date` (TIMESTAMPTZ): Payment date
- `receipt_number` (VARCHAR): Receipt number
- `receipt_url` (TEXT): Receipt URL
- `description` (TEXT): Transaction description
- `metadata` (JSONB): Additional metadata

## Fee Structure

### Program-based Fees
- **Higher Diploma Programs**: 
  - Registration: LKR 25,000
  - Tuition per semester: LKR 125,000
- **3-Year Degree Programs**:
  - Registration: LKR 30,000
  - Tuition per semester: LKR 150,000
- **4-Year Degree Programs**:
  - Registration: LKR 35,000
  - Tuition per semester: LKR 175,000

## Components

### 1. PaymentManagement.jsx
Main component for payment management:
- **Pending Payments Tab**: Shows students with outstanding payments
- **Recent Transactions Tab**: Displays transaction history
- **Payment Processing**: Handles payment workflow
- **Receipt Generation**: Creates and displays payment receipts

### 2. PaymentGateway.jsx
PayHere integration component:
- **Payment Processing**: Handles PayHere payment flow
- **Demo Mode**: Simulates payments when PayHere is not available
- **Error Handling**: Manages payment failures and cancellations
- **Security**: Implements basic hash generation (should be server-side in production)

## Features

### Payment Management
1. **Pending Payments View**
   - Visual progress bars showing payment completion
   - Student information and program details
   - Remaining balance calculations
   - Quick payment initiation

2. **Transaction History**
   - Comprehensive transaction listing
   - Status tracking (Completed, Pending, Failed)
   - Receipt generation and viewing
   - Payment method tracking

3. **Payment Processing**
   - Multi-step payment workflow
   - Amount validation
   - PayHere gateway integration
   - Real-time status updates

4. **Receipt System**
   - Automatic receipt generation
   - Printable receipt format
   - Transaction reference tracking
   - ICBT branding

### Payment Gateway Integration
1. **PayHere Integration**
   - Sandbox and production modes
   - Multiple payment methods (Cards, Bank Transfer)
   - Secure payment processing
   - Callback handling

2. **Demo Mode**
   - 80% success rate simulation
   - Realistic payment flow
   - Error scenario testing
   - Development-friendly

## Workflow

### Student Payment Process
1. **Payment Plan Creation**: Automatic creation when student enrolls
2. **Payment Initiation**: Staff or student initiates payment
3. **Amount Selection**: Choose full or partial payment
4. **Gateway Processing**: PayHere handles secure payment
5. **Database Update**: Payment plan and transaction records updated
6. **Receipt Generation**: Automatic receipt creation
7. **Notification**: Success/failure notification

### Database Updates
1. **Payment Plan Update**: Paid amount and remaining balance
2. **Transaction Record**: Complete transaction details
3. **Student Payments**: Legacy compatibility record
4. **Status Management**: Plan status (active/completed)

## Security Considerations

### Current Implementation
- Basic hash generation for PayHere
- Client-side payment processing
- Demo mode for development

### Production Recommendations
1. **Server-side Hash Generation**: Move hash calculation to backend
2. **Webhook Verification**: Implement PayHere webhook verification
3. **Payment Validation**: Server-side payment verification
4. **Audit Logging**: Comprehensive payment audit trails
5. **Encryption**: Sensitive data encryption
6. **Rate Limiting**: Payment attempt rate limiting

## Configuration

### PayHere Settings
```javascript
const PAYHERE_CONFIG = {
  sandbox: true, // Set to false for production
  merchant_id: "1221149", // Replace with actual merchant ID
  return_url: window.location.origin + "/payment-success",
  cancel_url: window.location.origin + "/payment-cancel",
  notify_url: window.location.origin + "/payment-notify"
};
```

### Environment Variables (Recommended)
```
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_SANDBOX=true
PAYHERE_SECRET=your_secret_key
```

## API Endpoints (Future Implementation)

### Recommended Backend Endpoints
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - PayHere webhook
- `GET /api/payments/receipt/:id` - Get receipt
- `GET /api/payments/history/:studentId` - Payment history

## Testing

### Test Scenarios
1. **Successful Payment**: Full payment processing
2. **Partial Payment**: Installment payments
3. **Payment Failure**: Error handling
4. **Payment Cancellation**: User cancellation
5. **Receipt Generation**: Receipt creation and printing
6. **Database Consistency**: Data integrity checks

### Test Data
- 6 active students with payment plans
- Various payment amounts and statuses
- Different program fee structures
- Historical transaction data

## Monitoring and Analytics

### Key Metrics
- Payment success rate
- Average payment amount
- Payment method preferences
- Outstanding balances
- Revenue tracking

### Reports (Future Enhancement)
- Daily payment summary
- Monthly revenue reports
- Outstanding payments report
- Payment method analytics
- Student payment history

## Maintenance

### Regular Tasks
1. **Database Cleanup**: Archive old transactions
2. **Receipt Backup**: Backup receipt data
3. **Payment Reconciliation**: Match gateway records
4. **Status Updates**: Update overdue payments
5. **Performance Monitoring**: Monitor payment processing speed

### Troubleshooting
1. **Payment Failures**: Check gateway logs
2. **Database Issues**: Verify data consistency
3. **Receipt Problems**: Check receipt generation
4. **Gateway Issues**: Verify PayHere configuration

## Future Enhancements

### Planned Features
1. **Automated Reminders**: Payment due notifications
2. **Payment Plans**: Flexible installment options
3. **Bulk Payments**: Process multiple payments
4. **Mobile App**: Mobile payment interface
5. **Advanced Analytics**: Payment insights and trends
6. **Multi-currency**: Support for multiple currencies
7. **Refund Management**: Handle payment refunds
8. **Integration APIs**: Third-party integrations

### Technical Improvements
1. **Real-time Updates**: WebSocket payment updates
2. **Offline Support**: Offline payment recording
3. **Performance Optimization**: Faster payment processing
4. **Enhanced Security**: Advanced security measures
5. **Scalability**: Handle high payment volumes

## Support and Documentation

### User Guides
- Payment processing guide for staff
- Student payment instructions
- Receipt management procedures
- Troubleshooting common issues

### Technical Documentation
- Database schema documentation
- API documentation
- Integration guides
- Security best practices

---

**Note**: This system is currently in development mode with demo payment processing. For production deployment, implement proper security measures, server-side validation, and PayHere webhook verification. 