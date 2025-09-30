// Azure Aura Application Deployment
// Bicep template for deploying Aura containers to existing Azure infrastructure

@description('Location for all resources')
param location string = resourceGroup().location

@description('Container Registry Name')
param containerRegistryName string = 'aura1devtestbeacrmaen'

@description('Virtual Network Name')
param vnetName string = 'maen-vnet-devtest-aura1-nw-001'

@description('Workload Subnet Name')
param subnetName string = 'workload subnet'

@description('Key Vault Name for secrets')
param keyVaultName string = 'aura1-devtest-be-kv-maen'

@description('Database Server Name')
param databaseServerName string = 'aura1devtestbestmaen'

@description('Image version tag')
param imageVersion string = 'latest'

@description('Environment prefix')
param environmentPrefix string = 'aura1-prod'

// Reference existing resources
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' existing = {
  name: vnetName
  
  resource subnet 'subnets' existing = {
    name: subnetName
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Container Groups for Aura services
resource auraDatabase 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = {
  name: '${environmentPrefix}-database-cg'
  location: location
  properties: {
    containers: [
      {
        name: 'aura-database'
        properties: {
          image: '${containerRegistry.properties.loginServer}/aura/aura-database:${imageVersion}'
          ports: [
            {
              port: 3306
              protocol: 'TCP'
            }
          ]
          resources: {
            requests: {
              cpu: 1
              memoryInGB: 2
            }
          }
          environmentVariables: [
            {
              name: 'MYSQL_ROOT_PASSWORD'
              secureValue: 'aura_root_password_123'
            }
            {
              name: 'MYSQL_DATABASE'
              value: 'aura_playground'
            }
            {
              name: 'MYSQL_USER'
              value: 'aura_user'
            }
            {
              name: 'MYSQL_PASSWORD'
              secureValue: 'aura_password_123'
            }
          ]
          volumeMounts: [
            {
              name: 'mysql-data'
              mountPath: '/var/lib/mysql'
            }
          ]
        }
      }
    ]
    restartPolicy: 'Always'
    osType: 'Linux'
    ipAddress: {
      type: 'Private'
      ports: [
        {
          port: 3306
          protocol: 'TCP'
        }
      ]
    }
    imageRegistryCredentials: [
      {
        server: containerRegistry.properties.loginServer
        username: containerRegistry.listCredentials().username
        password: containerRegistry.listCredentials().passwords[0].value
      }
    ]
    subnetIds: [
      {
        id: vnet::subnet.id
      }
    ]
    volumes: [
      {
        name: 'mysql-data'
        emptyDir: {}
      }
    ]
  }
}

resource auraMcpServices 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = {
  name: '${environmentPrefix}-mcp-services-cg'
  location: location
  properties: {
    containers: [
      {
        name: 'aura-mcp-services'
        properties: {
          image: '${containerRegistry.properties.loginServer}/aura/aura-mcp-services:${imageVersion}'
          ports: [
            {
              port: 8000
              protocol: 'TCP'
            }
            {
              port: 8931
              protocol: 'TCP'
            }
          ]
          resources: {
            requests: {
              cpu: 2
              memoryInGB: 4
            }
          }
          environmentVariables: [
            {
              name: 'MCP_BRIDGE_PORT'
              value: '8000'
            }
            {
              name: 'PLAYWRIGHT_MCP_PORT'
              value: '8931'
            }
            {
              name: 'PLAYWRIGHT_HEADLESS'
              value: 'true'
            }
            {
              name: 'PYTHONUNBUFFERED'
              value: '1'
            }
          ]
        }
      }
    ]
    restartPolicy: 'Always'
    osType: 'Linux'
    ipAddress: {
      type: 'Private'
      ports: [
        {
          port: 8000
          protocol: 'TCP'
        }
        {
          port: 8931
          protocol: 'TCP'
        }
      ]
    }
    imageRegistryCredentials: [
      {
        server: containerRegistry.properties.loginServer
        username: containerRegistry.listCredentials().username
        password: containerRegistry.listCredentials().passwords[0].value
      }
    ]
    subnetIds: [
      {
        id: vnet::subnet.id
      }
    ]
  }
  dependsOn: [
    auraDatabase
  ]
}

resource auraApplication 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = {
  name: '${environmentPrefix}-application-cg'
  location: location
  properties: {
    containers: [
      {
        name: 'aura-application'
        properties: {
          image: '${containerRegistry.properties.loginServer}/aura/aura-application:${imageVersion}'
          ports: [
            {
              port: 3000
              protocol: 'TCP'
            }
          ]
          resources: {
            requests: {
              cpu: 2
              memoryInGB: 4
            }
          }
          environmentVariables: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'AURA_DB_HOST'
              value: auraDatabase.properties.ipAddress.ip
            }
            {
              name: 'AURA_DB_PORT'
              value: '3306'
            }
            {
              name: 'AURA_DB_USER'
              value: 'aura_user'
            }
            {
              name: 'AURA_DB_PASSWORD'
              secureValue: 'aura_password_123'
            }
            {
              name: 'AURA_DB_NAME'
              value: 'aura_playground'
            }
            {
              name: 'MCP_BRIDGE_URL'
              value: 'http://${auraMcpServices.properties.ipAddress.ip}:8000'
            }
            {
              name: 'PLAYWRIGHT_MCP_URL'
              value: 'http://${auraMcpServices.properties.ipAddress.ip}:8931'
            }
            {
              name: 'NEXT_PUBLIC_APP_URL'
              value: 'https://${environmentPrefix}-app.azurecontainer.io'
            }
          ]
        }
      }
    ]
    restartPolicy: 'Always'
    osType: 'Linux'
    ipAddress: {
      type: 'Public'
      ports: [
        {
          port: 3000
          protocol: 'TCP'
        }
      ]
      dnsNameLabel: '${environmentPrefix}-app'
    }
    imageRegistryCredentials: [
      {
        server: containerRegistry.properties.loginServer
        username: containerRegistry.listCredentials().username
        password: containerRegistry.listCredentials().passwords[0].value
      }
    ]
    subnetIds: [
      {
        id: vnet::subnet.id
      }
    ]
  }
  dependsOn: [
    auraDatabase
    auraMcpServices
  ]
}

// Outputs
output applicationUrl string = 'https://${auraApplication.properties.ipAddress.fqdn}'
output databaseIp string = auraDatabase.properties.ipAddress.ip
output mcpServicesIp string = auraMcpServices.properties.ipAddress.ip
