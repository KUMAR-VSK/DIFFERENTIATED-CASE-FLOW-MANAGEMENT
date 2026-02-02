# High Court to Supreme Court Escalation Guide

## Overview

This guide explains how cases move from High Court to Supreme Court in the Differentiated Case Flow Management system. The escalation process is designed to ensure proper judicial hierarchy and case management.

## Escalation Process

### 1. **Eligibility Requirements**

For a case to be escalated from High Court to Supreme Court, it must meet the following criteria:

#### **Mandatory Conditions:**
- **Current Court Level**: Must be at `HIGH` court level
- **Case Status**: Must NOT be already `ESCALATED`
- **Escalation Triggers**: Must meet at least one escalation condition

#### **Escalation Triggers:**
1. **Case Dismissal**: Case status is `DISMISSED` (eligible for appeal)
2. **Time Exceeded**: Case has exceeded its estimated resolution time by 2x the estimated duration
3. **Manual Escalation**: Admin or Judge can manually initiate escalation

### 2. **Escalation Workflow**

#### **Step 1: Check Eligibility**
```java
// Backend validation
boolean canEscalate = caseService.canEscalateToSupremeCourt(caseEntity);
```

#### **Step 2: Get Escalation Details**
```java
// Get detailed eligibility information
CaseService.EscalationEligibility eligibility = 
    caseService.getEscalationEligibility(caseId);
```

#### **Step 3: Initiate Escalation**
```java
// Escalate the case
Case escalatedCase = caseService.escalateCase(caseId, "Reason for escalation");
```

### 3. **API Endpoints**

#### **Check Escalation Eligibility**
```http
GET /api/cases/{id}/escalation-eligibility
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "caseId": 123,
  "currentCourtLevel": "HIGH",
  "currentStatus": "DISMISSED",
  "canEscalate": true,
  "canEscalateToSupremeCourt": true,
  "eligibilityReasons": [
    "Case was dismissed - eligible for appeal"
  ]
}
```

#### **Check Supreme Court Eligibility**
```http
GET /api/cases/{id}/can-escalate-to-supreme
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "canEscalateToSupremeCourt": true
}
```

#### **Escalate Case**
```http
POST /api/cases/{id}/escalate
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "reason": "Case dismissed by High Court - appeal to Supreme Court"
}
```

**Response:**
```json
{
  "id": 123,
  "caseNumber": "CASE-2026-0001-HC",
  "title": "Sample Case Title",
  "courtLevel": "SUPREME",
  "status": "ESCALATED",
  "escalationReason": "Case dismissed by High Court - appeal to Supreme Court",
  "escalationDate": "2026-01-31T15:00:00",
  "priority": 10,
  "assignedJudge": null
}
```

### 4. **What Happens During Escalation**

When a case is escalated from High Court to Supreme Court:

#### **Automatic Changes:**
1. **Court Level**: Updated from `HIGH` to `SUPREME`
2. **Case Number**: Updated with `-SC` suffix (e.g., `CASE-2026-0001-SC`)
3. **Status**: Changed to `ESCALATED`
4. **Priority**: Increased by 2 points (capped at 10)
5. **Assigned Judge**: Cleared (new Supreme Court judge will be assigned)
6. **Escalation Date**: Set to current timestamp
7. **Escalation Reason**: Set to provided reason

#### **Case Number Format:**
- **Before**: `CASE-2026-0001-HC`
- **After**: `CASE-2026-0001-SC`

### 5. **Authorization Requirements**

#### **Who Can Escalate:**
- **ADMIN**: Full escalation privileges
- **JUDGE**: Can escalate cases within their court level

#### **Who Can Check Eligibility:**
- **ADMIN**: Can check any case
- **JUDGE**: Can check cases within their court level

### 6. **Frontend Implementation**

#### **Escalation Button (High Court Cases)**
```javascript
// In CaseDetail.js or similar component
const handleEscalateToSupremeCourt = async () => {
  try {
    // Check eligibility first
    const eligibilityResponse = await axios.get(
      `http://localhost:8080/api/cases/${caseId}/can-escalate-to-supreme`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (eligibilityResponse.data.canEscalateToSupremeCourt) {
      const reason = prompt("Enter escalation reason:");
      if (reason) {
        await axios.post(
          `http://localhost:8080/api/cases/${caseId}/escalate`,
          { reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Case escalated to Supreme Court successfully!");
        // Refresh case data
      }
    } else {
      alert("This case is not eligible for Supreme Court escalation.");
    }
  } catch (error) {
    console.error("Escalation failed:", error);
    alert("Failed to escalate case: " + error.response?.data?.message);
  }
};
```

#### **Eligibility Display**
```javascript
// Show escalation eligibility in case details
const EscalationInfo = ({ caseData }) => {
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/cases/${caseData.id}/escalation-eligibility`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEligibility(response.data);
      } catch (error) {
        console.error("Failed to fetch eligibility:", error);
      }
    };
    fetchEligibility();
  }, [caseData.id]);

  if (!eligibility) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
      <h3 className="font-semibold text-blue-900 dark:text-blue-300">Escalation Status</h3>
      <p className="text-sm text-blue-700 dark:text-blue-400">
        Can escalate to Supreme Court: {eligibility.canEscalateToSupremeCourt ? 'Yes' : 'No'}
      </p>
      {eligibility.eligibilityReasons.length > 0 && (
        <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400">
          {eligibility.eligibilityReasons.map((reason, index) => (
            <li key={index}>• {reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 7. **Error Handling**

#### **Common Errors:**
1. **Already at Supreme Court**: "Case is already at the highest court level (Supreme Court)"
2. **Already Escalated**: Case cannot be escalated again
3. **Invalid Court Level**: Case is not at High Court level
4. **Missing Reason**: Escalation reason is required
5. **Authorization**: User doesn't have permission to escalate

#### **Error Responses:**
```json
{
  "message": "Case is already at the highest court level (Supreme Court)"
}
```

### 8. **Best Practices**

#### **For Administrators:**
- Always check eligibility before escalating
- Provide clear, detailed escalation reasons
- Monitor escalation frequency to prevent abuse
- Ensure proper judge assignment after escalation

#### **For Judges:**
- Only escalate cases that truly warrant Supreme Court review
- Document the legal basis for escalation
- Consider alternative dispute resolution methods first
- Coordinate with administrators for complex cases

#### **For System Monitoring:**
- Track escalation rates by court level
- Monitor case resolution times before escalation
- Review escalation reasons for patterns
- Ensure proper case assignment after escalation

### 9. **Integration with Case Management**

#### **Case Status Flow:**
1. **High Court Processing**: `UNDER_REVIEW` → `SCHEDULED` → `DISMISSED`/`COMPLETED`
2. **Escalation Trigger**: Case meets escalation criteria
3. **Supreme Court Assignment**: New Supreme Court judge assigned
4. **Supreme Court Processing**: Case processed at highest level

#### **Priority Management:**
- Supreme Court cases receive highest priority (10)
- Escalated cases are processed before new filings
- Automatic scheduling based on Supreme Court availability

### 10. **Audit Trail**

All escalations are automatically logged with:
- **Escalation Date and Time**
- **Escalation Reason**
- **User who initiated escalation**
- **Previous and new court levels**
- **Case number changes**

This ensures transparency and accountability in the escalation process.

## Summary

The High Court to Supreme Court escalation process in the DCM system is designed to be:
- **Secure**: Proper authorization and validation
- **Transparent**: Clear eligibility criteria and audit trails
- **Efficient**: Automated case number updates and priority adjustments
- **Accountable**: Detailed logging and reason requirements

This system ensures that only appropriate cases reach the Supreme Court while maintaining proper judicial hierarchy and case management efficiency.