# SMIS Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Design](#database-design)
3. [API Specifications](#api-specifications)
4. [Security Implementation](#security-implementation)
5. [Payment Integration](#payment-integration)
6. [Deployment Guide](#deployment-guide)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Logging](#monitoring--logging)

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOB[Mobile Browser]
    end
    
    subgraph "Application Layer"
        LB[Load Balancer]
        APP[React Application]
        CDN[Content Delivery Network]
    end
    
    subgraph "Service Layer"
        AUTH[Authentication Service]
        PAY[Payment Service]
        NOTIF[Notification Service]
        REPORT[Reporting Service]
    end
    
    subgraph "Data Layer"
        DB[(Supabase PostgreSQL)]
        CACHE[(Redis Cache)]
        FILES[(File Storage)]
    end
    
    subgraph "External Services"
        PAYHERE[PayHere Gateway]
        EMAIL[Email Provider]
        SMS[SMS Provider]
    end
    
    WEB --> LB
    MOB --> LB
    LB --> APP
    APP --> CDN
    APP --> AUTH
    APP --> PAY
    APP --> NOTIF
    APP --> REPORT
    AUTH --> DB
    PAY --> DB
    PAY --> PAYHERE
    NOTIF --> EMAIL
    NOTIF --> SMS
    REPORT --> DB
    DB --> CACHE
    APP --> FILES
```

### Component Architecture

```mermaid
graph LR
    subgraph "Presentation Layer"
        PAGES[Pages]
        COMPONENTS[Components]
        HOOKS[Custom Hooks]
    end
    
    subgraph "Business Logic Layer"
        CONTEXTS[Context Providers]
        SERVICES[Services]
        UTILS[Utilities]
    end
    
    subgraph "Data Access Layer"
        SUPABASE[Supabase Client]
        STORAGE[Local Storage]
        CACHE[Client Cache]
    end
    
    PAGES --> COMPONENTS
    COMPONENTS --> HOOKS
    HOOKS --> CONTEXTS
    CONTEXTS --> SERVICES
    SERVICES --> UTILS
    SERVICES --> SUPABASE
    SERVICES --> STORAGE
    SERVICES --> CACHE
```

---

## Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ STUDENTS : manages
    USERS {
        uuid id PK
        string email
        string role
        timestamp created_at
        timestamp updated_at
    }
    
    STUDENTS ||--o{ ENROLLMENTS : has
    STUDENTS ||--o{ PAYMENT_PLANS : has
    STUDENTS {
        uuid id PK
        string student_id UK
        string full_name
        string email
        string phone
        string address
        uuid counselor_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    PROGRAMS ||--o{ ENROLLMENTS : includes
    PROGRAMS ||--o{ BATCHES : has
    PROGRAMS ||--o{ FEE_STRUCTURE : defines
    PROGRAMS {
        uuid id PK
        string program_code UK
        string program_name
        string description
        integer duration_months
        string level
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    BATCHES ||--o{ ENROLLMENTS : contains
    BATCHES {
        uuid id PK
        string batch_code UK
        uuid program_id FK
        date start_date
        date end_date
        integer capacity
        integer enrolled_count
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    ENROLLMENTS {
        uuid id PK
        uuid student_id FK
        uuid program_id FK
        uuid batch_id FK
        date enrollment_date
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    FEE_STRUCTURE ||--o{ PAYMENT_PLANS : basis
    FEE_STRUCTURE {
        uuid id PK
        uuid program_id FK
        string fee_type
        decimal amount
        string currency
        boolean is_mandatory
        text description
    }
    
    PAYMENT_PLANS ||--o{ PAYMENT_TRANSACTIONS : generates
    PAYMENT_PLANS {
        uuid id PK
        uuid student_id FK
        uuid program_id FK
        decimal total_amount
        decimal paid_amount
        decimal remaining_amount
        string plan_type
        integer installments
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENT_TRANSACTIONS {
        uuid id PK
        uuid student_id FK
        uuid payment_plan_id FK
        string transaction_id UK
        decimal amount
        string currency
        string payment_method
        string payment_gateway
        string gateway_transaction_id
        string status
        timestamp payment_date
        string receipt_number
        text receipt_url
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
```

---

## API Specifications

### Authentication Endpoints

```javascript
// Login
POST /auth/v1/token
Content-Type: application/json
{
    "email": "user@example.com",
    "password": "password123"
}

// Response
{
    "access_token": "jwt_token",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "role": "manager"
    }
}
```

### Student Management API

```javascript
// Create Student
POST /rest/v1/students
Authorization: Bearer jwt_token
Content-Type: application/json
{
    "student_id": "STU001",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+94712345678",
    "address": "123 Main St, Colombo",
    "counselor_id": "uuid"
}

// Get Students
GET /rest/v1/students?select=*,programs(*),batches(*)
Authorization: Bearer jwt_token

// Update Student
PATCH /rest/v1/students?id=eq.uuid
Authorization: Bearer jwt_token
Content-Type: application/json
{
    "full_name": "John Smith",
    "phone": "+94712345679"
}
```

---

## Security Implementation

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Service
    participant DB as Database
    participant R as Resource Server

    C->>A: Login Request
    A->>DB: Validate Credentials
    DB->>A: User Data
    A->>A: Generate JWT
    A->>C: JWT Token
    
    Note over C,A: Subsequent Requests
    C->>R: API Request + JWT
    R->>A: Validate JWT
    A->>R: Token Valid
    R->>DB: Query Data
    DB->>R: Return Data
    R->>C: API Response
```

### Role-Based Access Control

```javascript
// Role Definitions
const ROLES = {
  MANAGER: {
    permissions: [
      'students:read',
      'students:write',
      'programs:read',
      'programs:write',
      'payments:read',
      'payments:write',
      'analytics:read'
    ]
  },
  MARKETING: {
    permissions: [
      'students:read',
      'students:write',
      'inquiries:read',
      'inquiries:write',
      'basic_analytics:read'
    ]
  },
  COUNSELOR: {
    permissions: [
      'students:read',
      'assigned_students:write',
      'inquiries:read',
      'inquiries:write'
    ]
  }
};
```

---

## Payment Integration

### PayHere Integration Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant B as Backend
    participant P as PayHere
    participant W as Webhook

    S->>F: Initiate Payment
    F->>B: Create Payment Intent
    B->>B: Generate Hash
    B->>F: Payment Parameters
    F->>P: Redirect to PayHere
    P->>S: Payment Form
    S->>P: Submit Payment
    P->>W: Payment Notification
    W->>B: Verify & Update
    P->>F: Return to App
    F->>B: Check Payment Status
    B->>F: Payment Confirmed
    F->>S: Show Success
```

### Payment Configuration

```javascript
// PayHere Configuration
const paymentConfig = {
  sandbox: process.env.NODE_ENV !== 'production',
  merchant_id: process.env.PAYHERE_MERCHANT_ID,
  merchant_secret: process.env.PAYHERE_MERCHANT_SECRET,
  currency: 'LKR',
  return_url: `${process.env.APP_URL}/payment/success`,
  cancel_url: `${process.env.APP_URL}/payment/cancel`,
  notify_url: `${process.env.API_URL}/webhooks/payhere`
};
```

---

## Deployment Guide

### Environment Setup

```bash
# Production Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYHERE_MERCHANT_ID=your-merchant-id
VITE_PAYHERE_SANDBOX=false
VITE_APP_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

### Build Process

```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Build for production
npm run build

# Preview build
npm run preview
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Performance Optimization

### Bundle Optimization

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
          charts: ['recharts'],
          router: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
```

### Database Optimization

```sql
-- Index creation for performance
CREATE INDEX idx_students_counselor_id ON students(counselor_id);
CREATE INDEX idx_payment_transactions_student_id ON payment_transactions(student_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_enrollments_program_batch ON enrollments(program_id, batch_id);
```

---

## Monitoring & Logging

### Application Monitoring

```javascript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
    
    if (process.env.NODE_ENV === 'production') {
      this.logError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Performance Monitoring

```javascript
// Performance tracking
const trackPerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      console.log(`${name} executed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${name} failed after ${duration}ms:`, error);
      throw error;
    }
  };
};
```

---

*This technical documentation is maintained by the SMIS Development Team and updated regularly to reflect the latest system changes and improvements.* 