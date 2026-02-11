# 🎯 Complete Testing Guide

## Overview
This guide will walk you through testing all the features we implemented:
1. ✅ Case update fixes (calendar refresh)
2. ✅ Timing fixes (hearing datetime)
3. ✅ Dynamic Priority Aging system

---

## 🚀 Step 1: Start the Applications

### A. Start Backend (Spring Boot)

Open a terminal and run:

```bash
cd "/Users/kumarvs/Downloads/S8 PROJECT/backend"
mvn spring-boot:run
```

**Wait for:**
```
Started DcmApplication in X.XXX seconds
```

**Backend should be running on:** `http://localhost:8080`

---

### B. Start Frontend (React)

Open a **new terminal** and run:

```bash
cd "/Users/kumarvs/Downloads/S8 PROJECT/frontend"
npm start
```

**Wait for:**
```
Compiled successfully!
Local: http://localhost:3000
```

**Frontend should open automatically** in your browser at `http://localhost:3000`

---

## 🧪 Step 2: Test Bug Fixes

### Test 1: Calendar Auto-Refresh ✅

**Goal:** Verify that the calendar updates automatically when a hearing is scheduled

**Steps:**
1. Open browser to `http://localhost:3000`
2. Login (use any admin/judge account)
3. Navigate to **Cases** → Select any case
4. Click **"Schedule Hearing"** button
5. Select a future date and time
6. Click **"Schedule Hearing"**
7. Navigate to **"Hearing Calendar"** (from sidebar)
8. **RESULT:** The new hearing should appear within 30 seconds OR click the **"Refresh"** button

**Expected:**
- ✅ Hearing appears in calendar
- ✅ Refresh button shows spinning icon when loading
- ✅ Auto-refresh happens every 30 seconds

---

### Test 2: Timing Accuracy ✅

**Goal:** Verify that hearing times are saved and displayed correctly

**Steps:**
1. Schedule a hearing for **2:30 PM** tomorrow
2. Check the Case Detail page → should show **2:30 PM**
3. Check the Hearing Calendar → should show **2:30 PM**
4. Refresh the page → time should still be **2:30 PM**

**Expected:**
- ✅ Time matches what you selected
- ✅ No timezone conversion issues
- ✅ Consistent across all pages

---

## 🎨 Step 3: Test Priority Aging System

### Test 3a: View Priority Aging Badge

**Goal:** See the priority aging information for a case

**Steps:**
1. Go to any Case Detail page
2. Look for the **"Priority Level"** section (right sidebar)
3. You'll see the current priority (e.g., "Priority 7/10")
4. Click **"Show Priority Aging Details"** (blue link below priority)

**Expected Display:**
```
┌────────────────────────────────────┐
│ Priority Aging Information         │
├────────────────────────────────────┤
│ Case Age:           45 days        │
│ Base Priority:      6/10           │
│ Aging Boost:        +1             │
│ Adjusted Priority:  7/10           │
├────────────────────────────────────┤
│ Formula: Priority += floor(Days/30)│
│ Next boost in: 15 days             │
└────────────────────────────────────┘
```

**Expected:**
- ✅ Badge expands to show details
- ✅ All metrics are calculated correctly
- ✅ Formula is displayed
- ✅ "Next boost in" countdown shows

---

### Test 3b: Verify Aging Calculation

**Goal:** Confirm the aging formula works correctly

**Manual Calculation Example:**
```
Case filed: 60 days ago
Base priority: 5 (calculated from case type, court level, etc.)
Aging boost: floor(60 / 30) = 2
Adjusted priority: 5 + 2 = 7
```

**Steps:**
1. Find a case's filing date
2. Calculate days since filing
3. Apply formula: `floor(days / 30)`
4. Add to base priority
5. Compare with the badge's "Adjusted Priority"

**Expected:**
- ✅ Calculation matches the formula
- ✅ Priority is capped at 10
- ✅ Completed cases don't get aging boost

---

### Test 3c: Test API Endpoints

**Goal:** Verify the new REST API endpoints work

#### A. Get Aging Info for a Case

Open **Postman** or use **curl**:

```bash
curl -X GET http://localhost:8080/api/cases/1/priority-aging \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
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

#### B. Get Aging Configuration

```bash
curl -X GET http://localhost:8080/api/cases/priority-aging-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "agingInterval": 30,
  "description": "Cases gain 1 priority point every 30 days",
  "formula": "Priority += floor(DaysSinceFiling / 30)",
  "maxPriority": 10,
  "minPriority": 1
}
```

#### C. Recalculate All Priorities (Admin Only)

```bash
curl -X POST http://localhost:8080/api/cases/recalculate-priorities \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Priorities recalculated successfully",
  "updatedCases": 45
}
```

---

## 📊 Step 4: Test Different Scenarios

### Scenario 1: Brand New Case (< 30 days)

**Setup:** Create a new case today

**Expected:**
- Base priority: Calculated from case type
- Aging boost: **0** (not old enough)
- Adjusted priority: Same as base
- Badge shows: "Next boost in X days"

---

### Scenario 2: Month-Old Case (30-59 days)

**Setup:** Find or create a case filed 30-59 days ago

**Expected:**
- Aging boost: **+1**
- Adjusted priority: Base + 1
- Badge shows boost in green
- "Next boost in" shows 1-29 days

---

### Scenario 3: Very Old Case (> 90 days)

**Setup:** Find or create a case filed > 90 days ago

**Expected:**
- Aging boost: **+3 or more**
- Warning message: "⚠️ This case is over 90 days old..."
- Priority may be capped at 10
- Clear visual indication of urgency

---

### Scenario 4: Completed Case

**Setup:** Mark a case as COMPLETED

**Expected:**
- Aging boost: **0** (no aging for completed cases)
- Priority: Fixed (doesn't increase)
- Badge still shows info but no aging applied

---

## 🔍 Step 5: Visual Verification Checklist

### Frontend UI Checks

**Hearing Calendar:**
- [ ] "Refresh" button visible and clickable
- [ ] Refresh icon spins when loading
- [ ] Calendar shows correct dates and times
- [ ] Events are color-coded by priority

**Case Detail Page:**
- [ ] Priority badge displays correctly
- [ ] "Show Priority Aging Details" link appears
- [ ] Aging details expand/collapse smoothly
- [ ] All aging metrics display properly
- [ ] Dark mode support works

**Priority Aging Badge:**
- [ ] Case age in days
- [ ] Base priority value
- [ ] Aging boost with "+" prefix
- [ ] Adjusted priority
- [ ] Formula display
- [ ] "Next boost in" countdown
- [ ] Warning for cases > 90 days old

---

## 🐛 Troubleshooting

### Issue 1: Backend won't start

**Error:** `mvnw: command not found`

**Solution:**
```bash
# Use Maven directly
cd backend
mvn spring-boot:run

# Or build JAR first
mvn clean package
java -jar target/dcm-0.0.1-SNAPSHOT.jar
```

---

### Issue 2: Frontend can't connect to backend

**Error:** `ERR_CONNECTION_REFUSED`

**Check:**
1. Is backend running on port 8080?
2. Check console: `netstat -an | grep 8080`
3. Verify CORS settings in backend
4. Check browser console for errors

---

### Issue 3: Calendar not showing hearings

**Check:**
1. Does the case have a hearing date set?
2. Is the hearing date in the future?
3. Check browser console for API errors
4. Click the "Refresh" button manually
5. Verify backend endpoint: `GET /api/cases/hearings`

---

### Issue 4: Priority aging not showing

**Check:**
1. Is the case filed more than 0 days ago?
2. Is the case status active (not COMPLETED/DISMISSED)?
3. Check browser console for API errors
4. Verify endpoint: `GET /api/cases/{id}/priority-aging`

---

## 📝 Testing Checklist

Print this out and check off as you test:

### Bug Fixes
- [ ] Calendar auto-refreshes every 30 seconds
- [ ] Manual refresh button works
- [ ] Refresh icon animates during loading
- [ ] Hearing times save correctly
- [ ] Hearing times display correctly
- [ ] No timezone conversion issues

### Priority Aging
- [ ] Aging badge appears on case detail page
- [ ] Badge expands/collapses on click
- [ ] Case age displays correctly
- [ ] Base priority shows
- [ ] Aging boost calculates correctly
- [ ] Adjusted priority is correct
- [ ] Formula displays
- [ ] "Next boost in" countdown works
- [ ] Warning appears for cases > 90 days
- [ ] No aging for completed cases

### API Endpoints
- [ ] GET `/api/cases/{id}/priority-aging` works
- [ ] GET `/api/cases/priority-aging-config` works
- [ ] POST `/api/cases/recalculate-priorities` works (admin)
- [ ] All endpoints return correct data
- [ ] Authentication works properly

---

## 🎯 Quick Test Script

Run this to quickly verify everything:

```bash
# 1. Start backend
cd "/Users/kumarvs/Downloads/S8 PROJECT/backend"
mvn spring-boot:run &

# 2. Wait for backend to start
sleep 10

# 3. Start frontend
cd "/Users/kumarvs/Downloads/S8 PROJECT/frontend"
npm start &

# 4. Open browser
open http://localhost:3000
```

---

## 📚 Documentation Reference

Refer to these files for detailed information:

1. **IMPLEMENTATION_SUMMARY.md** - Overview of all changes
2. **BUG_FIXES_CASE_SCHEDULING.md** - Bug fix details
3. **DYNAMIC_PRIORITY_AGING.md** - Priority aging system docs
4. **PRIORITY_SCHEDULING_STRATEGIES.md** - Future enhancements

---

## 🎓 What to Look For

### Success Indicators:

✅ **Calendar works:**
- Hearings appear automatically
- Refresh button updates data
- Times are accurate

✅ **Priority aging works:**
- Old cases have higher priority
- Formula is transparent
- Calculations are correct

✅ **UI is polished:**
- Dark mode works
- Animations are smooth
- No console errors

---

## 🚀 Next Steps After Testing

Once everything is tested and working:

1. **Document any issues** you find
2. **Consider implementing** other strategies from `PRIORITY_SCHEDULING_STRATEGIES.md`
3. **Deploy to production** when ready
4. **Monitor** priority distribution over time

---

## 💡 Pro Tips

1. **Use browser DevTools:**
   - Network tab to see API calls
   - Console for error messages
   - Application tab for localStorage

2. **Test in different browsers:**
   - Chrome
   - Firefox
   - Safari

3. **Test in both themes:**
   - Light mode
   - Dark mode

4. **Test different roles:**
   - Admin
   - Judge
   - Clerk
   - Lawyer

---

## ✨ You're All Set!

Follow this guide step by step, and you'll verify that all the implementations are working correctly. If you encounter any issues, refer to the troubleshooting section or the detailed documentation files.

Happy Testing! 🎉
