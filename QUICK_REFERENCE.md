# ⚡ Quick Reference: Advanced Features

## 🎯 The Three Features at a Glance

### 1. 📊 Case Flow Visualization
**What**: Interactive dashboard showing how cases move through courts  
**Where**: `/flow-visualization`  
**Who**: Admin, Judge  
**Why**: Identify bottlenecks, track patterns, optimize flow

### 2. 📁 Advanced Document Management
**What**: Enterprise document management with versions & approvals  
**Where**: `/documents/:caseId`  
**Who**: All users  
**Why**: Track changes, manage approvals, ensure compliance

### 3. ✅ Case Templates & Checklists
**What**: Standardized workflows with progress tracking  
**Where**: `/templates`  
**Who**: All users  
**Why**: Ensure consistency, track completion, enforce steps

---

## 🔌 Quick API Reference

### Flow Analytics
```javascript
// Get overall flow data
GET /api/analytics/case-flow

// Response includes:
- courtLevelDistribution: {DISTRICT: 100, HIGH: 35, SUPREME: 15}
- statusDistribution: {FILED: 30, SCHEDULED: 25, ...}
- escalationPaths: [{path: "DISTRICT → HIGH", count: 25}, ...]
- averageTimeByStatus: {FILED: 5.5, UNDER_REVIEW: 8.2, ...}
- bottlenecks: [{status: "...", severity: "HIGH", ...}, ...]

// Get case-specific metrics
GET /api/analytics/case-flow/{caseId}

// Get court-level stats
GET /api/analytics/court-level-stats
```

### Templates & Checklists
```javascript
// Get all templates
GET /api/templates

// Get templates by type
GET /api/templates/by-type/CIVIL

// Get checklist for case
GET /api/templates/checklist/{caseId}

// Get progress percentage
GET /api/templates/checklist/{caseId}/progress

// Create checklist item
POST /api/templates/checklist
{
  "caseEntity": {"id": 1},
  "title": "File petition",
  "stepNumber": 1,
  "isMandatory": true,
  "dueDate": "2026-03-01T00:00:00"
}

// Update checklist item
PUT /api/templates/checklist/{id}
{
  "status": "COMPLETED",
  "completedBy": {"id": 1}
}

// Apply template to case
POST /api/templates/apply/{templateId}/to-case/{caseId}
```

### Documents
```javascript
// Upload document (multipart/form-data)
POST /api/documents/upload
FormData:
  - file: <file>
  - caseId: 1
  - description: "Evidence document"
  - documentType: "EVIDENCE"

// Get case documents
GET /api/documents/case/{caseId}

// Get version history
GET /api/documents/{id}/versions

// Get approvals
GET /api/documents/{id}/approvals
```

---

## 💻 Frontend Component Usage

### Case Flow Visualization
```jsx
import CaseFlowVisualization from './components/CaseFlowVisualization';

// Use in routing
<Route path="/flow-visualization" element={<CaseFlowVisualization />} />

// Features:
- Interactive metric tabs (overview, court levels, status, escalations, bottlenecks)
- Color-coded visualizations
- Real-time data from analytics API
```

### Advanced Document Manager
```jsx
import AdvancedDocumentManager from './components/AdvancedDocumentManager';

// Use in routing (with optional caseId)
<Route path="/documents/:caseId?" element={<AdvancedDocumentManager />} />

// Features:
- Drag & drop uploads
- Progress tracking
- Version history modal
- Approval workflow modal
- Document cards with actions
```

### Case Templates & Checklists
```jsx
import CaseTemplatesChecklists from './components/CaseTemplatesChecklists';

// Use in routing or as embedded component
<Route path="/templates" element={<CaseTemplatesChecklists />} />
// OR
<CaseTemplatesChecklists caseId={123} />

// Features:
- Progress bar
- Template browser
- Custom item creation
- Status management buttons
- Completion tracking
```

---

## 🎨 Styling Reference

### Color Scheme
```css
/* Court Levels */
.district-court { bg-green-500 }
.high-court { bg-orange-500 }
.supreme-court { bg-red-500 }

/* Status Colors */
.pending { bg-gray-100 dark:bg-gray-700 }
.in-progress { bg-blue-100 dark:bg-blue-900 }
.completed { bg-green-100 dark:bg-green-900 }
.overdue { bg-red-100 dark:bg-red-900 }

/* Severity */
.high-severity { bg-red-500 }
.medium-severity { bg-orange-500 }
.low-severity { bg-yellow-500 }

/* Document Types */
.evidence { bg-blue-100 dark:bg-blue-900 }
.court-order { bg-red-100 dark:bg-red-900 }
.pleading { bg-green-100 dark:bg-green-900 }
```

### Icons Reference
```
📊 - Flow Analytics
✅ - Workflows/Checklists
📁 - Documents folder
📤 - Upload
📦 - Versioning
⚠️ - Warning/Bottleneck
🎯 - Target/Goal
🏛️ - Court building
⚖️ - Balance/Justice
📋 - Clipboard/List
🔄 - In Progress
⏳ - Pending
⏭️ - Skipped
```

---

## 🔐 Security Checks

### Role Permissions Matrix

| Feature | Admin | Judge | Clerk |
|---------|-------|-------|-------|
| **Flow Visualization** | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| View Bottlenecks | ✅ | ✅ | ❌ |
| **Documents** | ✅ | ✅ | ✅ |
| Upload | ✅ | ✅ | ✅ |
| View | ✅ | ✅ | ✅ |
| Approve | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| **Templates** | ✅ | ✅ | ✅ |
| View Templates | ✅ | ✅ | ✅ |
| Create Template | ✅ | ❌ | ❌ |
| Apply Template | ✅ | ❌ | ✅ |
| **Checklists** | ✅ | ✅ | ✅ |
| View | ✅ | ✅ | ✅ |
| Update Status | ✅ | ✅ | ✅ |
| Add Custom Items | ✅ | ✅ | ✅ |

---

## 🚀 Quick Setup

### 1. Initialize Database (auto-created by JPA)
```sql
-- These tables are automatically created:
- document_versions
- document_approvals
- case_templates
- case_checklist_items
```

### 2. Seed Sample Templates (optional)
```java
// Add to DcmApplication.java
CaseTemplate civilTemplate = new CaseTemplate();
civilTemplate.setName("Standard Civil Litigation");
civilTemplate.setCaseType(Case.CaseType.CIVIL);
civilTemplate.setDefaultPriority(5);
civilTemplate.setEstimatedDurationDays(180);
civilTemplate.setChecklistItems("[{\"title\":\"File petition\",\"stepNumber\":1,\"isMandatory\":true}]");
templateRepository.save(civilTemplate);
```

### 3. Test Endpoints
```bash
# Flow analytics
curl -u admin:admin123 http://localhost:8080/api/analytics/case-flow

# Templates
curl -u admin:admin123 http://localhost:8080/api/templates

# Checklist
curl -u admin:admin123 http://localhost:8080/api/templates/checklist/1
```

---

## 🎯 Common Use Cases

### Use Case 1: Identify System Bottlenecks
1. Navigate to `/flow-visualization`
2. Click "Bottlenecks" tab
3. Review HIGH severity items
4. Take action on stuck cases

### Use Case 2: Apply Workflow to New Case
1. File new case
2. Navigate to `/templates`
3. Click "Browse Templates"
4. Select template matching case type
5. Click "Apply Template"
6. Checklist items auto-created

### Use Case 3: Track Document Changes
1. Navigate to case documents
2. Click "Upload Document"
3. Upload new version with change description
4. Click "Versions" to view history
5. Restore previous version if needed

### Use Case 4: Monitor Case Progress
1. View case checklist
2. Check completion percentage
3. Identify overdue items
4. Update statuses as work progresses

---

## 📊 Data Flow Diagrams

### Flow Analytics Data Pipeline
```
CaseAudit entries → CaseFlowAnalyticsService
                ↓
      Calculate metrics (court levels, statuses, paths)
                ↓
      Identify bottlenecks (>60 days threshold)
                ↓
      Return comprehensive flow data
                ↓
      CaseFlowVisualization displays charts
```

### Document Upload Flow
```
User drags file → Frontend validates size
               ↓
    FormData prepared with metadata
               ↓
    POST /api/documents/upload
               ↓
    DocumentVersion created (v1.0)
               ↓
    Checksum calculated (SHA-256)
               ↓
    Document saved, response returned
               ↓
    UI refreshes document list
```

### Checklist Update Flow
```
User clicks "Complete" → Frontend calls API
                      ↓
        PUT /api/templates/checklist/{id}
                      ↓
        Status updated to COMPLETED
                      ↓
        completedAt timestamp set
                      ↓
        completedBy user recorded
                      ↓
        Progress percentage recalculated
                      ↓
        UI updates with new progress
```

---

## 🐛 Debugging Tips

### Issue: Flow data not loading
```javascript
// Check browser console
console.log("User role:", user.role); // Must be ADMIN or JUDGE

// Check network tab
// Verify: GET /api/analytics/case-flow returns 200

// Check backend logs
// Look for analytics calculation errors
```

### Issue: Documents not uploading
```javascript
// Check file size
console.log("File size:", file.size / 1024 / 1024, "MB"); // Must be < 50MB

// Check FormData
const formData = new FormData();
console.log("FormData entries:", [...formData.entries()]);

// Check backend
// Verify multipart.max-file-size in application.properties
```

### Issue: Checklist not updating
```javascript
// Check caseId
console.log("Case ID:", caseId); // Must be valid

// Check API response
// Network tab → PUT /api/templates/checklist/{id}
// Should return updated item

// Verify state updates
// React DevTools → Component state should reflect changes
```

---

## 📈 Performance Tips

### Frontend Optimization
```javascript
// Memoize expensive calculations
const progress = useMemo(() => 
  (completed / total) * 100, 
  [completed, total]
);

// Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 300);

// Lazy load components
const CaseFlowViz = lazy(() => import('./components/CaseFlowVisualization'));
```

### Backend Optimization
```java
// Add database indexes
@Table(indexes = {
    @Index(name = "idx_case_id", columnList = "case_id"),
    @Index(name = "idx_status", columnList = "status")
})

// Use pagination for large datasets
Page<CaseChecklistItem> items = repository.findByCaseId(
    caseId, 
    PageRequest.of(0, 20)
);

// Cache frequently accessed data
@Cacheable(value = "templates", key = "#caseType")
public List<CaseTemplate> findByCaseType(CaseType caseType) {
    return templateRepository.findActiveByCaseType(caseType);
}
```

---

## 📚 Further Reading

- [ADVANCED_FEATURES_GUIDE.md](./ADVANCED_FEATURES_GUIDE.md) - Complete documentation
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Implementation summary
- [README.md](./README.md) - Project overview
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Last Updated:** February 12, 2026  
**Quick Ref Version:** 1.0  
**Bookmark This Page:** Essential reference for developers working with advanced features
