# HITL Generation Flow - Fix Plan

## 🎯 **Issues to Fix**

### **1. UI/UX Improvements**
- [ ] **Additional Context Field**: Make textarea larger (more rows) in both modals
- [ ] **Row-level Spinner**: Show spinner in Actions column while generating
- [ ] **Progress Feedback**: Visual indication that generation is happening

### **2. Table Refresh Issues**  
- [ ] **Features Refresh**: Fix disappearing features after save in Work Items
- [ ] **Data Reload**: Ensure proper state management after generation
- [ ] **UI Synchronization**: Immediate table updates without page refresh

### **3. Epic Generation Error**
- [ ] **Binding Parameters**: Fix "binding parameters cannot be undefined" error
- [ ] **Database Schema**: Verify epic insertion SQL matches actual schema
- [ ] **Parent Data**: Ensure all required parent relationships are available

### **4. Spinner Integration**
- [ ] **Table Component**: Add spinner state to work items table
- [ ] **State Management**: Sync generation state with table spinners
- [ ] **Loading Indicators**: Show/hide spinners based on generation status

---

## 📋 **Implementation Steps**

### **Step 1: Fix Additional Context Field Size**
- Update `GenerationPromptModal.tsx` textarea rows from 3 to 6
- Test in both Business Brief and Work Items pages

### **Step 2: Implement Row-level Spinners**
- Modify `WorkItemsTable` to show spinners during generation
- Update generation flow to set/clear loading states per item
- Sync spinner visibility with modal state

### **Step 3: Fix Features Table Refresh**
- Debug the `refreshDataAfterGeneration()` function
- Ensure proper state clearing and reloading
- Fix data synchronization between stores and UI

### **Step 4: Fix Epic Generation Error**
- Check Epic generation API and database binding
- Verify parent data retrieval (feature → initiative → business brief)
- Fix any undefined parameters in SQL execution

### **Step 5: Integration Testing**
- Test complete flow for all item types
- Verify spinners appear/disappear correctly
- Confirm table refreshes work reliably
- Validate audit trail completeness

### **Step 6: Docker Deployment**
- Copy all modified files to Docker container
- Test complete flows in containerized environment
- Rebuild images if everything works correctly

---

## 🛠️ **Files to Modify**

### **Frontend**
- `src/components/modals/GenerationPromptModal.tsx` - larger textarea
- `src/components/ui/work-items-table.tsx` - row-level spinners
- `src/app/v1/requirements/page.tsx` - refresh logic improvements
- `src/app/v1/use-cases/page.tsx` - spinner state management
- `src/hooks/useGenerationFlow.ts` - loading state integration

### **Backend** 
- `src/app/api/generation/persist/route.ts` - fix epic binding parameters
- Potentially: Epic generation endpoint if schema mismatches exist

### **Verification**
- All existing generation endpoints continue working
- New HITL flow works for all item types
- Audit system captures all actions properly
- UI updates immediately after operations

---

## ✅ **Success Criteria**

- [ ] Additional context fields are easily usable (larger)
- [ ] Table shows clear visual feedback during generation
- [ ] Features/Epics/Stories appear immediately after saving
- [ ] Epic generation works without binding errors
- [ ] Complete audit trail for all generation activities
- [ ] Consistent UX across all generation types
