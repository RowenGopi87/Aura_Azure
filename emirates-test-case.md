# Emirates Manage Booking - Test Case

## Test Case ID: TC-EMI-001
**Test Case Title:** Manage Booking Form Validation - Missing Family Name and Booking Reference

### Test Objective
Verify that the Emirates manage booking form displays appropriate validation messages when users attempt to check in without providing required information (family name and booking reference).

### Preconditions
- User has access to internet browser
- Emirates.com website is accessible
- Manage booking functionality is available on the homepage

### Test Data
- **Valid Surname:** Smith
- **Valid Booking Reference:** ABC123
- **Invalid Inputs:** Empty fields, partial information

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to emirates.com in web browser | Emirates homepage loads successfully |
| 2 | Locate the "Manage Booking" widget/section on homepage | Manage booking widget is visible and accessible |
| 3 | Click on "Manage Booking" tab if widget has multiple tabs | Manage booking form is displayed |
| 4 | Leave both "Family Name/Surname" and "Booking Reference" fields empty | Fields remain empty |
| 5 | Click "Check In" button | Validation message appears: "Please enter a family name and booking reference" |
| 6 | Enter surname "Smith" in Family Name field, leave Booking Reference empty | Family Name field populated, Booking Reference field empty |
| 7 | Click "Check In" button | Validation message appears indicating booking reference is required |
| 8 | Clear Family Name field, enter "ABC123" in Booking Reference field | Booking Reference field populated, Family Name field empty |
| 9 | Click "Check In" button | Validation message appears indicating family name is required |
| 10 | Enter "Smith" in Family Name and "ABC123" in Booking Reference | Both fields populated correctly |
| 11 | Click "Check In" button | Form submits successfully, proceeds to booking retrieval process |

### Expected Results
1. **Empty Form Submission:** When both fields are empty and user clicks "Check In", the system should display: "Please enter a family name and booking reference"
2. **Partial Information:** When only one field is completed, appropriate field-specific validation messages should appear
3. **Complete Information:** When both required fields are provided, form should submit successfully
4. **User Experience:** Validation messages should be clear, user-friendly, and appear immediately upon form submission attempt

### Pass/Fail Criteria
- **PASS:** All validation messages appear as expected for each scenario
- **FAIL:** Validation messages are missing, incorrect, or form submits with incomplete information

### Test Environment
- **Browser:** Chrome, Firefox, Safari, Edge
- **Device:** Desktop, Mobile, Tablet
- **Operating System:** Windows, macOS, iOS, Android

### Notes
- Test should be performed across multiple browsers and devices to ensure consistent behavior
- Validation should occur client-side for immediate feedback
- Error messages should follow Emirates brand guidelines for tone and style

### Related Requirements
- **Story ID:** STORY-REV-001
- **Epic ID:** EPIC-REV-001  
- **Feature ID:** FEAT-REV-001
- **Initiative ID:** INIT-mfwgu6vt-qyguj
- **Business Brief ID:** BB-MFWGTVEZ

### Automation Potential
This test case is suitable for automation using tools like:
- Selenium WebDriver
- Cypress
- Playwright
- TestCafe

### Sample Automation Script (Pseudo-code)
```javascript
// Navigate to Emirates homepage
await page.goto('https://emirates.com');

// Locate manage booking section
const manageBookingWidget = await page.locator('[data-testid="manage-booking-widget"]');

// Click check-in without filling fields
await page.click('[data-testid="checkin-button"]');

// Verify validation message
const validationMessage = await page.locator('[data-testid="validation-message"]');
await expect(validationMessage).toHaveText('Please enter a family name and booking reference');
```



