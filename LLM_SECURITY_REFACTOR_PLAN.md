# 🔐 LLM API Key Security Refactor - Implementation Plan

## 🎯 **Objectives**
1. **Remove ALL client-side API key management** (localStorage, Zustand, UI inputs)
2. **Move to server-side only** key management via environment variables
3. **Preserve all existing functionality** and UI behavior
4. **Prepare for Azure Key Vault** integration (implement switch, test later)
5. **Support Azure OpenAI** with endpoint + deployment configuration

---

## 📋 **Step-by-Step Implementation Plan**

### **Phase 1: Backend Infrastructure** (Steps 1-5)

#### ✅ **Step 1: Create Server-Side Secrets Manager**
**File**: `src/lib/secrets/secrets-manager.ts`
- [ ] Create `SecretsManager` class (server-side only)
- [ ] Auto-detect environment (Azure vs Local)
- [ ] Support multiple providers (OpenAI, Google, Azure OpenAI, Anthropic)
- [ ] Read from `process.env` for local dev
- [ ] Prepare Key Vault integration (with feature flag)
- [ ] Export singleton instance

**Deliverable**: Server-side secrets management with environment detection

---

#### ✅ **Step 2: Create Provider Configuration API**
**File**: `src/app/api/llm/providers/route.ts`
- [ ] GET endpoint: Returns available providers (no keys)
- [ ] Returns: provider name, configured status, available models
- [ ] Server-side key validation (test connection optional)
- [ ] Never expose actual keys to client
- [ ] Response format: `{ openai: { configured: true, models: [...] } }`

**Deliverable**: Secure API to check provider availability

---

#### ✅ **Step 3: Create Test Connection API**
**File**: `src/app/api/llm/test-connection/route.ts`
- [ ] POST endpoint: Test if provider credentials work
- [ ] Input: provider name only (no key from client)
- [ ] Server retrieves key from secrets manager
- [ ] Makes test API call to provider
- [ ] Returns: success/failure + error message (no key details)

**Deliverable**: Secure connection testing endpoint

---

#### ✅ **Step 4: Create Azure OpenAI Configuration Support**
**File**: `src/lib/services/azure-openai-service.ts`
- [ ] Separate service for Azure OpenAI
- [ ] Support: endpoint, deployment, apiVersion
- [ ] Compatible with existing LLMService interface
- [ ] Environment variable mapping
- [ ] Key Vault integration prep (with flag)

**Deliverable**: Azure OpenAI service implementation

---

#### ✅ **Step 5: Update All Generation APIs to Use Secrets Manager**
**Files**: `src/app/api/generation/route.ts`, `/generate-*/route.ts`
- [ ] Replace direct `llmSettings.apiKey` usage
- [ ] Use `SecretsManager.getApiKey(provider)` instead
- [ ] Remove API key from request payloads where possible
- [ ] Validate on server-side only
- [ ] Update all existing generation endpoints (features, epics, stories, initiatives)

**Deliverable**: All APIs use server-side key management

---

### **Phase 2: Frontend Cleanup** (Steps 6-10)

#### ✅ **Step 6: Update Settings Store - Remove Key Persistence**
**File**: `src/store/settings-store.ts`
- [ ] Remove `apiKey` from store state
- [ ] Remove `apiKeys` object (openai, google, anthropic)
- [ ] Remove `setAPIKey` action
- [ ] Remove `setProviderAPIKey` action
- [ ] Remove API keys from `partialize` (persistence)
- [ ] Keep provider/model selection logic
- [ ] Update `getV1ModuleLLM` to call backend API for validation

**Deliverable**: Clean settings store with no key storage

---

#### ✅ **Step 7: Create Frontend Provider Status Hook**
**File**: `src/hooks/useProviderStatus.ts`
- [ ] Hook to fetch provider configuration from `/api/llm/providers`
- [ ] Returns: available providers, configured status
- [ ] Cache with SWR or React Query
- [ ] Refresh on settings page mount
- [ ] No key exposure

**Deliverable**: Frontend hook for provider status

---

#### ✅ **Step 8: Redesign Settings UI - Remove Key Inputs**
**Files**: `src/app/v1/settings/page.tsx`, `src/app/settings/page.tsx`
- [ ] Remove API key input fields (text/password inputs)
- [ ] Remove show/hide password toggle
- [ ] Keep provider/model dropdowns
- [ ] Add provider status indicators (✅ Configured / ⚠️ Not Configured)
- [ ] Add "Test Connection" button per provider
- [ ] Show configuration source (Environment / Key Vault)
- [ ] Add help text: "Configure keys in .env.local (dev) or Azure Key Vault (prod)"

**Deliverable**: Secure settings UI without key exposure

---

#### ✅ **Step 9: Update Generation Flow to Work with Server-Side Keys**
**File**: `src/hooks/useGenerationFlow.ts`
- [ ] Remove LLM settings from request payload
- [ ] Send only: provider name, model name
- [ ] Backend retrieves keys server-side
- [ ] Update all API calls to new format
- [ ] Maintain existing functionality

**Deliverable**: Generation flow works with server-side keys

---

#### ✅ **Step 10: Clean Up localStorage Migration**
**File**: `src/lib/utils/migrate-storage.ts` (new)
- [ ] Create migration script
- [ ] Remove API keys from existing localStorage
- [ ] Run on app initialization
- [ ] One-time cleanup for existing users
- [ ] Log migration completion

**Deliverable**: Clean migration for existing installations

---

### **Phase 3: Azure Key Vault Preparation** (Steps 11-13)

#### ✅ **Step 11: Install Azure SDK Dependencies**
**File**: `package.json`
- [ ] Add `@azure/keyvault-secrets`
- [ ] Add `@azure/identity`
- [ ] Add `@azure/app-configuration` (optional)
- [ ] Test installation locally

**Deliverable**: Azure SDKs ready for Key Vault

---

#### ✅ **Step 12: Implement Key Vault Integration (Feature Flag)**
**File**: `src/lib/secrets/azure-key-vault.ts`
- [ ] Create Key Vault client wrapper
- [ ] Use `DefaultAzureCredential` (works local + Azure)
- [ ] Map secret names to provider keys
- [ ] Feature flag: `USE_AZURE_KEY_VAULT=true/false`
- [ ] Graceful fallback to env vars if flag is false
- [ ] Error handling for Key Vault access issues

**Deliverable**: Key Vault integration (testable in Azure only)

---

#### ✅ **Step 13: Environment-Specific Configuration Files**
**Files**: `config/azure/app-service-config.json`, Documentation
- [ ] Document environment variables needed
- [ ] Create Azure App Service configuration template
- [ ] Document Managed Identity setup steps
- [ ] Document Key Vault secret naming convention
- [ ] Create deployment checklist

**Deliverable**: Complete Azure deployment documentation

---

### **Phase 4: Testing & Verification** (Steps 14-16)

#### ✅ **Step 14: Local Testing**
- [ ] Test all generation flows (Initiatives, Features, Epics, Stories)
- [ ] Verify no keys in localStorage
- [ ] Verify no keys in browser DevTools
- [ ] Verify no keys in network requests
- [ ] Test provider switching (OpenAI ↔ Google)
- [ ] Test connection testing functionality
- [ ] Verify all V1 module settings work

**Deliverable**: Fully tested local implementation

---

#### ✅ **Step 15: Update Docker Container**
- [ ] Copy all changed files to Docker container
- [ ] Ensure `.env` file in container has keys
- [ ] Test generation flows in containerized environment
- [ ] Verify no regressions

**Deliverable**: Working Docker deployment

---

#### ✅ **Step 16: Prepare for Azure Deployment**
- [ ] Create Key Vault in Azure (when ready)
- [ ] Add all secrets to Key Vault
- [ ] Enable App Service Managed Identity
- [ ] Configure Key Vault access policies
- [ ] Set `USE_AZURE_KEY_VAULT=true` in App Service config
- [ ] Deploy and test in Azure

**Deliverable**: Production-ready Azure deployment

---

## 🔒 **Security Checklist**

### **Before (Current State):**
- ❌ API keys in `localStorage` (browser storage)
- ❌ Keys in Zustand with persistence
- ❌ Keys sent from client in API requests
- ❌ Keys visible in React DevTools
- ❌ `NEXT_PUBLIC_*` keys in client bundle

### **After (Target State):**
- ✅ API keys ONLY in server-side `process.env`
- ✅ NO keys in localStorage or client state
- ✅ Backend retrieves keys from env/Key Vault
- ✅ NO keys in API request/response payloads
- ✅ NO `NEXT_PUBLIC_*` API key variables
- ✅ Keys never touch browser

---

## 🏗️ **Architecture After Refactor**

```
┌──────────────────────────────────────────────────┐
│ BROWSER (Client)                                 │
├──────────────────────────────────────────────────┤
│  Settings UI:                                    │
│   • Provider dropdown (OpenAI, Google, etc.)     │
│   • Model dropdown                               │
│   • Provider status: ✅ Configured / ⚠️ Not      │
│   • Test Connection button                       │
│   ❌ NO API KEY INPUT FIELD                      │
│   ❌ NO KEYS IN STATE/STORAGE                    │
└──────────────────────────────────────────────────┘
              ↓ API: /api/llm/providers
┌──────────────────────────────────────────────────┐
│ BACKEND API (Next.js Server)                     │
├──────────────────────────────────────────────────┤
│  SecretsManager.getApiKey(provider)              │
│    ↓                                              │
│  if (AZURE_ENV) → Key Vault                      │
│  else → process.env                              │
│    ↓                                              │
│  LLMService(provider, model)                     │
│    • Server retrieves key                        │
│    • Makes LLM API call                          │
│    • Returns result (no key in response)         │
└──────────────────────────────────────────────────┘
              ↓ Secrets Source
┌──────────────────────────────────────────────────┐
│ SECRETS STORAGE                                  │
├──────────────────────────────────────────────────┤
│  Local Dev:                                      │
│   └─ .env.local (gitignored)                    │
│        OPENAI_API_KEY=sk-xxx                     │
│        GOOGLE_API_KEY=AIza-xxx                   │
│                                                   │
│  Azure Production:                               │
│   └─ Azure Key Vault                            │
│        • openai-api-key (secret)                │
│        • azure-openai-endpoint (secret)          │
│        • azure-openai-key (secret)               │
│        • Managed Identity access                 │
└──────────────────────────────────────────────────┘
```

---

## 📝 **Implementation Order**

### **TODAY (Local Dev):**
1. Create SecretsManager (Steps 1)
2. Create Provider API (Step 2)
3. Create Test Connection API (Step 3)
4. Update generation APIs to use SecretsManager (Step 5)
5. Update Settings Store - remove keys (Step 6)
6. Update Settings UI - remove key inputs (Step 8)
7. Update generation flow (Step 9)
8. Test locally (Step 14)

### **AFTER YOUR APPROVAL:**
9. Copy to Docker container (Step 15)
10. Test in Docker
11. Rebuild images if working

### **LATER (Azure Deployment):**
12. Implement Key Vault (Steps 11-12)
13. Deploy to Azure and test (Step 16)

---

## ⚠️ **Critical Questions Before I Start:**

1. **Are your API keys already in `.env.local`?** 
   - If yes: Perfect, no changes needed
   - If no: I'll need to know where to document this

2. **Do you want to keep provider/model selection in UI?**
   - Assume yes: Users can select OpenAI or Google, but keys from env

3. **Test Connection feature needed?**
   - Recommend yes: Let users verify their env keys work

4. **Azure OpenAI**: 
   - Do you have endpoint URL already? 
   - Do you want me to add Azure OpenAI as a provider option now?

---

## 🚀 **Shall I Proceed?**

**I'll start with Step 1-9 to get local dev working securely. Please confirm:**

✅ **Remove all client-side key management**  
✅ **Server-side only** (env vars for now, Key Vault later)  
✅ **Preserve UI functionality** (provider/model selection)  
✅ **No key input fields** in UI  
✅ **Test locally first**, then Docker

**Ready to start implementation when you give the green light!** 🚦

