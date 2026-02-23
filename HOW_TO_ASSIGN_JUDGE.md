# 📋 How to Assign a Judge to a Case

## ✅ Current Status

- ✅ **Backend API exists** - Ready to use
- ❌ **Frontend UI missing** - Need to create

---

## 🔧 Method 1: Using API (Available Now)

### Endpoint Details:
```
PUT /api/cases/{caseId}/assign-judge?judgeId={judgeId}
Authorization: Admin only
```

### Step-by-Step:

#### 1. Get the Judge's ID

First, get a list of judges:
```bash
curl -u admin:admin123 http://localhost:8080/api/users
```

Look for users with `role: "JUDGE"` and note their `id`.

#### 2. Assign the Judge to a Case

```bash
# Example: Assign judge with ID 2 to case with ID 1
curl -X PUT "http://localhost:8080/api/cases/1/assign-judge?judgeId=2" \
  -u admin:admin123 \
  -H "Content-Type: application/json"
```

#### 3. Verify Assignment

Get the case details to confirm:
```bash
curl -u admin:admin123 http://localhost:8080/api/cases/1
```

Look for the `assignedJudge` field in the response.

---

## 📝 Complete Examples

### Example 1: Assign Judge to New Case

```bash
# Step 1: Get available judges
curl -u admin:admin123 http://localhost:8080/api/users

# Response shows:
# {
#   "id": 2,
#   "username": "judge1",
#   "role": "JUDGE",
#   "courtLevel": "DISTRICT"
# }

# Step 2: Assign the judge
curl -X PUT "http://localhost:8080/api/cases/5/assign-judge?judgeId=2" \
  -u admin:admin123

# Step 3: Confirm
curl -u admin:admin123 http://localhost:8080/api/cases/5
```

### Example 2: Reassign Judge

```bash
# Change assigned judge from one judge to another
curl -X PUT "http://localhost:8080/api/cases/3/assign-judge?judgeId=4" \
  -u admin:admin123
```

### Example 3: Get Cases by Judge

```bash
# See all cases assigned to a specific judge
curl -u admin:admin123 http://localhost:8080/api/cases/judge/2
```

---

## 🎯 Method 2: Using Frontend (To Be Implemented)

### What Needs to Be Created:

1. **Admin Panel Component**
   - Dropdown to select judge
   - Button to assign  
   - Shows current assignment

2. **Case Edit Page**
   - Judge selection dropdown
   - Auto-saves on change

3. **Bulk Assignment**
   - Select multiple cases
   - Assign same judge to all

---

## 🛠️ Quick Frontend Implementation

If you want to add a frontend UI for this, here's the code:

### Add to CaseDetail.js or CaseEdit.js

```javascript
const [judges, setJudges] = useState([]);
const [selectedJudgeId, setSelectedJudgeId] = useState('');

// Fetch available judges
useEffect(() => {
  const fetchJudges = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users');
      const judgeUsers = response.data.filter(user => user.role === 'JUDGE');
      setJudges(judgeUsers);
    } catch (error) {
      console.error('Error fetching judges:', error);
    }
  };
  fetchJudges();
}, []);

// Assign judge function
const handleAssignJudge = async () => {
  if (!selectedJudgeId) {
    showToast('Please select a judge', 'error');
    return;
  }

  try {
    await axios.put(
      `http://localhost:8080/api/cases/${id}/assign-judge?judgeId=${selectedJudgeId}`,
      null,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${user.username}:${password}`)}`
        }
      }
    );
    
    showToast('Judge assigned successfully');
    // Refresh case data
    const response = await axios.get(`http://localhost:8080/api/cases/${id}`);
    setCaseData(response.data);
  } catch (error) {
    console.error('Error assigning judge:', error);
    showToast('Failed to assign judge', 'error');
  }
};

// JSX to render
return (
  <div className="space-y-4">
    <label className="block text-sm font-medium text-gray-700">
      Assign Judge
    </label>
    <select
      value={selectedJudgeId}
      onChange={(e) => setSelectedJudgeId(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
    >
      <option value="">Select a judge...</option>
      {judges.map(judge => (
        <option key={judge.id} value={judge.id}>
          {judge.username} - {judge.courtLevel}
        </option>
      ))}
    </select>
    <button
      onClick={handleAssignJudge}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      Assign Judge
    </button>
    
    {caseData.assignedJudge && (
      <p className="text-sm text-gray-600">
        Currently assigned to: {caseData.assignedJudge.username}
      </p>
    )}
  </div>
);
```

---

## 🔑 Important Notes

### Authorization:
- **Only ADMIN** can assign judges
- Judges and Clerks cannot assign judges

### Requirements:
- Judge must exist in the system
- Judge must have appropriate court level
- Case must exist

### Related Endpoints:
```bash
# Get all judges
GET /api/users (filter by role='JUDGE')

# Get cases by specific judge
GET /api/cases/judge/{judgeId}

# Get cases by judge's court level
GET /api/cases/judge/{judgeId}/court-level
```

---

## 💡 Recommended Workflow

### For Admins:

1. **View Unassigned Cases:**
   ```bash
   curl -u admin:admin123 http://localhost:8080/api/cases/management
   ```

2. **Check Available Judges:**
   ```bash
   curl -u admin:admin123 http://localhost:8080/api/users
   ```

3. **Assign Judge:**
   ```bash
   curl -X PUT "http://localhost:8080/api/cases/{caseId}/assign-judge?judgeId={judgeId}" \
     -u admin:admin123
   ```

4. **Verify:**
   ```bash
   curl -u admin:admin123 http://localhost:8080/api/cases/judge/{judgeId}
   ```

---

## 🎯 Quick Test

Try this now with your running backend:

```bash
# 1. Get all cases
curl -u admin:admin123 http://localhost:8080/api/cases

# 2. Get all users (find a JUDGE)
curl -u admin:admin123 http://localhost:8080/api/users

# 3. Assign judge ID 2 to case ID 1
curl -X PUT "http://localhost:8080/api/cases/1/assign-judge?judgeId=2" \
  -u admin:admin123

# 4. Verify
curl -u admin:admin123 http://localhost:8080/api/cases/1
```

---

## 📚 API Response

### Success Response (200 OK):
```json
{
  "id": 1,
  "caseNumber": "CASE-2026-0001",
  "title": "Contract Dispute",
  "assignedJudge": {
    "id": 2,
    "username": "judge1",
    "role": "JUDGE",
    "courtLevel": "DISTRICT"
  },
  ...other fields...
}
```

### Error Response (400 Bad Request):
```json
{
  "timestamp": "2026-02-17T21:50:00",
  "status": 400,
  "message": "Judge not found",
  "path": "/api/cases/1/assign-judge"
}
```

---

## ✅ Summary

**Available Now:**
- ✅ Backend API endpoint working
- ✅ Can assign via curl/Postman
- ✅ Admin authorization working

**To Be Added:**
- ❌ Frontend UI dropdown
- ❌ Visual confirmation
- ❌ Bulk assignment feature

**Use the curl commands above to assign judges right now!** 🚀
