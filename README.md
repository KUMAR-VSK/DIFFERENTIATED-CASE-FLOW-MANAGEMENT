# Differentiated Case Flow Management System

A comprehensive, modern case management system built with Spring Boot and React, designed to streamline judicial case processing with intelligent priority management and professional user interfaces.

## 🎯 Overview

The Differentiated Case Flow Management System is a full-stack web application that revolutionizes case management in judicial systems. It provides automated case number generation, intelligent priority assignment, modern card-based interfaces, and comprehensive case tracking capabilities.

## ✨ Key Features

### 🔢 Auto-Incrementing Case Numbers
- **Automatic Generation**: Unique case numbers in `CASE-YYYY-NNNN` format
- **Timestamp-Based**: Ensures uniqueness and chronological ordering
- **User-Friendly Display**: Shows generated numbers with copy-to-clipboard functionality

### 🎨 Modern UI/UX
- **Card-Based Interface**: Beautiful, responsive case management with gradient designs
- **Professional Dashboard**: Real-time statistics and analytics
- **Mobile-Responsive**: Works seamlessly across all devices
- **Intuitive Navigation**: Smooth transitions and hover effects

### 🧠 Intelligent Priority Management
- **Smart Algorithms**: Automatic priority calculation based on case characteristics
- **Dynamic Adjustments**: Age-based priority increases for pending cases
- **Customizable Rules**: Configurable priority weights for different case types

### 🔐 Role-Based Access Control
- **Three User Roles**: Admin, Judge, and Clerk with appropriate permissions
- **Secure Authentication**: Spring Security with Basic Authentication
- **Granular Permissions**: Different access levels for different operations

### 📊 Comprehensive Case Management
- **Case Lifecycle**: From filing to completion with full tracking
- **Document Upload**: Support for multiple file types and secure storage
- **Status Tracking**: Real-time status updates and notifications
- **Search & Filter**: Advanced filtering and search capabilities

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17+
- **Database**: H2 Database (In-Memory)
- **ORM**: JPA/Hibernate
- **Security**: Spring Security
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **State Management**: React Context API

### DevOps & Tools
- **Version Control**: Git
- **Repository**: GitHub
- **Code Quality**: ESLint
- **API Testing**: cURL/Postman

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Java**: JDK 17 or higher
- **Node.js**: Version 16 or higher
- **npm**: Version 7 or higher
- **Maven**: Version 3.6 or higher
- **Git**: Version 2.0 or higher

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KUMAR-VSK/DIFFERENTIATED-CASE-FLOW-MANAGEMENT.git
cd DIFFERENTIATED-CASE-FLOW-MANAGEMENT
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Build the application
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🎮 Usage Guide

### Accessing the Application

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Default Credentials**:
   - **Username**: `admin`
   - **Password**: `admin123`

### Key Workflows

#### Filing a New Case
1. Navigate to **"File New Case"** from the sidebar
2. Fill in the case details (case number is auto-generated)
3. Upload any supporting documents
4. Click **"File Case"** to submit
5. **Success message** will display the generated case number

#### Managing Cases
1. Go to **"Case Management"** in the sidebar
2. View all cases in the modern card-based layout
3. Use filters to find specific cases
4. Click on any case card to view details
5. Edit case information if you have appropriate permissions

#### Dashboard Analytics
1. Access the **"Dashboard"** for real-time statistics
2. View case distribution by status and type
3. Monitor system performance metrics
4. Track priority distribution

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Register User
```http
POST /api/auth/register
Content-Type: application/json
Authorization: Basic <credentials>

{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "role": "CLERK"
}
```

### Case Management Endpoints

#### Create Case
```http
POST /api/cases
Content-Type: application/json
Authorization: Basic <credentials>

{
  "title": "Case Title",
  "description": "Case description",
  "caseType": "CIVIL",
  "resourceRequirement": "Special expertise needed",
  "estimatedDurationDays": 30
}
```

#### Get All Cases
```http
GET /api/cases
Authorization: Basic <credentials>
```

#### Get Case Statistics
```http
GET /api/cases/statistics
Authorization: Basic <credentials>
```

#### Update Case Status
```http
PUT /api/cases/{id}/status?status=SCHEDULED
Authorization: Basic <credentials>
```

### User Management Endpoints

#### Get All Users
```http
GET /api/auth/users
Authorization: Basic <credentials>
```

#### Create User
```http
POST /api/auth/users
Content-Type: application/json
Authorization: Basic <credentials>

{
  "username": "judge1",
  "password": "password123",
  "email": "judge@example.com",
  "role": "JUDGE",
  "firstName": "John",
  "lastName": "Doe"
}
```

## 🏗 System Architecture

### Backend Architecture
```
src/main/java/com/example/dcm/
├── config/           # Security and application configuration
├── controller/       # REST API endpoints
├── model/           # JPA entity classes
├── repository/      # Data access layer
├── service/         # Business logic layer
└── DcmApplication.java  # Main application class
```

### Frontend Architecture
```
src/
├── components/      # React components
│   ├── Dashboard.js     # Main dashboard
│   ├── CaseList.js      # Case management
│   ├── CaseForm.js      # Case filing
│   ├── CaseDetail.js    # Case details
│   └── UserManagement.js # User management
├── context/         # React context for state management
└── App.js          # Main application component
```

## 🔒 Security Features

- **Authentication**: Basic Authentication with Spring Security
- **Authorization**: Role-based access control (Admin > Judge > Clerk)
- **Password Encryption**: BCrypt password hashing
- **Session Management**: Secure session handling
- **CORS Configuration**: Configured for cross-origin requests

## 📈 Performance Features

- **Lazy Loading**: Optimized database queries
- **Pagination**: Efficient handling of large datasets
- **Caching**: Smart refresh mechanisms
- **Responsive Design**: Optimized for all screen sizes
- **Code Splitting**: Efficient bundle loading

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

We welcome contributions to improve the Differentiated Case Flow Management System!

### Development Guidelines

1. **Code Style**: Follow the existing code style and conventions
2. **Commit Messages**: Use descriptive commit messages with conventional format
3. **Documentation**: Update this README for any significant changes
4. **Testing**: Add tests for new features and bug fixes
5. **Security**: Follow security best practices

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/KUMAR-VSK/DIFFERENTIATED-CASE-FLOW-MANAGEMENT/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KUMAR-VSK/DIFFERENTIATED-CASE-FLOW-MANAGEMENT/discussions)

## 🔄 Recent Updates

### Version 1.0.0 (Latest)
- ✅ **Auto-Incrementing Case Numbers**: Professional `CASE-YYYY-NNNN` format
- ✅ **Modern Card-Based UI**: Beautiful, responsive case management interface
- ✅ **Smart Priority Engine**: Intelligent case prioritization
- ✅ **Enhanced Security**: Role-based access control
- ✅ **Document Upload**: Support for multiple file types
- ✅ **Real-time Dashboard**: Comprehensive analytics and statistics

---

**Built with ❤️ for efficient judicial case management**

*Last updated: January 14, 2026*
