# 🏗️ Aura Architecture Corrections & Improvements

## 📋 **KEY CHANGES FROM ORIGINAL DIAGRAM**

### **🔧 1. Backend Service Layer Refinement**

**BEFORE:**
```
Node.js Service - CRUD & Auth
```

**AFTER:**
```
Next.js API Routes (Node.js)
├── 📝 CRUD Operations
├── 🔐 Authentication & RBAC  
├── ⚙️ Business Logic
├── 🧠 RAG Integration
└── 🌉 MCP Bridge Communication
```

**Why**: The actual implementation uses Next.js API routes with specific functional areas, not a generic Node.js service.

### **🔧 2. Database Architecture Correction**

**BEFORE:**
```
Primary Database (e.g., SQL Server)
Vector Database (e.g., Azure AI Search)
```

**AFTER:**
```
MariaDB (aura_playground)
├── 📋 SDLC Tables (business_briefs → initiatives → features → epics → stories)
├── 🔍 Vector Storage (vector_stores, document_chunks, RAG embeddings)
├── 🚀 AuraV2 Extensions (workflow_stages, user_roles, qualified_ideas)
└── 📁 Artifacts (designs, code_items, test_cases)
```

**Why**: Aura uses MariaDB with vector extensions, not separate databases. The schema is hierarchical SDLC-focused.

### **🔧 3. AI Orchestration Service Details**

**BEFORE:**
```
AI Orchestration Service
├── Requirement Agent
├── Code Generator Agent  
└── Test Case Agent
```

**AFTER:**
```
MCP Bridge Server (Python FastAPI, Port 8000)
├── 🤖 Multi-LLM Management (OpenAI, Gemini, Claude)
├── 🎭 Browser Automation (Playwright)
├── 🔗 Enterprise Integration (JIRA)
├── 🔄 Reverse Engineering (Code/Design Analysis)
└── ⚡ AI-Powered Operations
```

**Why**: The MCP Bridge is more comprehensive than simple agents - it's a full orchestration server with multiple capabilities.

### **🔧 4. MCP Servers Specification**

**BEFORE:**
```
Playwright Service (Test Execution)
Jira Service (Create/Update Issues)
```

**AFTER:**
```
🎭 Playwright MCP (Port 8931, Browser Automation)
🔗 JIRA MCP (Remote Atlassian, mcp-remote proxy)
```

**Why**: Added specific port numbers and connection details that match the actual implementation.

### **🔧 5. Version Architecture Addition**

**NEW ADDITION:**
```
Dual Version Architecture
├── 📊 Version 1 (Traditional SDLC)
└── 🚀 AuraV2 (AI-Enhanced + RBAC)
```

**Why**: The dual-version architecture is a key feature of Aura that wasn't represented in the original diagram.

## 🔄 **COMMUNICATION PROTOCOLS CLARIFICATION**

### **Frontend ↔ Backend**
- **Protocol**: REST API over HTTPS
- **Format**: JSON payloads with Zod validation
- **Authentication**: Role-based access control

### **Backend ↔ MCP Bridge**
- **Protocol**: HTTP POST to `localhost:8000`
- **Format**: JSON with Pydantic validation
- **Endpoints**: `/reverse-engineer-code`, `/reverse-engineer-design`, `/generate-code`, etc.

### **MCP Bridge ↔ External AI**
- **Protocol**: HTTPS with secure API calls
- **Authentication**: API Keys (OpenAI, Google, Anthropic)
- **Fallback**: Multi-provider with automatic failover

### **MCP Bridge ↔ MCP Servers**
- **Protocol**: WebSocket/SSE (Server-Sent Events)
- **Standard**: Model Context Protocol (JSON-RPC)
- **Ports**: 8931 (Playwright), Remote (JIRA)

### **Database Connections**
- **Protocol**: MySQL Protocol over TCP/IP
- **Port**: 3306
- **Features**: Connection pooling, transaction support

## 📊 **ARCHITECTURAL PATTERNS IDENTIFIED**

### **🏛️ 1. Layered Architecture**
```
Presentation Layer (Next.js Frontend)
├── Application Layer (API Routes)  
├── Service Layer (MCP Bridge)
├── Integration Layer (MCP Servers)
└── Data Layer (MariaDB)
```

### **🔄 2. Microservices Pattern**
- **Frontend Service**: Next.js application
- **API Service**: Next.js API routes
- **AI Orchestration**: Python MCP Bridge
- **Tool Services**: Playwright & JIRA MCP servers

### **🌉 3. Bridge Pattern**
The MCP Bridge acts as an abstraction layer between the Node.js application and complex AI/automation operations.

### **🔀 4. Strategy Pattern**
Multi-LLM provider management with fallback strategies.

## 🎯 **TECHNOLOGY STACK ACCURACY**

### **Frontend Stack**
- ✅ **Framework**: Next.js 15.3.5
- ✅ **UI Library**: React 19
- ✅ **Language**: TypeScript
- ✅ **Styling**: Tailwind CSS
- ✅ **Components**: Radix UI
- ✅ **State**: Zustand

### **Backend Stack**
- ✅ **API Layer**: Next.js API Routes
- ✅ **AI Bridge**: Python FastAPI
- ✅ **Database**: MariaDB with vector extensions
- ✅ **ORM**: mysql2 (Node.js driver)

### **AI/ML Stack**
- ✅ **LLM Providers**: OpenAI, Google Gemini, Anthropic
- ✅ **Orchestration**: Python with official SDKs + LangChain
- ✅ **Vector Storage**: MariaDB vector extensions
- ✅ **Embeddings**: OpenAI text-embedding-3-small/large

### **Integration Stack**
- ✅ **Browser Automation**: Playwright MCP Server
- ✅ **Enterprise Integration**: JIRA via Atlassian MCP Remote
- ✅ **Protocols**: HTTP/HTTPS, WebSocket, SSE, MySQL Protocol

## 🔍 **ARCHITECTURAL INSIGHTS**

### **💡 1. Unified Database Strategy**
Unlike many AI applications that use separate vector databases, Aura leverages MariaDB's vector extensions for a unified data strategy.

### **💡 2. Bridge Pattern for AI Operations**
The MCP Bridge isolates complex AI operations from the main application, enabling better scalability and maintainability.

### **💡 3. Dual-Version Architecture**
Supports both traditional SDLC workflows (V1) and AI-enhanced workflows (V2) in the same platform.

### **💡 4. Protocol Diversity**
Uses appropriate protocols for each layer: HTTP for APIs, WebSocket for real-time operations, MySQL protocol for database.

## 🎉 **CONCLUSION**

The corrected diagram now accurately represents:
- ✅ Actual technology choices (MariaDB vs SQL Server)
- ✅ Specific service implementations (Next.js API routes vs generic Node.js)
- ✅ Real communication protocols and ports
- ✅ Comprehensive MCP Bridge capabilities
- ✅ Dual-version architecture pattern
- ✅ Unified database strategy with vector extensions

This provides a technically accurate reference for understanding, documenting, and extending the Aura platform architecture.



