# SMIS System Design Document

## Executive Summary

The Student Management Information System (SMIS) is designed as a modern, scalable web application that serves educational institutions in managing their complete student lifecycle. This document outlines the system's architecture, design decisions, and technical implementation strategy.

## System Overview

### Vision Statement
To provide a comprehensive, user-friendly platform that streamlines educational institution operations while maintaining data security, payment processing integrity, and role-based access control.

### Key Design Principles
1. **Scalability**: Horizontal scaling capabilities with microservices architecture
2. **Security**: Multi-layered security with RBAC and data encryption
3. **Usability**: Intuitive UI/UX with responsive design
4. **Maintainability**: Clean code architecture with comprehensive documentation
5. **Performance**: Optimized for fast load times and real-time updates

---

## Detailed System Architecture

### System Context Diagram

```mermaid
graph TB
    subgraph "Users"
        STUDENT[Student]
        COUNSELOR[Counselor]
        MARKETING[Marketing Staff]
        MANAGER[Manager]
    end
    
    subgraph "SMIS Core System"
        WEBAPP[Web Application]
        API[API Layer]
        DATABASE[(Database)]
        AUTH[Authentication]
    end
    
    subgraph "External Services"
        PAYHERE[PayHere Gateway]
        EMAIL[Email Service]
        SMS[SMS Service]
    end
    
    STUDENT --> WEBAPP
    COUNSELOR --> WEBAPP
    MARKETING --> WEBAPP
    MANAGER --> WEBAPP
    
    WEBAPP --> API
    API --> AUTH
    API --> DATABASE
    
    API --> PAYHERE
    API --> EMAIL
    API --> SMS
```

### Component Architecture

```mermaid
graph LR
    subgraph "Frontend Layer"
        PAGES[Pages]
        COMPONENTS[Components]
        HOOKS[Custom Hooks]
    end
    
    subgraph "State Management"
        CONTEXTS[Context Providers]
        STORAGE[Local Storage]
        CACHE[Client Cache]
    end
    
    subgraph "Backend Services"
        SUPABASE[Supabase API]
        REALTIME[Real-time Updates]
        FUNCTIONS[Edge Functions]
    end
    
    PAGES --> COMPONENTS
    COMPONENTS --> HOOKS
    HOOKS --> CONTEXTS
    CONTEXTS --> STORAGE
    CONTEXTS --> CACHE
    
    COMPONENTS --> SUPABASE
    SUPABASE --> REALTIME
    SUPABASE --> FUNCTIONS
```

---

## Detailed Workflow Sequences

### Complete Student Enrollment Process

```mermaid
sequenceDiagram
    participant S as Student
    participant UI as Web Interface
    participant AUTH as Auth Service
    participant DB as Database
    participant PAYMENT as Payment Service
    participant PAYHERE as PayHere Gateway
    participant EMAIL as Email Service
    participant C as Counselor
    participant M as Manager

    Note over S,M: Initial Inquiry Phase
    S->>UI: Submit inquiry form
    UI->>DB: Save inquiry data
    DB->>EMAIL: Trigger inquiry notification
    EMAIL->>C: Send new inquiry email
    
    Note over S,M: Counselor Follow-up
    C->>UI: Login to system
    UI->>AUTH: Validate credentials
    AUTH->>UI: Return user token
    C->>UI: View assigned inquiries
    UI->>DB: Fetch inquiry data
    C->>UI: Convert inquiry to student
    UI->>DB: Create student record
    
    Note over S,M: Program Assignment
    C->>UI: Request program assignment
    UI->>M: Notify manager (real-time)
    M->>UI: Login to system
    M->>UI: Assign program and batch
    UI->>DB: Update student with program
    DB->>DB: Calculate payment plan
    DB->>EMAIL: Send enrollment details
    EMAIL->>S: Send program information
    
    Note over S,M: Payment Processing
    S->>UI: Access payment portal
    UI->>AUTH: Validate student session
    S->>UI: Select payment amount
    UI->>PAYMENT: Create payment intent
    PAYMENT->>DB: Record payment initiation
    PAYMENT->>PAYHERE: Generate payment URL
    PAYHERE->>S: Display payment form
    S->>PAYHERE: Submit payment details
    PAYHERE->>PAYMENT: Payment callback
    PAYMENT->>DB: Update payment status
    DB->>EMAIL: Send payment confirmation
    EMAIL->>S: Payment receipt
    EMAIL->>M: Payment notification
```

### Advanced Payment Reconciliation Workflow

```mermaid
sequenceDiagram
    participant CRON as Scheduled Job
    participant PAYMENT as Payment Service
    participant DB as Database
    participant PAYHERE as PayHere API
    participant WEBHOOK as Webhook Handler
    participant AUDIT as Audit Logger
    participant EMAIL as Email Service
    participant MANAGER as Manager

    Note over CRON,MANAGER: Daily Reconciliation Process
    CRON->>PAYMENT: Trigger daily reconciliation
    PAYMENT->>DB: Fetch pending transactions
    
    loop For each pending transaction
        PAYMENT->>PAYHERE: Query transaction status
        PAYHERE->>PAYMENT: Return current status
        
        alt Payment Confirmed
            PAYMENT->>DB: Update to completed
            PAYMENT->>AUDIT: Log status change
            PAYMENT->>EMAIL: Send confirmation
        else Payment Failed
            PAYMENT->>DB: Update to failed
            PAYMENT->>AUDIT: Log failure
            PAYMENT->>EMAIL: Send failure notice
        else Payment Still Pending
            PAYMENT->>AUDIT: Log pending status
        end
    end
    
    Note over CRON,MANAGER: Exception Handling
    PAYMENT->>DB: Identify discrepancies
    alt Critical discrepancies found
        PAYMENT->>EMAIL: Alert finance team
        EMAIL->>MANAGER: Send urgent notification
        PAYMENT->>AUDIT: Log critical alert
    end
```

---

## Data Architecture

### Database Design

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
        string status
        timestamp payment_date
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
```

### Data Flow Architecture

```mermaid
flowchart TD
    subgraph "Data Sources"
        USER_INPUT[User Input Forms]
        PAYMENT_GATEWAY[Payment Gateway Webhooks]
        EXTERNAL_APIs[External API Integrations]
    end
    
    subgraph "Data Processing"
        VALIDATION[Data Validation]
        BUSINESS_LOGIC[Business Logic Engine]
        AUDIT_LOGGER[Audit Logger]
    end
    
    subgraph "Data Storage"
        POSTGRES[(PostgreSQL)]
        REDIS_CACHE[(Redis Cache)]
        FILE_STORAGE[(File Storage)]
    end
    
    subgraph "Application Layer"
        REACT_APP[React Application]
        API_SERVICES[API Services]
        ANALYTICS_ENGINE[Analytics Engine]
    end
    
    USER_INPUT --> VALIDATION
    PAYMENT_GATEWAY --> VALIDATION
    EXTERNAL_APIs --> VALIDATION
    
    VALIDATION --> BUSINESS_LOGIC
    BUSINESS_LOGIC --> AUDIT_LOGGER
    
    BUSINESS_LOGIC --> POSTGRES
    BUSINESS_LOGIC --> REDIS_CACHE
    BUSINESS_LOGIC --> FILE_STORAGE
    
    API_SERVICES --> POSTGRES
    REACT_APP --> API_SERVICES
    ANALYTICS_ENGINE --> POSTGRES
```

---

## Security Architecture

### Multi-Layer Security Model

```mermaid
graph TB
    subgraph "Network Security"
        FIREWALL[Firewall]
        DDoS[DDoS Protection]
        CDN[Content Delivery Network]
    end
    
    subgraph "Application Security"
        WAF[Web Application Firewall]
        RATE_LIMITER[Rate Limiting]
        INPUT_VALIDATION[Input Validation]
    end
    
    subgraph "Authentication & Authorization"
        JWT_AUTH[JWT Authentication]
        RBAC[Role-Based Access Control]
        MFA[Multi-Factor Authentication]
    end
    
    subgraph "Data Security"
        ENCRYPTION[Data Encryption]
        RLS[Row Level Security]
        AUDIT_TRAIL[Audit Trail]
    end
    
    FIREWALL --> WAF
    DDoS --> RATE_LIMITER
    CDN --> INPUT_VALIDATION
    
    WAF --> JWT_AUTH
    RATE_LIMITER --> RBAC
    INPUT_VALIDATION --> MFA
    
    JWT_AUTH --> ENCRYPTION
    RBAC --> RLS
    MFA --> AUDIT_TRAIL
```

### Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Authenticating: Login Attempt
    Authenticating --> Authenticated: Valid Credentials
    Authenticating --> Unauthenticated: Invalid Credentials
    
    Authenticated --> Authorized: Role Check Passed
    Authenticated --> Unauthorized: Insufficient Permissions
    
    Authorized --> SessionActive: Access Granted
    Unauthorized --> Unauthenticated: Access Denied
    
    SessionActive --> TokenRefresh: Token Near Expiry
    TokenRefresh --> SessionActive: Token Refreshed
    TokenRefresh --> Unauthenticated: Refresh Failed
    
    SessionActive --> Unauthenticated: Logout
    SessionActive --> Unauthenticated: Session Timeout
```

---

## Performance Architecture

### Caching Strategy

```mermaid
graph TB
    subgraph "Client-Side Caching"
        BROWSER_CACHE[Browser Cache]
        LOCAL_STORAGE[Local Storage]
        SESSION_STORAGE[Session Storage]
    end
    
    subgraph "CDN Layer"
        STATIC_ASSETS[Static Assets CDN]
        API_CACHE[API Response CDN]
    end
    
    subgraph "Application Caching"
        REDIS_L1[Redis L1 Cache]
        MEMORY_CACHE[In-Memory Cache]
    end
    
    subgraph "Database Caching"
        QUERY_CACHE[Query Result Cache]
        READ_REPLICAS[Read Replicas]
    end
    
    BROWSER_CACHE --> STATIC_ASSETS
    LOCAL_STORAGE --> API_CACHE
    
    STATIC_ASSETS --> MEMORY_CACHE
    API_CACHE --> REDIS_L1
    
    REDIS_L1 --> QUERY_CACHE
    QUERY_CACHE --> READ_REPLICAS
```

---

## Deployment Architecture

### CI/CD Pipeline

```mermaid
graph LR
    subgraph "Development"
        DEV[Developer]
        LOCAL[Local Testing]
    end
    
    subgraph "Source Control"
        GIT[Git Repository]
        PR[Pull Request]
    end
    
    subgraph "CI Pipeline"
        BUILD[Build Process]
        TEST[Automated Testing]
        SCAN[Security Scanning]
    end
    
    subgraph "CD Pipeline"
        STAGING[Staging Deploy]
        PROD_DEPLOY[Production Deploy]
        MONITORING[Post-Deploy Monitoring]
    end
    
    DEV --> LOCAL
    LOCAL --> GIT
    GIT --> PR
    PR --> BUILD
    BUILD --> TEST
    TEST --> SCAN
    SCAN --> STAGING
    STAGING --> PROD_DEPLOY
    PROD_DEPLOY --> MONITORING
```

---

## Scalability Considerations

### Horizontal Scaling Strategy

```mermaid
graph TB
    subgraph "Load Distribution"
        USERS[Users] --> LB[Load Balancer]
        LB --> APP1[App Server 1]
        LB --> APP2[App Server 2]
        LB --> APP3[App Server 3]
    end
    
    subgraph "Database Scaling"
        APP1 --> MASTER[(Master DB)]
        APP2 --> REPLICA1[(Read Replica 1)]
        APP3 --> REPLICA2[(Read Replica 2)]
        
        MASTER --> REPLICA1
        MASTER --> REPLICA2
    end
    
    subgraph "Service Scaling"
        PAYMENT_SVC[Payment Service]
        NOTIFICATION_SVC[Notification Service]
        ANALYTICS_SVC[Analytics Service]
    end
    
    APP1 --> PAYMENT_SVC
    APP2 --> NOTIFICATION_SVC
    APP3 --> ANALYTICS_SVC
```

---

## Monitoring & Observability

### Monitoring Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        REACT_APP[React Application]
        API_SERVICES[API Services]
    end
    
    subgraph "Monitoring Agents"
        APM_AGENT[APM Agent]
        LOG_AGENT[Log Agent]
        METRICS_AGENT[Metrics Agent]
    end
    
    subgraph "Data Collection"
        LOG_AGGREGATOR[Log Aggregator]
        METRICS_COLLECTOR[Metrics Collector]
    end
    
    subgraph "Visualization"
        DASHBOARD[Monitoring Dashboard]
        ALERTS[Alert Manager]
    end
    
    REACT_APP --> APM_AGENT
    API_SERVICES --> APM_AGENT
    
    APM_AGENT --> LOG_AGENT
    APM_AGENT --> METRICS_AGENT
    
    LOG_AGENT --> LOG_AGGREGATOR
    METRICS_AGENT --> METRICS_COLLECTOR
    
    LOG_AGGREGATOR --> DASHBOARD
    METRICS_COLLECTOR --> DASHBOARD
    
    DASHBOARD --> ALERTS
```

---

## Technology Stack Summary

| Layer | Technology | Purpose | Version |
|-------|------------|---------|---------|
| **Frontend** | React | UI Framework | 18.2.0 |
| **Build Tool** | Vite | Development Server | 5.0.8 |
| **Styling** | Tailwind CSS | CSS Framework | 3.4.17 |
| **UI Library** | Ant Design | Component Library | 5.26.0 |
| **State Management** | React Context | State Management | Built-in |
| **Backend** | Supabase | BaaS Platform | 2.50.0 |
| **Database** | PostgreSQL | Relational Database | 15+ |
| **Authentication** | Supabase Auth | Auth Service | Built-in |
| **Payment** | PayHere | Payment Gateway | API v2 |
| **Hosting** | GitHub Pages | Static Hosting | - |

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Database Performance** | High | Medium | Query optimization, indexing, read replicas |
| **Payment Gateway Failures** | High | Low | Fallback mechanisms, retry logic, monitoring |
| **Security Vulnerabilities** | Critical | Low | Regular security audits, dependency updates |
| **Scalability Issues** | Medium | Medium | Load testing, auto-scaling, performance monitoring |
| **Data Loss** | Critical | Very Low | Regular backups, point-in-time recovery |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **User Adoption** | High | Medium | User training, intuitive design, support |
| **Compliance Issues** | High | Low | Regular compliance audits, documentation |
| **Vendor Lock-in** | Medium | Medium | API abstraction layers, exit strategies |
| **Budget Overrun** | Medium | Medium | Regular cost monitoring, optimization |

---

## Future Roadmap

### Phase 1: Foundation (Current)
- Core student management functionality
- Basic payment processing
- Role-based access control
- Essential reporting

### Phase 2: Enhancement (Q2 2024)
- Advanced analytics dashboard
- Mobile application
- API for third-party integrations
- Enhanced notification system

### Phase 3: Scale (Q4 2024)
- Multi-tenancy support
- Advanced reporting engine
- AI-powered insights
- Workflow automation

### Phase 4: Innovation (2025)
- Machine learning integration
- Predictive analytics
- IoT device integration
- Advanced communication tools

---

*This system design document serves as the comprehensive technical blueprint for the SMIS platform. It is maintained by the Architecture Team and updated with each major release.* 