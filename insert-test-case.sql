INSERT INTO test_cases (
  id, 
  work_item_id, 
  work_item_type, 
  test_type, 
  description, 
  steps, 
  expected_result, 
  status
) VALUES (
  'TC-EMI-001',
  'STORY-REV-001',
  'story',
  'functional',
  'Verify that the Emirates manage booking form displays appropriate validation messages when users attempt to check in without providing required information (family name and booking reference).',
  '1. Navigate to emirates.com in web browser
2. Locate the "Manage Booking" widget/section on homepage
3. Click on "Manage Booking" tab if widget has multiple tabs
4. Leave both "Family Name/Surname" and "Booking Reference" fields empty
5. Click "Check In" button
6. Enter surname "Smith" in Family Name field, leave Booking Reference empty
7. Click "Check In" button
8. Clear Family Name field, enter "ABC123" in Booking Reference field
9. Click "Check In" button
10. Enter "Smith" in Family Name and "ABC123" in Booking Reference
11. Click "Check In" button',
  'Step 5: Validation message appears: "Please enter a family name and booking reference"
Step 7: Validation message appears indicating booking reference is required
Step 9: Validation message appears indicating family name is required
Step 11: Form submits successfully, proceeds to booking retrieval process',
  'not_run'
);



