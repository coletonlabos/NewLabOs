'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomObject, ObjectType } from '@/types/object'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { PropertyPanel } from '@/components/Objects/PropertyPanel'
import { ArrowLeft, Plus, Save } from 'lucide-react'

export default function NewObjectPage() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ObjectType>('note')
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateObject = async () => {
    try {
      if (!title) {
        setError('Title is required')
        return
      }
      
      setLoading(true)
      setError(null)
      
      // 1. Create the object
      const { data: objectData, error: objectError } = await supabase
        .from('objects')
        .insert({
          title,
          type,
          // In a real app, we'd get this from the auth context
          user_id: 'demo-user-id'  
        })
        .select('id')
        .single()
      
      if (objectError) throw objectError
      
      // 2. Add properties if any
      if (properties.length > 0) {
        const propertiesToInsert = properties.map(prop => ({
          object_id: objectData.id,
          name: prop.name,
          type: prop.type,
          value: prop.value,
          color_code: prop.colorCode
        }))
        
        const { error: propertiesError } = await supabase
          .from('properties')
          .insert(propertiesToInsert)
        
        if (propertiesError) throw propertiesError
      }
      
      // 3. Navigate to the new object
      router.push(`/objects/${objectData.id}`)
    } catch (error) {
      console.error('Error creating object:', error)
      setError('Failed to create object. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const objectTypes: ObjectType[] = ['note', 'task', 'person', 'project', 'client', 'meeting', 'custom']
  
  const handleSaveProperties = async (updatedProperties) => {
    setProperties(updatedProperties)
    return Promise.resolve()
  }

  return (
    <div className="container mx-auto p-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/objects')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Objects
      </Button>
      
      <h1 className="text-3xl font-bold mb-8">Create New Object</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Object Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter object title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as ObjectType)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select object type" />
              </SelectTrigger>
              <SelectContent>
                {objectTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Properties ({properties.length})</span>
            <Button variant="ghost" onClick={() => setIsPropertyPanelOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Properties
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((property) => (
                <div key={property.id} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{property.name}:</span>
                  <span className="max-w-[200px] truncate">
                    {typeof property.value === 'string' ? property.value : JSON.stringify(property.value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">
              No properties added yet. Click "Add Properties" to start adding them.
            </p>
          )}
        </CardContent>
      </Card>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <Separator className="my-6" />
      
      <div className="flex justify-end">
        <Button onClick={() => router.push('/objects')} variant="outline" className="mr-2">
          Cancel
        </Button>
        <Button onClick={handleCreateObject} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Creating...' : 'Create Object'}
        </Button>
      </div>
      
      {/* Property Panel */}
      <PropertyPanel
        open={isPropertyPanelOpen}
        onClose={() => setIsPropertyPanelOpen(false)}
        onSave={handleSaveProperties}
        object={{ properties } as any}
      />
    </div>
  )
} 