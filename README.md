# Differentiated Case Flow Management System

A comprehensive, professional-grade case management system built with Spring Boot and React, designed to streamline judicial case processing across hierarchical court levels with intelligent priority management and modern user interfaces.

## 🎯 Overview

The Differentiated Case Flow Management System is a full-stack web application that revolutionizes case management in judicial systems. It provides automated case number generation, hierarchical court-level escalation, intelligent priority assignment, modern card-based interfaces, and comprehensive case tracking capabilities across District, High, and Supreme Court levels.

## ✨ Key Features

### 🏛️ Hierarchical Court Level Management
- **Three-Tier Structure**: District Court → High Court → Supreme Court
- **Smart Escalation**: Cases can be escalated to higher courts with reason tracking
- **Step-wise De-escalation**: Supreme → High → District with automatic priority adjustment
- **Court-Specific Judges**: Judges assigned to specific court levels for proper jurisdiction
- **Eligibility Checks**: Automatic validation for escalation/de-escalation based on court level

### 🔢 Sequential Case Number Generation
- **Real-time Preview**: Shows the actual next case number before filing (e.g., `CASE-2026-0005`)
- **Sequential Format**: Unique case numbers in `CASE-YYYY-NNNN-CL` format
- **Auto-Increment**: Each new case gets the next sequential number (0001, 0002, 0003, etc.)
- **Court Level Suffix**: Cases append court level suffix (DC/HC/SC) upon escalation
- **Database-Driven**: Numbers generated based on highest existing sequence
- **User-Friendly Display**: Shows generated numbers with copy-to-clipboard functionality

### 🎨 Modern UI/UX
- **Card-Based Interface**: Beautiful, responsive case management with gradient designs
- **Dark Mode Support**: Full dark mode implementation across all components
- **Premium Toast Notifications**: 
  - Slide-in animations from the right
  - Progress bar showing auto-dismiss countdown
  - Success/Error color-coded indicators
  - Hover effects and smooth transitions
- **Professional Dashboard**: Real-time statistics and analytics with charts
- **Mobile-Responsive**: Works seamlessly across all devices
- **Intuitive Navigation**: Smooth transitions, hover effects, and micro-animations

### 🧠 Intelligent Priority Management
- **Smart Algorithms**: Automatic priority calculation based on case characteristics
- **Court-Level Adjustments**: Higher court cases receive appropriate priority boosts
- **Dynamic Age-Based**: Priority increases for pending cases over time
- **Escalation Impact**: Priority automatically adjusted during court level changes
- **Customizable Rules**: Configurable priority weights for different case types

### 🔐 Role-Based Access Control
- **Three User Roles**: Admin, Judge, and Clerk with granular permissions
- **Judge-Only Notes**: Judicial notes can only be added by Judges
- **Court-Level Assignment**: Judges restricted to their assigned court level
- **Secure Authentication**: Spring Security with Basic Authentication
- **Hierarchical Permissions**: Different access levels for different operations

### 📄 Document Management
- **Public Viewing**: Documents open in new tab without authentication
- **Large File Support**: Upload files up to 50MB
- **Multiple Formats**: Support for PDF, images, and other file types
- **Secure Storage**: Files stored on backend with organized structure
- **Quick Actions**: View and download buttons for each document

### 📊 Comprehensive Case Management
- **Complete Lifecycle**: From filing to completion with full tracking
- **Tabbed Interface**: Organized case details across Overview, Documents, Notes, Timeline, and Analytics
- **Status Tracking**: Real-time status updates with visual indicators
- **Judge Assignment**: Assign cases to specific judges based on court level
- **Hearing Scheduling**: Schedule and track hearing dates
- **Search & Filter**: Advanced filtering by status, type, priority, and court level

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17+
- **Database**: H2 Database (In-Memory)
- **ORM**: JPA/Hibernate
- **Security**: Spring Security with BCrypt password hashing
- **Build Tool**: Maven
- **File Upload**: MultipartFile support with 50MB limit

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS 3.x with custom utilities
- **HTTP Client**: Axios
- **Charts**: Chart.js with React integration
- **Build Tool**: Create React App
- **State Management**: React Context API
- **Fonts**: Inter from Google Fonts
- **Icons**: Heroicons (SVG)

### DevOps & Tools
- **Version Control**: Git
- **Repository**: GitHub
- **Code Quality**: ESLint
- **API Testing**: cURL/Postman
- **CORS**: Configured for local development

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

#### Administrative Users
- **Admin**: `admin` / `admin123` (Full system access across all court levels)

#### Judicial Users (Court-Level Specific)
- **District Court Judge**: `judge1` / `judge123` (District Court cases only)
- **High Court Judge**: `highcourt_judge` / `highcourt123` (High Court cases only)
- **Supreme Court Judge**: `supremecourt_judge` / `supremecourt123` (Supreme Court cases only)

#### Support Staff
- **Clerk**: `clerk1` / `clerk123` (Case creation and document management)

### Key Workflows

#### Filing a New Case
1. Navigate to **"File New Case"** from the sidebar
2. **Preview Case Number**: System automatically fetches and displays the next case number (e.g., `CASE-2026-0005`)
3. Fill in the case details:
   - Case Title (required)
   - Description
   - Case Type (CIVIL, CRIMINAL, FAMILY, CORPORATE)
   - Resource Requirements
   - Estimated Duration
4. Upload any supporting documents (up to 50MB per file)
5. Click **"File Case"** to submit
6. **Success Toast**: Professional notification with progress bar confirms submission

#### Escalating a Case
1. Open a case at District or High Court level
2. Click **"Escalate Case"** button (Admin/Judge only)
3. Enter escalation reason (required)
4. Case moves to next higher court level with:
   - Updated court level suffix in case number
   - Priority adjustment
   - Status change
   - Escalation reason recorded in notes

#### De-escalating a Case
1. Open a case at High or Supreme Court level
2. Click **"De-escalate Case"** button (Admin only)
3. Enter de-escalation reason (required)
4. Case moves to previous lower court level with automatic adjustments

#### Adding Judicial Notes
1. Open any case details page
2. Navigate to **"Notes"** tab
3. Click **"Add Note"** (Judges only)
4. Enter note content
5. Submit - note is timestamped and attributed to the judge

#### Viewing Documents
1. Navigate to **"Documents"** tab in case details
2. Click **"View"** to open document in new tab (no authentication required)
3. Click **"Download"** to save document locally

#### Managing Cases
1. Go to **"Case Management"** in the sidebar
2. View all cases in modern tabular layout
3. Filter by:
   - Status (PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, DISMISSED)
   - Court Level (DISTRICT, HIGH, SUPREME)
   - Priority (1-10)
   - Case Type
4. Sort by any column (Case Number, Title, Status, Priority, etc.)
5. Click on any case to view full details

#### Dashboard Analytics
1. Access the **"Dashboard"** for real-time statistics:
   - Total cases count
   - Cases by status (with color-coded cards)
   - Court level distribution
   - Average priority score
   - Cases by type (pie chart)
   - Recent cases list
2. Monitor system performance metrics
3. Track priority distribution across court levels

## 📚 API Documentation

### Authentication Endpoints

#### Get Current User
```http
GET /api/auth/me
Authorization: Basic <credentials>
```

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "role": "CLERK"
}
```

### Case Management Endpoints

#### Get Next Case Number Preview
```http
GET /api/cases/next-case-number
```

**Response:**
```json
{
  "nextCaseNumber": "CASE-2026-0005",
  "format": "CASE-YYYY-NNNN"
}
```

#### Create Case
```http
POST /api/cases
Content-Type: application/json
Authorization: Basic <credentials>

{
  "title": "Case Title",
  "description": "Case description",
  "caseType": "CIVIL",
  "courtLevel": "DISTRICT",
  "resourceRequirement": "Special expertise needed",
  "estimatedDurationDays": 30
}
```

#### Get All Cases
```http
GET /api/cases
Authorization: Basic <credentials>
```

#### Get Case by ID
```http
GET /api/cases/{id}
Authorization: Basic <credentials>
```

#### Update Case Status
```http
PUT /api/cases/{id}/status?status=SCHEDULED
Authorization: Basic <credentials>
```

#### Escalate Case
```http
POST /api/cases/{id}/escalate
Content-Type: application/json
Authorization: Basic <credentials> (Admin or Judge)

{
  "reason": "Case requires higher court jurisdiction"
}
```

#### De-escalate Case
```http
POST /api/cases/{id}/deescalate
Content-Type: application/json
Authorization: Basic <credentials> (Admin only)

{
  "reason": "Case suitable for lower court"
}
```

#### Check De-escalation Eligibility
```http
GET /api/cases/{id}/deescalation-eligibility
Authorization: Basic <credentials>
```

**Response:**
```json
{
  "eligible": true,
  "currentLevel": "HIGH",
  "targetLevel": "DISTRICT",
  "reason": "Can be de-escalated to DISTRICT court"
}
```

#### Add Case Notes (Judges Only)
```http
PUT /api/cases/{id}/notes
Content-Type: application/json
Authorization: Basic <judge-credentials>

{
  "notes": "Judicial note content"
}
```

### Document Management Endpoints

#### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Basic <credentials>

file: <file-data>
caseId: <case-id>
```

#### View Document (Public)
```http
GET /api/documents/view/{filename}
```

#### Download Document (Public)
```http
GET /api/documents/download/{filename}
```

#### Get Documents by Case ID
```http
GET /api/documents/case/{caseId}
Authorization: Basic <credentials>
```

### Court Level Management Endpoints

#### Get Cases by Court Level
```http
GET /api/cases/court-level/{courtLevel}
Authorization: Basic <credentials>

courtLevel: DISTRICT | HIGH | SUPREME
```

#### Get Previous Court Level
```http
GET /api/cases/{id}/previous-court-level
Authorization: Basic <credentials>
```

### User Management Endpoints

#### Get All Users (Admin only)
```http
GET /api/auth/users
Authorization: Basic <admin-credentials>
```

#### Create User (Admin only)
```http
POST /api/auth/users
Content-Type: application/json
Authorization: Basic <admin-credentials>

{
  "username": "judge1",
  "password": "password123",
  "email": "judge@example.com",
  "role": "JUDGE",
  "courtLevel": "DISTRICT",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Update User Role (Admin only)
```http
PUT /api/auth/users/{id}/role
Content-Type: application/json
Authorization: Basic <admin-credentials>

"JUDGE"
```

#### Update User Court Level (Admin only)
```http
PUT /api/auth/users/{id}/court-level
Content-Type: application/json
Authorization: Basic <admin-credentials>

"HIGH"
```

## 🏗 System Architecture

### Backend Architecture
```
src/main/java/com/example/dcm/
├── config/           # Security and application configuration
│   └── SecurityConfig.java  # Spring Security setup, CORS, public endpoints
├── controller/       # REST API endpoints
│   ├── AuthController.java    # Authentication and user management
│   ├── CaseController.java    # Case operations and court level management
│   └── DocumentController.java # Document upload and retrieval
├── model/           # JPA entity classes
│   ├── User.java      # User entity with roles and court levels
│   ├── Case.java      # Case entity with court level enum
│   └── Document.java  # Document entity
├── repository/      # Data access layer
│   ├── UserRepository.java
│   ├── CaseRepository.java    # Custom queries for case sequence
│   └── DocumentRepository.java
├── service/         # Business logic layer
│   ├── UserService.java       # User operations and authentication
│   └── CaseService.java       # Case management, escalation, priorities
└── DcmApplication.java  # Main Spring Boot application class
```

### Frontend Architecture
```
src/
├── components/      # React components
│   ├── Dashboard.js         # Main dashboard with statistics
│   ├── CaseList.js          # Case management table
│   ├── CaseForm.js          # Case filing form with live preview
│   ├── CaseDetail.js        # Case details with tabbed interface
│   ├── UserManagement.js    # User administration
│   └── case-detail/         # Modular case detail components
│       ├── CaseOverview.js  # Case information overview
│       ├── CaseDocuments.js # Document list and actions
│       ├── CaseNotes.js     # Judicial notes (Judge-only add)
│       ├── CaseTimeline.js  # Case activity timeline
│       ├── CaseAnalytics.js # Case metrics and charts
│       └── CaseModals.js    # Escalation/De-escalation modals
├── context/         # React context for state management
│   └── AuthContext.js       # Authentication and theme context
├── index.css       # Global styles, animations, dark mode
└── App.js          # Main application with routing
```

### Database Schema
```
USERS
- id (Primary Key)
- username (Unique)
- password (BCrypt hashed)
- email
- role (ADMIN, JUDGE, CLERK)
- court_level (DISTRICT, HIGH, SUPREME)
- first_name
- last_name
- created_at
- updated_at

CASES
- id (Primary Key)
- case_number (Unique, e.g., CASE-2026-0005-HC)
- case_sequence (Auto-increment)
- title
- description
- case_type (CIVIL, CRIMINAL, FAMILY, CORPORATE)
- status (PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, DISMISSED)
- priority (1-10)
- court_level (DISTRICT, HIGH, SUPREME)
- filing_date
- hearing_date
- resource_requirement
- estimated_duration_days
- notes (Text)
- documents (JSON)
- assigned_judge_id (Foreign Key to USERS)
- filed_by_id (Foreign Key to USERS)
- created_at
- updated_at

DOCUMENTS
- id (Primary Key)
- original_file_name
- stored_file_name
- description
- file_type
- file_size
- url
- document_type (PETITION, EVIDENCE, ORDER, OTHER)
- case_id (Foreign Key to CASES)
- uploaded_by_id (Foreign Key to USERS)
- upload_date
```

## 🔒 Security Features

- **Authentication**: Basic Authentication with Spring Security
- **Password Encryption**: BCrypt password hashing with salt
- **Role-Based Authorization**: Granular permissions using @PreAuthorize
- **Session Management**: Secure session handling with credentials in localStorage
- **CORS Configuration**: Configured for local development (localhost:3000)
- **Public Endpoints**: Document viewing allowed without authentication
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: React's built-in XSS prevention
- **Secure Headers**: HTTP security headers configured

## 📈 Performance Features

- **Lazy Loading**: Optimized database queries with JPA
- **Efficient Queries**: Custom repository methods for complex operations
- **Pagination**: Built-in support for large datasets
- **Caching**: Smart component-level caching in React
- **Responsive Design**: Optimized for all screen sizes
- **Code Splitting**: Efficient bundle loading with React lazy loading
- **Image Optimization**: Proper image sizing and format
- **Database Indexing**: Indexed columns for fast queries

## 🎨 UI/UX Features

### Modern Design System
- **Color Palette**: Professional gradients and consistent color scheme
- **Typography**: Inter font family for clean, modern look
- **Icons**: Heroicons SVG icon set
- **Animations**: Smooth transitions and micro-interactions
- **Glassmorphism**: Frosted glass effects on modals and cards

### Toast Notification System
- **Entry Animation**: Smooth slide-in from right
- **Progress Bar**: Visual countdown for auto-dismiss (4 seconds)
- **Color Coding**: Red for errors, green for success
- **Hover Effects**: Scale animation on hover
- **Dark Mode**: Fully themed for both light and dark modes
- **Dismiss Button**: Manual close option
- **Accessibility**: ARIA labels and semantic HTML

### Dark Mode
- **System-wide**: Consistent dark mode across all pages
- **Toggle**: Easy switch between light and dark themes
- **Persistence**: Theme preference stored in localStorage
- **Tailwind Integration**: Uses Tailwind's dark: prefix
- **Custom Colors**: Carefully selected dark mode color palette

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

### Manual Testing Checklist
- [ ] Case filing with next number preview
- [ ] Case escalation from District to High Court
- [ ] Case de-escalation from Supreme to High Court
- [ ] Judge-only note addition
- [ ] Clerk document upload (50MB limit)
- [ ] Public document viewing without login
- [ ] Toast notifications display and auto-dismiss
- [ ] Dark mode toggle works correctly
- [ ] Filter and sort in case list
- [ ] Dashboard statistics update in real-time

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use**
```bash
# Find and kill the process
lsof -ti:8080 | xargs kill -9

# Or change the port in application.properties
server.port=8081
```

**Database not initializing**
- Check `application.properties` for correct H2 configuration
- Ensure `spring.jpa.hibernate.ddl-auto=update`
- Delete H2 database files and restart

### Frontend Issues

**Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API calls failing**
- Verify backend is running on port 8080
- Check browser console for CORS errors
- Ensure credentials are sent with requests

**Toast notifications not animating**
- Clear browser cache
- Ensure `index.css` has the animation keyframes
- Check for Tailwind CSS conflicts

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
5. Open a Pull Request with detailed description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/KUMAR-VSK/DIFFERENTIATED-CASE-FLOW-MANAGEMENT/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KUMAR-VSK/DIFFERENTIATED-CASE-FLOW-MANAGEMENT/discussions)
- **Email**: kumar-vsk@example.com

## 🔄 Version History

### Version 2.0.0 (Current - February 2026)
- ✅ **Hierarchical Court Levels**: District → High → Supreme Court management
- ✅ **Smart Escalation/De-escalation**: Step-wise case movement with validation
- ✅ **Live Case Number Preview**: Real-time next case number in filing form
- ✅ **Judge-Only Notes**: Restricted note addition to judicial users
- ✅ **Public Document Viewing**: No authentication required for viewing documents
- ✅ **Enhanced Toast Notifications**: Professional notifications with progress bars
- ✅ **50MB File Upload**: Increased file size limit for documents
- ✅ **Dark Mode**: Full dark mode implementation
- ✅ **Improved UI/UX**: Modern design with animations and transitions
- ✅ **Tabbed Case Details**: Organized case information across tabs

### Version 1.0.0 (January 2026)
- ✅ **Auto-Incrementing Case Numbers**: Professional `CASE-YYYY-NNNN` format
- ✅ **Modern Card-Based UI**: Beautiful, responsive case management interface
- ✅ **Smart Priority Engine**: Intelligent case prioritization
- ✅ **Enhanced Security**: Role-based access control
- ✅ **Document Upload**: Support for multiple file types
- ✅ **Real-time Dashboard**: Comprehensive analytics and statistics

## 🙏 Acknowledgments

- **Spring Boot Team**: For the excellent backend framework
- **React Team**: For the powerful frontend library
- **Tailwind CSS**: For the utility-first CSS framework
- **Chart.js**: For beautiful data visualization
- **Heroicons**: For the clean SVG icon set

---

**Built with ❤️ for efficient judicial case management**

*Last updated: February 2, 2026*
