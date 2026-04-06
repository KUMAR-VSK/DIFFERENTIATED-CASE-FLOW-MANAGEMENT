# Differentiated Case Flow Management System (DCM)

## Project Overview
The Differentiated Case Flow Management System is a comprehensive, enterprise-grade platform for judicial case tracking and lifecycle management. It enables hierarchical processing of cases across District, High, and Supreme court levels with intelligent priority management, automated number generation, and full audit traceability.

## Technology Stack

### Backend
- Framework: Spring Boot 3.2.0
- Language: Java 17+
- Database: H2 Database (In-Memory) / MySQL Support
- Security: Spring Security (Stateless JWT Authentication)
- API Documentation: Springdoc OpenAPI (Swagger UI)
- Export Services: iText (PDF) and Apache POI (Excel)
- Build Tool: Maven

### Frontend
- Framework: React 18
- Styling: Tailwind CSS 3.x
- Charts: Chart.js / react-chartjs-2
- UI Components: Material UI Icons
- HTTP Client: Axios
- Calendar: FullCalendar React

## Key Functionalities

### Hierarchical Case Management
- Three-tier court structure support (District, High, Supreme).
- Rule-based case escalation and de-escalation with full reason tracking.
- Court-level jurisdiction enforcement for judicial assignments.

### Case Audit and Traceability
- Detailed activity timeline capturing every modification (status changes, judge assignments, note updates).
- Performer attribution tracking (Username and Role) for every system action.
- Real-time system activity feed on the dashboard for monitoring.

### Professional Reporting
- Case History PDF export with custom page numbering and visual lifecycle progress bars.
- Basic case reporting with date range filtering.
- Automated sequential case number generation (CASE-YYYY-NNNN format) with court level suffixes.

### Judicial Support Tools
- Interactive hearing calendar with priority-based color coding.
- Secure judicial notes section with note-change difference tracking.
- Document management system supporting file uploads up to 50MB.

### Advanced Analytics
- Real-time dashboard with status distribution doughnuts and case type trends.
- Court-level distribution statistics for workload management.
- Quick action shortcuts based on user role (Admin, Judge, Clerk).

## API Documentation
The system provides interactive API documentation via Swagger UI. Once the backend is running, you can access it at:
`http://localhost:8080/swagger-ui/index.html`

## Installation and Setup

### Prerequisites
- JDK 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher

### Backend Setup
1. Navigate to the `backend` directory.
2. Run `mvn install` to install dependencies.
3. Start the application with `mvn spring-boot:run`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Start the development server with `npm start`.

### Default Credentials
- Admin: admin / admin123
- District Judge: judge1 / judge123
- High Court Judge: highcourt_judge / highcourt123
- Clerk: clerk1 / clerk123

Built for efficient and transparent judicial case management.
Last updated: April 2026
