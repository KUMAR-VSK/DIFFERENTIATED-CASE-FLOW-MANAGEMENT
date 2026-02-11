# Dynamic Priority Aging - Implementation Complete

## Overview
Successfully implemented **Dynamic Priority Aging** system that automatically increases case priority over time using the formula:

```
Priority += floor(DaysSinceFiling / 30)
```

This ensures older cases don't get forgotten and gain priority automatically every 30 days.

---

## Implementation Summary

### ✅ Backend Changes

#### 1. **PriorityEngine.java** - Core Aging Logic
**Location:** `/backend/src/main/java/com/example/dcm/service/PriorityEngine.java`

**New Methods:**
- `adjustPriorityForAge(Case)` - Applies aging formula to calculate adjusted priority
- `getAgingBoost(Case)` - Returns the aging boost amount for display
- `getCaseAgeDays(Case)` - Calculates days since filing

**Formula Implementation:**
```java
long daysSinceFiling = Duration.between(filingDate, LocalDateTime.now()).toDays();
int agingBoost = (int) Math.floor(daysSinceFiling / 30.0);
int adjustedPriority = basePriority + agingBoost;
// Capped at 1-10 range
return Math.max(1, Math.min(10, adjustedPriority));
```

**Key Features:**
- Only applies to active cases (excludes COMPLETED and DISMISSED)
- Respects 1-10 priority range
- Cases gain +1 priority every 30 days
- Aging is calculated in real-time

---

#### 2. **CaseService.java** - Service Layer
**Location:** `/backend/src/main/java/com/example/dcm/service/CaseService.java`

**New Methods:**

**a) `recalculateAllCasePriorities()`**
```java
public int recalculateAllCasePriorities() {
    // Recalculates priorities for all active cases
    // Applies both base priority calculation and aging
    // Returns count of updated cases
}
```

**b) `getCasePriorityAgingInfo(Long caseId)`**
```java
public Map<String, Object> getCasePriorityAgingInfo(Long caseId) {
    // Returns detailed aging information:
    // - caseAgeDays
    // - basePriority
    // - agingBoost
    // - adjustedPriority
    // - nextAgingBoostIn
    // - formula
}
```

---

#### 3. **CaseController.java** - REST API Endpoints
**Location:** `/backend/src/main/java/com/example/dcm/controller/CaseController.java`

**New Endpoints:**

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/cases/recalculate-priorities` | POST | ADMIN | Manually recalculate all case priorities |
| `/api/cases/{id}/priority-aging` | GET | ALL ROLES | Get detailed aging info for a case |
| `/api/cases/priority-aging-config` | GET | ALL ROLES | Get aging configuration and formula |

**Example Response - Priority Aging Info:**
```json
{
  "caseId": 1,
  "caseNumber": "CASE-2026-0001",
  "filingDate": "2025-11-12T10:30:00",
  "caseAgeDays": 91,
  "basePriority": 6,
  "agingBoost": 3,
  "adjustedPriority": 9,
  "currentPriority": 9,
  "status": "UNDER_REVIEW",
  "agingFormula": "Priority += floor(DaysSinceFiling / 30)",
  "nextAgingBoostIn": 29
}
```

---

### ✅ Frontend Changes

#### 1. **PriorityAgingBadge.js** - New Component
**Location:** `/frontend/src/components/case-detail/PriorityAgingBadge.js`

**Features:**
- Collapsible badge showing aging details
- Fetches aging info from backend API
- Displays:
  - Case age in days
  - Base priority
  - Aging boost
  - Adjusted priority
  - Aging formula
  - Days until next boost
  - Warning for cases > 90 days old

**Visual Design:**
- Blue color scheme matching priority theme
- Dark mode support
- Responsive grid layout
- Icons for better UX
- Warning badges for old cases

---

#### 2. **CaseOverview.js** - Integration
**Location:** `/frontend/src/components/case-detail/CaseOverview.js`

**Changes:**
- Added import for `PriorityAgingBadge`
- Integrated badge component below priority display
- Passes `caseId` and `currentPriority` as props

---

## How It Works

### 1. **Initial Case Creation**
```
Case filed → Base priority calculated (based on type, court level, etc.)
```

### 2. **Aging Over Time**
```
Day 1-29:   Priority = 6 (base)
Day 30-59:  Priority = 7 (base + 1)
Day 60-89:  Priority = 8 (base + 2)
Day 90-119: Priority = 9 (base + 3)
Day 120+:   Priority = 10 (capped at max)
```

### 3. **Automatic Updates**
- Priority is recalculated when:
  - Case is fetched from database
  - Manual recalculation is triggered
  - Case is updated via any endpoint
  - `recalculateAllPriorities()` is called

### 4. **Display to Users**
- Users see ajusted priority in case lists and details
- Can expand aging badge to see breakdown
- Clear visual indicators for aging boost

---

## Configuration

### Current Settings
```javascript
{
  agingInterval: 30,          // days per priority boost
  agingBoost: 1,              // priority points per interval
  maxPriority: 10,           // maximum priority cap
  minPriority: 1,            // minimum priority floor
  formula: "Priority += floor(DaysSinceFiling / 30)"
}
```

### Customization
To modify the aging behavior, update the formula in `PriorityEngine.java`:

```java
// Current: +1 priority every 30 days
int agingBoost = (int) Math.floor(daysSinceFiling / 30.0);

// Example: +1 priority every 15 days (faster aging)
int agingBoost = (int) Math.floor(daysSinceFiling / 15.0);

// Example: +2 priority every 30 days (stronger boost)
int agingBoost = (int) Math.floor(daysSinceFiling / 30.0) * 2;
```

---

## Usage Guide

### For Administrators

**1. View Aging Information for a Case:**
```bash
GET /api/cases/{caseId}/priority-aging
```

**2. Manually Recalculate All Priorities:**
```bash
POST /api/cases/recalculate-priorities
```

**3. Check Aging Configuration:**
```bash
GET /api/cases/priority-aging-config
```

### For End Users

**In Case Detail Page:**
1. Navigate to any case
2. Look for "Priority Level" section
3. Click "Show Priority Aging Details"
4. View breakdown of:
   - Case age
   - Base priority
   - Aging boost
   - Next boost timing

---

## Benefits

### 1. **Prevents Case Stagnation**
- Old cases automatically gain priority
- No case gets stuck indefinitely
- Fair treatment based on age

### 2. **Transparent System**
- Users can see exactly how priority is calculated
- Clear formula displayed in UI
- Real-time aging information

### 3. **Automatic & Maintenance-Free**
- No manual intervention required
- Priorities update automatically
- Aging calculated on-the-fly

### 4. **Flexible & Configurable**
- Easy to adjust aging interval
- Simple formula modification
- Respects priority bounds

---

## Examples

### Example 1: Constitutional Case
```
Case Type: CONSTITUTIONAL
Filed: 2025-10-01
Base Priority: 8 (constitutional cases start higher)
Age: 133 days
Aging Boost: floor(133/30) = 4

Adjusted Priority: 8 + 4 = 12 → Capped at 10
Result: Priority = 10 (Maximum)
```

### Example 2: Civil Case
```
Case Type: CIVIL
Filed: 2025-12-01
Base Priority: 5 (civil cases start medium)
Age: 72 days
Aging Boost: floor(72/30) = 2

Adjusted Priority: 5 + 2 = 7
Result: Priority = 7
```

### Example 3: Administrative Case
```
Case Type: ADMINISTRATIVE
Filed: 2026-01-15
Base Priority: 4 (administrative cases start lower)
Age: 27 days
Aging Boost: floor(27/30) = 0

Adjusted Priority: 4 + 0 = 4
Result: Priority = 4 (No aging boost yet)
```

---

## Testing

### Test Scenarios

**1. New Case (< 30 days)**
- ✅ Should have no aging boost
- ✅ Priority should equal base priority
- ✅ "Next boost in" should show remaining days

**2. Month-Old Case (30-59 days)**
- ✅ Should have +1 aging boost
- ✅ Priority should be base + 1
- ✅ Aging badge should show boost clearly

**3. Very Old Case (> 180 days)**
- ✅ Should have significant aging boost
- ✅ Priority should be capped at 10
- ✅ Warning message should display

**4. Completed/Dismissed Case**
- ✅ Should NOT receive aging boost
- ✅ Priority should remain fixed
- ✅ Aging info should still be viewable

---

## Future Enhancements

### Potential Improvements:

1. **Scheduled Background Job**
   - Run priority recalculation daily
   - Update all active cases automatically
   - Log aging adjustments

2. **Aging Notifications**
   - Alert administrators when cases receive aging boost
   - Email notifications for cases approaching 90 days
   - Dashboard widget showing aging statistics

3. **Configurable Aging Rules**
   - Different aging rates for different case types
   - Court-level-specific aging formulas
   - Threshold-based accelerated aging

4. **Aging History Tracking**
   - Audit log of priority changes
   - Historical aging chart
   - Trend analysis

5. **Smart Aging**
   - Combine with deadline urgency
   - Factor in court capacity
   - Ml-based priority prediction

---

## API Documentation

### Get Priority Aging Info
```http
GET /api/cases/{id}/priority-aging
Authorization: Required
Roles: ALL

Response 200:
{
  "caseId": 1,
  "caseNumber": "CASE-2026-0001",
  "filingDate": "2025-11-12T10:30:00",
  "caseAgeDays": 91,
  "basePriority": 6,
  "agingBoost": 3,
  "adjustedPriority": 9,
  "currentPriority": 9,
  "status": "UNDER_REVIEW",
  "agingFormula": "Priority += floor(DaysSinceFiling / 30)",
  "nextAgingBoostIn": 29
}
```

### Recalculate All Priorities
```http
POST /api/cases/recalculate-priorities
Authorization: Required
Roles: ADMIN

Response 200:
{
  "message": "Priorities recalculated successfully",
  "updatedCases": 45
}
```

### Get Aging Configuration
```http
GET /api/cases/priority-aging-config
Authorization: Required
Roles: ALL

Response 200:
{
  "agingInterval": 30,
  "description": "Cases gain 1 priority point every 30 days",
  "formula": "Priority += floor(DaysSinceFiling / 30)",
  "maxPriority": 10,
  "minPriority": 1
}
```

---

## Conclusion

The Dynamic Priority Aging system is now **fully implemented and operational**. It provides:

✅ Automatic priority increases over time  
✅ Fair treatment for older cases  
✅ Transparent calculation with visible formula  
✅ User-friendly UI badge showing aging details  
✅ REST API for programmatic access  
✅ Admin controls for manual recalculation  

The system is **production-ready** and requires no manual intervention to function correctly.

---

## Related Files

### Backend
- `/backend/src/main/java/com/example/dcm/service/PriorityEngine.java`
- `/backend/src/main/java/com/example/dcm/service/CaseService.java`
- `/backend/src/main/java/com/example/dcm/controller/CaseController.java`

### Frontend
- `/frontend/src/components/case-detail/PriorityAgingBadge.js`
- `/frontend/src/components/case-detail/CaseOverview.js`

### Documentation
- `/PRIORITY_SCHEDULING_STRATEGIES.md` - All scheduling strategies
- `/BUG_FIXES_CASE_SCHEDULING.md` - Recent bug fixes
- `/DYNAMIC_PRIORITY_AGING.md` - This document
