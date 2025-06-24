'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'

export default function SupabaseTestPage() {
  // Use null initial state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [supabaseUrl, setSupabaseUrl] = useState<string>('')
  const [supabaseKey, setSupabaseKey] = useState<string>('')
  const [tables, setTables] = useState<{exists: boolean, name: string}[]>([
    { name: 'objects', exists: false },
    { name: 'properties', exists: false },
    { name: 'relations', exists: false }
  ])
  
  // Only render after component has mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      
      // Debug the environment variables
      console.log('Environment variables in component:')
      console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      // Use either the configured client or create a temporary one with provided credentials
      let clientToUse
      let usingInputCredentials = false
      
      if (supabaseUrl && supabaseKey) {
        console.log('Using manually entered credentials')
        clientToUse = createClient(supabaseUrl, supabaseKey)
        usingInputCredentials = true
      } else {
        console.log('Using environment variable credentials')
        clientToUse = supabase
      }
      
      // For direct client validation, check the input fields
      if (!usingInputCredentials && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
        console.log('No credentials found in environment variables')
        throw new Error('Missing Supabase URL or key. Please check your .env.local file or enter credentials above.')
      }
      
      // Simple ping test to verify connection
      try {
        console.log('Attempting to connect to Supabase...')
        
        // First, test a simple connection with a health check
        let pingData = null
        let pingError = null
        
        try {
          console.log('Testing connection with health check...')
          // Use a simple health check instead of querying a specific table
          const result = await clientToUse.auth.getSession()
          pingData = result.data
          pingError = result.error
        } catch (e) {
          console.log('Connection error caught:', e)
          pingError = e
        }
        
        if (pingError) {
          console.log('Connection error:', pingError)
          throw pingError
        }
        
        console.log('Connection successful!')
        
        // Check which tables exist
        const updatedTables = [...tables]
        
        for (const tableIndex in updatedTables) {
          const tableName = updatedTables[tableIndex].name
          try {
            console.log(`Testing table: ${tableName}...`)
            // Try a more specific query that's less likely to fail for permission reasons
            const { data, error } = await clientToUse.from(tableName).select('*').limit(1)
            
            if (error) {
              console.log(`Error for table ${tableName}:`, error)
              
              // Check if the error is about permissions rather than table not existing
              if (error.message && (
                  error.message.includes('permission denied') || 
                  error.message.includes('access denied') ||
                  error.message.includes('not authorized') ||
                  error.message.includes('violates row-level security policy')
                )) {
                // If it's a permission error, the table likely exists
                console.log(`Table ${tableName} exists but permission denied`)
                updatedTables[tableIndex].exists = true
              } else {
                updatedTables[tableIndex].exists = false
              }
            } else {
              console.log(`Table ${tableName} exists and returned data:`, data)
              updatedTables[tableIndex].exists = true
            }
          } catch (e) {
            console.log(`Error testing table ${tableName}:`, e)
            updatedTables[tableIndex].exists = false
          }
        }
        
        // As a fallback, try to get table info from Supabase metadata
        try {
          console.log('Trying to get table info from metadata...')
          // This requires admin privileges and might not work in all setups
          const { data: tablesData, error: tablesError } = await clientToUse.rpc('get_tables_info')
          
          if (!tablesError && tablesData) {
            console.log('Tables metadata:', tablesData)
            // Update table existence based on metadata if available
          }
        } catch (e) {
          console.log('Error getting tables metadata:', e)
        }
        
        setTables(updatedTables)
        setConnectionStatus('success')
        
      } catch (innerError) {
        console.error('Supabase query error:', innerError)
        setConnectionStatus('error')
        if (innerError instanceof Error) {
          setErrorMessage(innerError.message)
        } else if (typeof innerError === 'object' && innerError !== null) {
          try {
            const errorStr = JSON.stringify(innerError, (key, value) => 
              typeof value === 'undefined' ? 'undefined' : value, 2)
            setErrorMessage(errorStr || 'Error object could not be stringified')
          } catch (e) {
            const jsonError = e as Error
            setErrorMessage(`Error object could not be stringified: ${jsonError.message}`)
          }
        } else {
          setErrorMessage(`Unknown error connecting to Supabase: ${String(innerError)}`)
        }
      }
    } catch (error) {
      console.error('Supabase connection error:', error)
      setConnectionStatus('error')
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else if (typeof error === 'object' && error !== null) {
                  try {
            const errorStr = JSON.stringify(error, (key, value) => 
              typeof value === 'undefined' ? 'undefined' : value, 2)
            setErrorMessage(errorStr || 'Error object could not be stringified')
          } catch (e) {
            const jsonError = e as Error
            setErrorMessage(`Error object could not be stringified: ${jsonError.message}`)
          }
      } else {
        setErrorMessage(`Unknown error connecting to Supabase: ${String(error)}`)
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Manual override to mark all tables as existing
  const overrideTables = () => {
    const updatedTables = tables.map(table => ({
      ...table,
      exists: true
    }))
    setTables(updatedTables)
  }
  
  // Create a demo object to test write access
  const createDemoObject = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      
      // Debug the environment variables
      console.log('Creating demo object...')
      
      // Use either the configured client or create a temporary one with provided credentials
      let clientToUse
      let usingInputCredentials = false
      
      if (supabaseUrl && supabaseKey) {
        console.log('Using manually entered credentials')
        clientToUse = createClient(supabaseUrl, supabaseKey)
        usingInputCredentials = true
      } else {
        console.log('Using environment variable credentials')
        clientToUse = supabase
      }
      
      // For direct client validation, check the input fields
      if (!usingInputCredentials && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
        console.log('No credentials found in environment variables')
        throw new Error('Missing Supabase URL or key. Please check your .env.local file or enter credentials above.')
      }
      
      try {
        console.log('Attempting to insert demo object...')
        
        // First, try to create a bypass policy for the demo
        try {
          console.log('Creating temporary bypass policy...')
          const { error: policyError } = await clientToUse.rpc('create_demo_bypass_policy', {
            table_name: 'objects'
          })
          
          if (policyError) {
            console.log('Error creating bypass policy:', policyError)
            // Continue anyway, as we might not have permission to create policies
          } else {
            console.log('Bypass policy created successfully')
          }
        } catch (e) {
          console.log('Error creating bypass policy:', e)
          // Continue anyway
        }
        
        // Get the current user's session
        const { data: sessionData } = await clientToUse.auth.getSession()
        
        // Use the authenticated user's ID if available, otherwise use a valid UUID format
        const userId = sessionData?.session?.user?.id || 
                      '00000000-0000-0000-0000-000000000000' // Valid UUID format for demo
        
        console.log('Using user_id:', userId)
        
        // First, try to sign in as the demo user
        try {
          console.log('Attempting to sign in for demo...')
          
          // Try to sign in with demo credentials
          // This is just for testing and should be removed in production
          const { error: signInError } = await clientToUse.auth.signInWithPassword({
            email: 'demo@example.com',
            password: 'demo-password'
          })
          
          if (signInError) {
            console.log('Sign in error:', signInError)
            
            // If sign in fails, try to create the demo user
            const { error: signUpError } = await clientToUse.auth.signUp({
              email: 'demo@example.com',
              password: 'demo-password'
            })
            
            if (signUpError) {
              console.log('Sign up error:', signUpError)
              // Continue anyway with the default UUID
            } else {
              console.log('Demo user created successfully')
            }
          } else {
            console.log('Signed in as demo user')
          }
        } catch (e) {
          console.log('Auth error:', e)
          // Continue anyway
        }
        
        // Get the updated session after sign in attempts
        const { data: updatedSessionData } = await clientToUse.auth.getSession()
        const updatedUserId = updatedSessionData?.session?.user?.id || userId
        console.log('Updated user_id:', updatedUserId)
        
        let data = null
        let error = null
        
        // Try SQL RPC call as a workaround for RLS
        try {
          console.log('Trying RPC call to bypass RLS...')
          const result = await clientToUse.rpc('create_demo_object', {
            title_param: 'Demo Object',
            type_param: 'note',
            user_id_param: updatedUserId
          })
          
          if (result.error) {
            console.log('RPC error:', result.error)
            throw result.error
          }
          
          data = result.data
          console.log('RPC result:', data)
        } catch (rpcError) {
          console.log('RPC method failed:', rpcError)
          
          // Fall back to direct insert
          console.log('Falling back to direct insert...')
          try {
            const result = await clientToUse
              .from('objects')
              .insert({
                title: 'Demo Object',
                type: 'note',
                user_id: updatedUserId
              })
              .select('id')
              .single()
            
            data = result.data
            error = result.error
          } catch (e) {
            console.log('Insert error caught:', e)
            error = e
          }
        }
        
        if (error) {
          console.log('Insert error:', error)
          
          // If we still get RLS errors, provide guidance
          if (error.message && error.message.includes('violates row-level security policy')) {
            setErrorMessage(`Row Level Security policy is preventing the insert. You need to either:
              1. Sign in with a valid user
              2. Temporarily disable RLS for testing with: ALTER TABLE objects DISABLE ROW LEVEL SECURITY;
              3. Create a bypass policy in Supabase SQL Editor: 
                 CREATE POLICY "Bypass policy for testing" ON objects FOR INSERT TO authenticated USING (true) WITH CHECK (true);`)
            throw new Error('RLS policy violation - see instructions for workarounds')
          }
          
          throw error
        }
        
        if (!data || !data.id) {
          throw new Error('No data returned from insert operation')
        }
        
        console.log('Demo object created successfully with ID:', data.id)
        alert(`Success! Created object with ID: ${data.id}`)
      } catch (innerError) {
        console.error('Supabase query error:', innerError)
        if (innerError instanceof Error) {
          setErrorMessage(innerError.message)
        } else if (typeof innerError === 'object' && innerError !== null) {
          try {
            const errorStr = JSON.stringify(innerError, (key, value) => 
              typeof value === 'undefined' ? 'undefined' : value, 2)
            setErrorMessage(errorStr || 'Error object could not be stringified')
          } catch (e) {
            const jsonError = e as Error
            setErrorMessage(`Error object could not be stringified: ${jsonError.message}`)
          }
        } else {
          setErrorMessage(`Unknown error creating demo object: ${String(innerError)}`)
        }
      }
    } catch (error) {
      console.error('Error creating demo object:', error)
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else if (typeof error === 'object' && error !== null) {
        try {
          const errorStr = JSON.stringify(error, (key, value) => 
            typeof value === 'undefined' ? 'undefined' : value, 2)
          setErrorMessage(errorStr || 'Error object could not be stringified')
        } catch (e) {
          const jsonError = e as Error
          setErrorMessage(`Error object could not be stringified: ${jsonError.message}`)
        }
      } else {
        setErrorMessage(`Unknown error creating demo object: ${String(error)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Return a minimal placeholder during server rendering or before hydration
  if (!mounted) {
    return <div className="container mx-auto p-8">Loading...</div>
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supabase URL</label>
              <input 
                type="text" 
                value={supabaseUrl} 
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supabase Anon Key</label>
              <input 
                type="text" 
                value={supabaseKey} 
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="your-anon-key"
                className="w-full p-2 border rounded"
              />
            </div>
            <p className="text-sm text-gray-500">
              Enter your Supabase credentials above or set them in .env.local
            </p>
          </div>
        </CardContent>
      </Card>
      
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
                <p className="text-sm whitespace-pre-line">{errorMessage}</p>
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
            
            {!tables.every(t => t.exists) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-medium mb-2">How to create the required tables:</h3>
                <ol className="list-decimal pl-4 space-y-2 text-sm">
                  <li>Go to the Supabase dashboard for your project</li>
                  <li>Navigate to the SQL Editor</li>
                  <li>Copy the SQL schema from <code className="bg-gray-100 p-1 rounded">supabase-schema.sql</code> in your project root</li>
                  <li>Paste it into the SQL Editor and run it</li>
                  <li>Come back here and click "Test Connection" again to verify the tables exist</li>
                </ol>
                
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <p className="text-sm mb-2">
                    <strong>Tables not showing up?</strong> If you've already created the tables but they're not being detected, you can use this override:
                  </p>
                  <Button 
                    onClick={overrideTables} 
                    variant="outline" 
                    className="mt-2"
                  >
                    Override - Mark Tables as Existing
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Demo Object</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Test creating an object in Supabase.</p>
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="font-medium mb-2">⚠️ Row Level Security (RLS) Notice:</p>
            <p>
              Your tables have RLS policies enabled that restrict data access. To create objects successfully:
            </p>
            <ol className="list-decimal pl-4 mt-2 space-y-1">
              <li>Sign in with a valid Supabase user account, or</li>
              <li>Temporarily disable RLS for testing by running this SQL: <br/>
                <code className="bg-gray-100 p-1 rounded block mt-1">ALTER TABLE objects DISABLE ROW LEVEL SECURITY;</code>
              </li>
              <li>Create a bypass policy by running this SQL: <br/>
                <code className="bg-gray-100 p-1 rounded block mt-1">
                  CREATE POLICY "Bypass policy for testing" ON objects FOR INSERT TO authenticated USING (true) WITH CHECK (true);
                </code>
              </li>
            </ol>
          </div>
          <Button onClick={createDemoObject} disabled={loading || !tables[0].exists}>
            {loading ? 'Creating...' : 'Create Demo Object'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 