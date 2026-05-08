# Enrollment Approval Workflow

## Overview

A new admin approval system has been implemented for course enrollments. Students can no longer immediately access courses after enrollment. Their enrollment requests must be approved by an admin before they can access course content and generate certificates.

## System Workflow

### 1. Student Enrollment Request

- Student clicks "Enroll" on a published course
- Enrollment record is created with status: `pending`
- Student receives message: "Enrollment request sent, awaiting admin approval"
- Student cannot access course content until approval

### 2. Admin Approval/Rejection

- Admin views pending enrollment requests via the admin dashboard
- Admin can either **approve** or **reject** each enrollment request

#### Approve Enrollment

**Endpoint:** `PUT /api/admin/enrollments/:id/approve`

```bash
curl -X POST http://localhost:5000/api/admin/enrollments/{enrollmentId}/approve \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "success": true,
  "message": "Enrollment approved for John Doe in course Python Basics",
  "data": {
    "id": "enrollment-uuid",
    "studentId": "student-uuid",
    "courseId": "course-uuid",
    "status": "active",
    "approvedAt": "2026-05-08T10:30:00Z",
    "approvedBy": "admin-uuid"
  }
}
```

When approved:

- Enrollment status changes to `active`
- `approvedAt` timestamp is recorded
- `approvedBy` field stores admin ID
- UserCourseProgress status is updated to `active`
- Course totalStudents counter is incremented
- Student can now access course content

#### Reject Enrollment

**Endpoint:** `POST /api/admin/enrollments/:id/reject`

```bash
curl -X POST http://localhost:5000/api/admin/enrollments/{enrollmentId}/reject \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Your application does not meet course prerequisites"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Enrollment rejected for Jane Doe in course Python Basics",
  "data": {
    "id": "enrollment-uuid",
    "studentId": "student-uuid",
    "courseId": "course-uuid",
    "status": "rejected",
    "rejectionReason": "Your application does not meet course prerequisites"
  }
}
```

When rejected:

- Enrollment status changes to `rejected`
- `rejectionReason` field stores the reason
- Student cannot access course content
- Student can submit a new enrollment request later

### 3. Certificate Generation

- Certificate can only be generated if enrollment is **approved** (`status: active`)
- Before: Students could bypass approval by passing exams
- After: Certificate generation is blocked with message:
  ```
  "Certificate Generation Denied: Your enrollment must be approved by an admin first."
  ```

## Enrollment Status States

| Status   | Description             | Can Access Course | Can Get Certificate          |
| -------- | ----------------------- | ----------------- | ---------------------------- |
| pending  | Awaiting admin approval | ❌ No             | ❌ No                        |
| active   | Approved by admin       | ✅ Yes            | ✅ Yes (if requirements met) |
| rejected | Rejected by admin       | ❌ No             | ❌ No                        |

## API Endpoints

### View Pending Enrollments

**Endpoint:** `GET /api/admin/enrollments/pending`

```bash
curl -X GET http://localhost:5000/api/admin/enrollments/pending \
  -H "Authorization: Bearer {adminToken}"
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "enrollment-uuid",
      "studentId": "student-uuid",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "courseId": "course-uuid",
      "courseTitle": "Python Basics",
      "requestedAt": "2026-05-08T09:00:00Z",
      "status": "pending"
    }
  ]
}
```

### View Active Enrollments

**Endpoint:** `GET /api/admin/enrollments/active`

```bash
curl -X GET http://localhost:5000/api/admin/enrollments/active \
  -H "Authorization: Bearer {adminToken}"
```

### Update Enrollment Status (Alternative)

**Endpoint:** `PUT /api/admin/enrollments/:id/status`

```bash
curl -X PUT http://localhost:5000/api/admin/enrollments/{enrollmentId}/status \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "reason": "Optional approval reason"
  }'
```

## Database Schema Changes

### Enrollment Model Updates

New fields added to track approval:

```prisma
model Enrollment {
  id                String   @id @default(uuid())
  studentId         String
  student           User     @relation("EnrollmentStudent", fields: [studentId], references: [id])
  courseId          String
  course            Course   @relation(fields: [courseId], references: [id])
  sectionId         String?
  status            String   @default("pending")
  reason            String   @default("")
  requestedAt       DateTime @default(now())

  // NEW FIELDS FOR APPROVAL TRACKING
  approvedAt        DateTime?        // Timestamp when admin approved
  approvedBy        String?          // ID of approving admin
  rejectionReason   String   @default("")  // Why enrollment was rejected

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([studentId, courseId])
}
```

## Error Handling

### Student Tries to Access Unapproved Course

**Response:**

```json
{
  "success": false,
  "message": "Your enrollment request is pending admin approval. You can access the course once approved.",
  "enrollmentStatus": "pending"
}
```

### Student Tries to Get Certificate Without Approval

**Response:**

```json
{
  "success": false,
  "message": "Certificate Generation Denied: Your enrollment must be approved by an admin first.",
  "approvalRequired": true
}
```

### Admin Tries to Approve Non-Pending Enrollment

**Response:**

```json
{
  "success": false,
  "message": "Cannot approve enrollment with status: active"
}
```

## Frontend Integration Tips

### 1. Show Enrollment Status to Students

```javascript
if (enrollmentStatus === "pending") {
  // Show: "Your enrollment is pending admin approval"
} else if (enrollmentStatus === "rejected") {
  // Show: "Your enrollment was rejected. Reason: {rejectionReason}"
} else if (enrollmentStatus === "active") {
  // Show: "You are enrolled and can access the course"
}
```

### 2. Admin Dashboard

- Add a tab: "Pending Enrollments"
- Display table with student info, course, and action buttons
- Buttons: "Approve" and "Reject"
- Input field for rejection reason
- Show count of pending approvals

### 3. Certificate Generation

```javascript
if (!enrollment || enrollment.status !== "active") {
  showError("Your enrollment must be approved by admin first");
  return;
}
// Proceed with certificate generation
```

## Migration Details

- **Migration Name:** `add_enrollment_approval_fields`
- **New Columns:**
  - `approvedAt` (DateTime, nullable)
  - `approvedBy` (String, nullable)
  - `rejectionReason` (String, default: "")

## Security Notes

1. ✅ Only admins can approve/reject enrollments
2. ✅ All approval actions are logged with admin ID
3. ✅ Certificate generation validates enrollment approval
4. ✅ Students cannot bypass approval system
5. ✅ Timestamps track all approval actions

## Rollback Instructions (if needed)

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back 20260508015917_add_enrollment_approval_fields

# Or reset database
npx prisma migrate reset
```

## Testing Checklist

- [ ] Student submits enrollment request
- [ ] Enrollment appears in pending list
- [ ] Student cannot access course (403 error)
- [ ] Student cannot generate certificate (403 error)
- [ ] Admin approves enrollment
- [ ] Student can now access course
- [ ] Student can generate certificate
- [ ] Admin rejects enrollment with reason
- [ ] Student sees rejection message
- [ ] Student can submit new enrollment request
