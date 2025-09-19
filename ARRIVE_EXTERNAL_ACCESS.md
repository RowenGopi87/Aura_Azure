# ARRIVE External System Access Guide

## Overview
ARRIVE YAML files are now stored as physical files on the filesystem and accessible via HTTP API endpoints for external systems integration.

## Physical File Location
```
C:\Dev\Aura-Playground\arrive-yaml\
├── component-name-1/
│   ├── arrive.yaml      # Component definition
│   └── advances.yaml    # Task definitions
├── component-name-2/
│   ├── arrive.yaml
│   └── advances.yaml
└── ...
```

## API Endpoints for External Systems

### 1. List All ARRIVE Files
```http
GET http://localhost:3000/api/arrive/list
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 4,
    "components": 2,
    "files": [
      "arrive-yaml/user-authentication/arrive.yaml",
      "arrive-yaml/user-authentication/advances.yaml",
      "arrive-yaml/payment-system/arrive.yaml",
      "arrive-yaml/payment-system/advances.yaml"
    ],
    "componentMap": {
      "user-authentication": {
        "arrive": "arrive-yaml/user-authentication/arrive.yaml",
        "advances": "arrive-yaml/user-authentication/advances.yaml"
      },
      "payment-system": {
        "arrive": "arrive-yaml/payment-system/arrive.yaml",
        "advances": "arrive-yaml/payment-system/advances.yaml"
      }
    }
  }
}
```

### 2. Get Specific ARRIVE File
```http
GET http://localhost:3000/api/arrive/files/arrive-yaml/component-name/arrive.yaml
GET http://localhost:3000/api/arrive/files/arrive-yaml/component-name/advances.yaml
```

**Response Headers:**
- `Content-Type: application/x-yaml`
- `Content-Disposition: attachment; filename="arrive.yaml"`
- `Access-Control-Allow-Origin: *` (CORS enabled)

**Response Body:** Raw YAML content

### 3. Clear All ARRIVE Files
```http
DELETE http://localhost:3000/api/arrive/list
```

## External System Integration Examples

### Example 1: Bash/Shell Script
```bash
#!/bin/bash
# Get list of all ARRIVE components
curl -s "http://localhost:3000/api/arrive/list" | jq '.data.componentMap'

# Download specific component files
curl -o "user-auth-arrive.yaml" \
  "http://localhost:3000/api/arrive/files/arrive-yaml/user-authentication/arrive.yaml"

curl -o "user-auth-advances.yaml" \
  "http://localhost:3000/api/arrive/files/arrive-yaml/user-authentication/advances.yaml"
```

### Example 2: Python Script
```python
import requests
import json

# Get list of components
response = requests.get('http://localhost:3000/api/arrive/list')
data = response.json()

if data['success']:
    components = data['data']['componentMap']
    
    for component_name, files in components.items():
        print(f"Processing component: {component_name}")
        
        # Download arrive.yaml
        if 'arrive' in files:
            arrive_response = requests.get(f"http://localhost:3000/api/arrive/files/{files['arrive']}")
            with open(f"{component_name}-arrive.yaml", 'w') as f:
                f.write(arrive_response.text)
        
        # Download advances.yaml
        if 'advances' in files:
            advances_response = requests.get(f"http://localhost:3000/api/arrive/files/{files['advances']}")
            with open(f"{component_name}-advances.yaml", 'w') as f:
                f.write(advances_response.text)
```

### Example 3: PowerShell Script
```powershell
# Get list of components
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/arrive/list"

if ($response.success) {
    foreach ($component in $response.data.componentMap.PSObject.Properties) {
        $componentName = $component.Name
        $files = $component.Value
        
        Write-Host "Processing component: $componentName"
        
        # Download files
        if ($files.arrive) {
            $arriveContent = Invoke-RestMethod -Uri "http://localhost:3000/api/arrive/files/$($files.arrive)"
            $arriveContent | Out-File -FilePath "$componentName-arrive.yaml" -Encoding UTF8
        }
        
        if ($files.advances) {
            $advancesContent = Invoke-RestMethod -Uri "http://localhost:3000/api/arrive/files/$($files.advances)"
            $advancesContent | Out-File -FilePath "$componentName-advances.yaml" -Encoding UTF8
        }
    }
}
```

### Example 4: Node.js/JavaScript
```javascript
const fs = require('fs');
const path = require('path');

async function downloadArriveFiles() {
    try {
        // Get list of components
        const response = await fetch('http://localhost:3000/api/arrive/list');
        const data = await response.json();
        
        if (data.success) {
            const components = data.data.componentMap;
            
            for (const [componentName, files] of Object.entries(components)) {
                console.log(`Processing component: ${componentName}`);
                
                // Download arrive.yaml
                if (files.arrive) {
                    const arriveResponse = await fetch(`http://localhost:3000/api/arrive/files/${files.arrive}`);
                    const arriveContent = await arriveResponse.text();
                    fs.writeFileSync(`${componentName}-arrive.yaml`, arriveContent);
                }
                
                // Download advances.yaml
                if (files.advances) {
                    const advancesResponse = await fetch(`http://localhost:3000/api/arrive/files/${files.advances}`);
                    const advancesContent = await advancesResponse.text();
                    fs.writeFileSync(`${componentName}-advances.yaml`, advancesContent);
                }
            }
        }
    } catch (error) {
        console.error('Error downloading ARRIVE files:', error);
    }
}

downloadArriveFiles();
```

## File System Access (Direct)

External systems can also directly read files from the filesystem:

### Windows
```cmd
dir "C:\Dev\Aura-Playground\arrive-yaml" /s
type "C:\Dev\Aura-Playground\arrive-yaml\component-name\arrive.yaml"
```

### Linux/Mac
```bash
find /path/to/Aura-Playground/arrive-yaml -name "*.yaml"
cat /path/to/Aura-Playground/arrive-yaml/component-name/arrive.yaml
```

## Integration Patterns

### 1. Polling Pattern
External system periodically checks for new files:
```bash
# Check every 5 minutes
while true; do
    curl -s "http://localhost:3000/api/arrive/list" | jq '.data.totalFiles'
    sleep 300
done
```

### 2. Event-Driven Pattern
Monitor file system changes (future enhancement):
```bash
# Using inotifywait (Linux) or similar tools
inotifywait -m -r -e create,modify "C:\Dev\Aura-Playground\arrive-yaml"
```

### 3. Batch Processing Pattern
Download all files periodically for batch processing:
```python
import schedule
import time

def sync_arrive_files():
    # Download and process all ARRIVE files
    pass

schedule.every(1).hour.do(sync_arrive_files)
```

## Security Considerations

- **CORS**: API endpoints have CORS enabled for external access
- **File Access**: Ensure proper file system permissions
- **Path Validation**: API validates file paths to prevent directory traversal
- **Network Access**: External systems need network access to localhost:3000

## Troubleshooting

### Common Issues:
1. **Files not found**: Check if ARRIVE generation is enabled in settings
2. **Permission errors**: Ensure write permissions to arrive-yaml directory
3. **API not responding**: Verify Aura development server is running
4. **CORS errors**: Check if accessing from allowed origins

### Debug Commands:
```bash
# Check if files exist
ls -la "C:\Dev\Aura-Playground\arrive-yaml"

# Test API endpoint
curl -v "http://localhost:3000/api/arrive/list"

# Check server logs
# Look for 🎯 ARRIVE YAML Generation messages in console
```
