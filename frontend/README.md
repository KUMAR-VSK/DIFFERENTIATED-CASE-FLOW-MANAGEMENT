# Differentiated Case Flow Management System (DCM) - Frontend Client

## Overview
This directory contains the frontend client application for the Differentiated Case Flow Management (DCM) System. It is a Single Page Application (SPA) designed to provide an interactive interface for judicial clerks, judges, advocates, and administrators to track cases, manage workflows, schedule hearings, and handle legal documents.

## Technology Stack

*   **Framework**: React 19
*   **Routing**: React Router DOM 6
*   **State Management**: React Context API (incorporating AuthContext for user authentication and ThemeContext for display configuration)
*   **Styling**: Tailwind CSS 3.x and PostCSS
*   **Components & Icons**: Material UI (MUI) Icon libraries
*   **Data Visualization**: Chart.js and React Chartjs 2
*   **Calendar**: FullCalendar React
*   **HTTP Client**: Axios
*   **WebSocket Client**: SockJS-client and @stomp/stompjs
*   **Build Tool**: React Scripts (Create React App underlying configuration)

---

## Client Architecture & Directory Layout

The frontend codebase is organized into modular directories under the `src` root:

```
frontend/src/
├── components/         # Reusable structural and UI layout components
│   ├── Layout.js       # Main application shell incorporating theme wrappers
│   ├── Navigation.js   # Dynamic role-based navigation sidebar
│   └── ProtectedRoute.js # Route guard enforcing authentication and authorization
├── context/            # Global React Contexts
│   ├── AuthContext.js  # Manages JWT tokens, user profiles, and session storage
│   └── ThemeContext.js # Controls light and dark mode state transitions
├── pages/              # View components mapped to routing paths
│   ├── Analytics.js    # Case flow visualization dashboard and bottleneck reports
│   ├── CalendarView.js # Monthly and weekly hearing scheduling views
│   ├── CaseDetail.js   # In-depth case record view including note editors and audits
│   ├── CaseForm.js     # Form component for filing and registering new cases
│   ├── CaseList.js     # Case lists with search filters and sorting options
│   ├── Checklists.js   # Case templates and checklist step trackers
│   ├── Dashboard.js    # Metric summary charts and live audit activity feed
│   ├── Documents.js    # Document manager, version history, and approval panels
│   ├── Login.js        # Authentication portal for registered users
│   ├── Register.js     # Registration portal for new users
│   └── UserManagement.js # User role and court jurisdiction table
├── services/           # Network and communication layers
│   ├── api.js          # Pre-configured Axios instance with JWT interceptors
│   └── websocket.js    # WebSocket handlers for receiving live audit broadcasts
├── App.js              # Primary route mapping configuration
└── index.js            # Main React bootstrapper
```

---

## Key Features

### 1. Interactive Analytics Dashboard
*   Summarizes system metrics (active files, scheduled cases, completed cases).
*   Visualizes case distributions using Chart.js doughnut and line charts.
*   Presents a live WebSocket feed showing recent system activities and modifications.

### 2. Case Search and Filtering
*   Full-text search querying case numbers and titles.
*   Filters cases based on court levels (District, High, Supreme), status values, and priority ranges.

### 3. Integrated Scheduling Calendar
*   Aggregates and displays scheduled hearings.
*   Enables drag-and-drop hearing scheduling for judicial officers.

### 4. Interactive Checklist Workflows
*   Visual progress tracking indicators representing checklist item completions.
*   Task status transitions (Pending, In Progress, Completed, Skipped, Overdue) with enforcement of mandatory check steps.

### 5. Advanced Document Manager
*   Drag-and-drop file upload container supporting files up to 50MB.
*   Displays version history, allowing users to trace document updates and restore previous drafts.
*   Features a review panel for verifying, approving, or requesting revisions on sensitive evidence files.

---

## Configuration & Environment Setup

### Environment Variables
Configure the endpoint URL for the backend API by creating a `.env` file in the frontend root directory:
```properties
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=http://localhost:8080/ws
```

### Installation
Install the required packages using npm:
```bash
npm install
```

### Running the Application (Development Mode)
Start the React development server:
```bash
npm start
```
The client application will start at `http://localhost:3000`. The development server supports hot-reloading for code changes.

### Compilation (Production Build)
To compile the frontend project for production:
```bash
npm run build
```
This script compiles the React application into static assets located inside the `build` directory. The production bundle is minified, optimized, and ready to be served by a web server such as Nginx or Apache.

---

## Verification & Testing

To execute frontend unit tests:
```bash
npm test
```
The test suite utilizes React Testing Library and Jest to verify component rendering, layout responsiveness, and Context provider state transitions.
