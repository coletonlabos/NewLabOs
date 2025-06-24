'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [tables, setTables] = useState<{exists: boolean, name: string}[]>([
    { name: 'objects', exists: false },
    { name: 'properties', exists: false },
    { name: 'relations', exists: false }
  ])

  const testConnection = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      
      // Simple ping test to verify connection
      const { data, error } = await supabase.from('objects').select('count(*)').limit(1)
      
      if (error) {
        throw error
      }
      
      setConnectionStatus('success')
      
      // Check which tables exist
      const updatedTables = [...tables]
      
      for (const tableIndex in updatedTables) {
        const tableName = updatedTables[tableIndex].name
        try {
          const { data, error } = await supabase.from(tableName).select('count(*)')
          updatedTables[tableIndex].exists = !error
        } catch (e) {
          updatedTables[tableIndex].exists = false
        }
      }
      
      setTables(updatedTables)
      
    } catch (error) {
      console.error('Supabase connection error:', error)
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  // Create a demo object to test write access
  const createDemoObject = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      
      const { data, error } = await supabase
        .from('objects')
        .insert({
          title: 'Demo Object',
          type: 'note',
          user_id: 'demo-user-id'  // In a real app, use auth.uid()
        })
        .select('id')
        .single()
      
      if (error) throw error
      
      alert(`Success! Created object with ID: ${data.id}`)
      
    } catch (error) {
      console.error('Error creating demo object:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p>Status: {connectionStatus === 'untested' ? 'Not tested yet' : 
                     connectionStatus === 'success' ? '✅ Connected' : '❌ Connection failed'}</p>
                     
            {errorMessage && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
          </div>
          
          <Button onClick={testConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Required Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {tables.map((table) => (
              <div key={table.name} className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center mr-2 rounded-full bg-neutral-100">
                  {table.exists ? '✓' : '✗'}
                </span>
                <span className="font-medium">{table.name}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <p className="text-sm mb-2">
              {!tables.every(t => t.exists) ? 
                "⚠️ Some required tables don't exist. Please run the SQL setup script in Supabase." :
                "✅ All required tables exist."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Demo Object</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Test creating an object in Supabase.</p>
          <Button onClick={createDemoObject} disabled={loading || !tables[0].exists}>
            {loading ? 'Creating...' : 'Create Demo Object'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 