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

**Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)  
**OpenAPI Spec**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive API testing
- JWT authentication support (click "Authorize" button)

## Installation and Setup

### Prerequisites
- JDK 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher (for production)

### Backend Setup

#### Development Mode
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Configure your database credentials in `.env`:
   ```properties
   DB_URL=jdbc:mysql://localhost:3306/dcm_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DB_USERNAME=root
   DB_PASSWORD=your_password_here
   JWT_SECRET=your-secret-key-at-least-256-bits-long
   ```

4. Install dependencies:
   ```bash
   mvn clean install
   ```

5. Start the application with environment variables:
   ```bash
   DB_PASSWORD=your_password DB_USERNAME=root mvn spring-boot:run
   ```

   Or export environment variables first:
   ```bash
   export DB_PASSWORD=your_password
   export DB_USERNAME=root
   mvn spring-boot:run
   ```

6. The backend will start on `http://localhost:8080`

#### Production Mode
For production deployment, ensure you:
- Set strong JWT_SECRET environment variable
- Use a production-grade MySQL database
- Enable HTTPS/SSL
- Configure proper CORS origins in `SecurityConfig.java`

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The frontend will start on `http://localhost:3000`

### Database Setup

The application uses MySQL by default. The database schema will be created automatically on first run using Hibernate's `ddl-auto=update` setting.

**Manual Database Creation** (optional):
```sql
CREATE DATABASE dcm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Default Credentials
After the first run, you can log in with these default accounts:

| Role | Username | Password | Court Level |
|------|----------|----------|-------------|
| Admin | admin | admin123 | N/A |
| District Judge | judge1 | judge123 | District |
| High Court Judge | highcourt_judge | highcourt123 | High Court |
| Clerk | clerk1 | clerk123 | N/A |

**⚠️ Security Note**: Change these default passwords immediately in production!

## Deployment

### Production Deployment Checklist

1. **Environment Variables**: Set all required environment variables
   ```bash
   export DB_URL=jdbc:mysql://your-db-host:3306/dcm_db
   export DB_USERNAME=your_db_user
   export DB_PASSWORD=your_secure_password
   export JWT_SECRET=your-very-long-and-secure-secret-key-at-least-256-bits
   ```

2. **Database**: Use a production MySQL instance with proper backups

3. **Security**:
   - Change all default passwords
   - Configure CORS to allow only your frontend domain
   - Enable HTTPS/SSL
   - Set up firewall rules

4. **Build for Production**:
   
   **Backend**:
   ```bash
   cd backend
   mvn clean package -DskipTests
   java -jar target/dcm-0.0.1-SNAPSHOT.jar
   ```

   **Frontend**:
   ```bash
   cd frontend
   npm run build
   # Serve the build folder with nginx or any static file server
   ```

5. **Monitoring**: Enable Spring Boot Actuator endpoints for health checks

### Deployment Options

- **Traditional Server**: Deploy JAR file with systemd service
- **Cloud Platforms**: AWS, Azure, Google Cloud
- **Container**: Docker (see Docker section below)
- **Platform as a Service**: Heroku, Railway, Render

## Troubleshooting

### Backend Issues

#### 1. Application fails to start with "Access denied for user"
**Problem**: Database credentials are incorrect or not loaded.

**Solution**:
```bash
# Make sure you're passing environment variables
DB_PASSWORD=your_password DB_USERNAME=root mvn spring-boot:run

# Or export them first
export DB_PASSWORD=your_password
export DB_USERNAME=root
mvn spring-boot:run
```

**Note**: Spring Boot doesn't automatically load `.env` files. You must pass environment variables explicitly.

#### 2. "Port 8080 already in use"
**Problem**: Another application is using port 8080.

**Solution**:
```bash
# Find and kill the process
lsof -ti:8080 | xargs kill -9

# Or change the port in application.properties
server.port=8081
```

#### 3. "Failed to configure a DataSource"
**Problem**: Database connection configuration is missing.

**Solution**:
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify credentials in environment variables
- Check `application.properties` for correct JDBC URL

#### 4. JWT Token errors / "Invalid JWT signature"
**Problem**: JWT secret mismatch or token expired.

**Solution**:
- Clear browser localStorage and log in again
- Verify JWT_SECRET is set consistently
- Check token expiration settings in `application.properties`

#### 5. CORS errors in browser console
**Problem**: Frontend origin not allowed by backend.

**Solution**:
- Check `SecurityConfig.java` CORS configuration
- Ensure frontend URL is in `allowedOriginPatterns`
- Verify both frontend and backend are running

#### 6. "Circular dependency" error on startup
**Problem**: Bean initialization order issue.

**Solution**: This should be fixed in the current version. If you encounter it:
- Verify `PasswordEncoderConfig.java` exists as a separate configuration
- Check that `SecurityConfig` doesn't define `passwordEncoder()` bean

### Frontend Issues

#### 1. "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Problem**: Backend is not running or wrong URL.

**Solution**:
- Verify backend is running on `http://localhost:8080`
- Check `AuthContext.js` has correct `BASE_URL`
- Ensure no firewall blocking the connection

#### 2. Login fails with no error message
**Problem**: Network issue or incorrect credentials.

**Solution**:
- Open browser DevTools → Network tab
- Check the `/api/auth/login` request/response
- Verify credentials match database records
- Check backend logs for authentication errors

#### 3. "npm install" fails
**Problem**: Node version incompatibility or network issues.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 4. PDF downloads show generic names
**Problem**: CORS not exposing Content-Disposition header.

**Solution**: This should be fixed in the current version. Verify:
- Backend `SecurityConfig` exposes `Content-Disposition` header
- Clear browser cache and try again

#### 5. Charts not displaying
**Problem**: Chart.js compatibility or data format issue.

**Solution**:
- Check browser console for errors
- Verify Chart.js version compatibility with React 18
- Ensure data is in correct format for charts

### Database Issues

#### 1. "Table doesn't exist" errors
**Problem**: Database schema not created.

**Solution**:
- Verify `spring.jpa.hibernate.ddl-auto=update` in `application.properties`
- Check database user has CREATE TABLE permissions
- Manually run the application once to create schema

#### 2. Slow query performance
**Problem**: Missing indexes or large dataset.

**Solution**:
- Check slow query log in MySQL
- Add indexes on frequently queried columns
- Implement pagination on large result sets

#### 3. "Too many connections" error
**Problem**: Connection pool exhausted.

**Solution**:
- Add connection pool configuration to `application.properties`
- Check for connection leaks in code
- Increase `maximum-pool-size` if needed

### Common Development Issues

#### 1. Changes not reflecting after code update
**Solution**:
- **Backend**: Stop and restart `mvn spring-boot:run`
- **Frontend**: React should hot-reload; if not, restart `npm start`
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

#### 2. "Module not found" errors in frontend
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 3. Build fails with "Out of memory" error
**Solution**:
```bash
# Increase Maven memory
export MAVEN_OPTS="-Xmx1024m"
mvn clean install

# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**:
   - Backend: `backend/logs/dcm-application.log`
   - Frontend: Browser DevTools → Console

2. **Enable Debug Logging**:
   ```properties
   # In application.properties
   logging.level.com.example.dcm=DEBUG
   ```

3. **Verify Versions**:
   ```bash
   java -version    # Should be 17+
   node -v          # Should be 16+
   mvn -v           # Should be 3.6+
   mysql --version  # Should be 8.0+
   ```

4. **Check GitHub Issues**: Review existing issues or create a new one

Built for efficient and transparent judicial case management.  
Last updated: April 2026
