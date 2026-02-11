# 📅 Hearing Calendar Feature - Implementation Guide

**Date Implemented:** February 11, 2026  
**Status:** ✅ Complete and Ready  
**Priority:** High Impact Feature

---

## 🎉 What's New?

A beautiful, interactive **Hearing Calendar** that displays all scheduled case hearings in a visual calendar format with:

### ✨ Key Features:

1. **Multiple View Modes:**
   - Month View (default)
   - Week View  
   - Day View
   - List View

2. **Color-Coded Events:**
   - **Priority Levels** (background color):
     - 🔴 Red: High Priority (8-10)
     - 🟠 Orange: Medium Priority (5-7)
     - 🟢 Green: Low Priority (1-4)
   
   - **Court Levels** (border color):
     - 🔵 Blue: District Court
     - 🟣 Purple: High Court
     - 🩷 Pink: Supreme Court

3. **Interactive Features:**
   - Click any event to see detailed case information
   - Quick navigation to case details page
   - Visual legend for easy understanding
   - Real-time statistics (Total, High Priority, This Week)

4. **Dark Mode Support:**
   - Fully themed for both light and dark modes
   - Smooth transitions and visual consistency

---

## 🚀 How to Use

### For Users:

1. **Access the Calendar:**
   - Click "📅 Calendar" in the navigation bar (top menu)
   - Available to all authenticated users (Admin, Judge, Clerk)

2. **Navigate Views:**
   - Use the dropdown in the top-right to switch between Month/Week/Day/List views
   - Click arrows to navigate between time periods
   - Click "Today" button to return to current date

3. **View Hearing Details:**
   - Click on any colored event in the calendar
   - A popup modal will show:
     - Case number
     - Title
     - Hearing date and time
     - Priority level
     - Court level
     - Case type
     - Assigned judge
     - Status
   - Click "View Case Details" to go to full case page

4. **Understand Color Coding:**
   - Check the legend at the top to understand priority and court level colors
   - High priority cases are immediately visible in red

---

## 🔧 Technical Implementation

### Backend Changes:

#### 1. New Repository Method
**File:** `backend/src/main/java/com/example/dcm/repository/CaseRepository.java`
```java
@Query("SELECT c FROM Case c WHERE c.hearingDate IS NOT NULL ORDER BY c.hearingDate ASC")
List<Case> findAllScheduledHearings();
```

#### 2. New Service Method
**File:** `backend/src/main/java/com/example/dcm/service/CaseService.java`
```java
public List<Case> getAllScheduledHearings() {
    return caseRepository.findAllScheduledHearings();
}
```

#### 3. New API Endpoint
**File:** `backend/src/main/java/com/example/dcm/controller/CaseController.java`
```java
@GetMapping("/hearings")
@PreAuthorize("hasRole('ADMIN') or hasRole('JUDGE') or hasRole('CLERK')")
public ResponseEntity<List<Case>> getAllHearings() {
    List<Case> cases = caseService.getAllScheduledHearings();
    return ResponseEntity.ok(cases);
}
```

**Endpoint:** `GET /api/cases/hearings`  
**Access:** Admin, Judge, Clerk  
**Returns:** List of all cases with scheduled hearing dates

### Frontend Changes:

#### 1. New Dependencies
```json
{
  "@fullcalendar/react": "^6.x",
  "@fullcalendar/daygrid": "^6.x",
  "@fullcalendar/timegrid": "^6.x",
  "@fullcalendar/interaction": "^6.x",
  "@fullcalendar/list": "^6.x"
}
```

#### 2. New Component
**File:** `frontend/src/components/HearingCalendar.js` (370+ lines)

Features:
- FullCalendar integration
- Event color mapping by priority and court level
- Interactive event click handlers
- Modal for event details
- Statistics cards
- Responsive design
- Dark mode support

#### 3. Router Configuration
**File:** `frontend/src/App.js`
- Added `import HearingCalendar from './components/HearingCalendar'`
- Added route: `/calendar` → `<HearingCalendar />`
- Protected route (requires authentication)

#### 4. Navigation Updates
**File:** `frontend/src/components/Navigation.js`
- Added "📅 Calendar" link to desktop menu
- Added "📅 Calendar" link to mobile menu

#### 5. CSS Styling
**File:** `frontend/src/index.css`
- Added 70+ lines of FullCalendar dark mode styles
- Custom theming for calendar components
- Border and background color customization

---

## 🎨 Visual Design

### Color Palette:

**Priority Colors:**
- High (8-10): `#DC2626` (red-600)
- Medium (5-7): `#F59E0B` (amber-500)
- Low (1-4): `#10B981` (emerald-500)

**Court Level Border Colors:**
- District: `#3B82F6` (blue-500)
- High: `#8B5CF6` (violet-500)
- Supreme: `#EC4899` (pink-500)

**Dark Mode:**
- Background: `#0f172a` (slate-900)
- Hover: `#1e293b` (slate-800)
- Text: `#e2e8f0` (slate-200)
- Borders: `#475569` (slate-600)

---

## 📊 Data Flow

```
User clicks "Calendar" 
  → HearingCalendar component mounts
  → fetchHearings() called
  → GET /api/cases/hearings
  → Backend: CaseController.getAllHearings()
  → CaseService.getAllScheduledHearings()
  → CaseRepository.findAllScheduledHearings()
  → Query: SELECT cases WHERE hearingDate IS NOT NULL
  → Return List<Case>
  → Frontend maps to FullCalendar events:
      - id: caseId
      - title: "CASE-2026-0001: Title"
      - start: hearingDate
      - backgroundColor: getPriorityColor(priority)
      - borderColor: getCourtLevelColor(courtLevel)
      - extendedProps: { case details }
  → Render calendar with events
  → User clicks event → Modal with details
  → User clicks "View Case" → Navigate to /cases/:id
```

---

## 🧪 Testing Checklist

- [x] Backend endpoint returns scheduled hearings
- [x] Calendar renders in all view modes (Month/Week/Day/List)
- [x] Events display with correct priority colors
- [x] Events display with correct court level borders
- [x] Click event opens modal with details
- [x] Modal shows all case information correctly
- [x] "View Case Details" navigates to case page
- [x] Statistics cards show correct counts
- [x] Dark mode styling works correctly
- [x] Responsive design on mobile devices
- [x] Navigation links work (desktop + mobile)
- [x] Only shows cases with hearingDate set

---

## 🔮 Future Enhancements

### Phase 1 (Near-term):
1. **Drag-and-drop rescheduling** - Allow judges to drag events to new dates
2. **Filtering** - Filter by court level, priority, case type
3. **Export functionality** - Export calendar to Google Calendar/Outlook
4. **Conflict detection** - Highlight scheduling conflicts for judges

### Phase 2 (Medium-term):
5. **Judge workload view** - Show hearings per judge
6. **Courtroom assignment** - Assign specific courtrooms to hearings
7. **Recurring hearings** - Support for multi-session cases
8. **Reminders** - Send email/notification reminders before hearings

### Phase 3 (Long-term):
9. **Video hearing integration** - Link to Zoom/Jitsi for virtual hearings
10. **Public calendar** - Public-facing calendar for case parties
11. **Calendar sync** - Two-way sync with external calendars
12. **AI scheduling** - Auto-suggest optimal hearing times

---

## 🐛 Troubleshooting

### Calendar not loading?
- Check backend is running on port 8080
- Verify `/api/cases/hearings` endpoint is accessible
- Check browser console for errors
- Ensure user is authenticated

### Events not showing?
- Verify cases have `hearingDate` set
- Check if hearingDate is in valid ISO format
- Ensure database has cases with scheduled hearings

### Dark mode not working?
- Check if `index.css` has FullCalendar dark mode styles
- Verify dark mode is enabled in app settings
- Hard refresh browser (Cmd+Shift+R)

### Performance issues?
- If 100+ events, consider pagination
- Use timeRangeQuery to only load visible events
- Implement caching for hearing data

---

## 📝 API Reference

### GET /api/cases/hearings

**Description:** Retrieve all cases with scheduled hearings

**Authorization:** Required (Admin, Judge, Clerk)

**Request:**
```http
GET /api/cases/hearings HTTP/1.1
Host: localhost:8080
Authorization: Basic <credentials>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "caseNumber": "CASE-2026-0001",
    "title": "Civil Dispute XYZ",
    "hearingDate": "2026-02-15T10:00:00",
    "priority": 8,
    "courtLevel": "DISTRICT",
    "status": "SCHEDULED",
    "caseType": "CIVIL",
    "assignedJudge": {
      "id": 2,
      "firstName": "John",
      "lastName": "Smith"
    }
  }
]
```

---

## 🎓 Code Examples

### Add a hearing to a case:
```javascript
// Frontend
const scheduleHearing = async (caseId, date) => {
  await axios.put(`/api/cases/${caseId}/schedule`, {
    hearingDate: date.toISOString()
  });
  
  // Refresh calendar
  fetchHearings();
};
```

### Backend (already implemented):
```java
@PutMapping("/{id}/schedule")
public ResponseEntity<Case> scheduleHearing(
    @PathVariable Long id,
    @RequestBody Map<String, String> request) {
    
    String hearingDateStr = request.get("hearingDate");
    LocalDateTime hearingDate = LocalDateTime.parse(hearingDateStr);
    Case updatedCase = caseService.scheduleHearing(id, hearingDate);
    return ResponseEntity.ok(updatedCase);
}
```

---

## 📖 User Documentation

### For Clerks:
- Use the calendar to view all scheduled hearings
- Check for available time slots before scheduling new hearings
- Monitor high-priority cases (shown in red)

### For Judges:
- View your assigned hearings
- Check your schedule for the week/month
- Click on hearings to access case details quickly

### For Admins:
- Monitor overall hearing schedule
- Identify workload distribution across judges
- Spot scheduling conflicts or gaps

---

## ✅ Success Metrics

After implementation:
- ✅ All scheduled hearings are visually displayed
- ✅ Users can easily navigate between different time periods
- ✅ Priority cases are immediately identifiable
- ✅ Court level information is clearly indicated
- ✅ Quick access to case details with one click
- ✅ Statistics provide at-a-glance insights
- ✅ Dark mode provides comfortable viewing experience

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the API documentation
- Inspect browser console for errors
- Check backend logs for server-side issues

---

**Built with ❤️ using FullCalendar, React, and Spring Boot**

*Last updated: February 11, 2026*
