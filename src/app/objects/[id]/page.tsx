'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomObject, Property, Relation } from '@/types/object'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyPanel } from '@/components/Objects/PropertyPanel'
import { RelationSection } from '@/components/Objects/RelationSection'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'

interface ObjectDetailPageProps {
  params: {
    id: string
  }
}

export default function ObjectDetailPage({ params }: ObjectDetailPageProps) {
  const [object, setObject] = useState<CustomObject | null>(null)
  const [relatedObjects, setRelatedObjects] = useState<Record<string, CustomObject>>({})
  const [loading, setLoading] = useState(true)
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false)
  const router = useRouter()

  const { id } = params

  useEffect(() => {
    const fetchObjectDetails = async () => {
      try {
        setLoading(true)
        
        // 1. Fetch the object
        const { data: objectData, error: objectError } = await supabase
          .from('objects')
          .select('*')
          .eq('id', id)
          .single()
          
        if (objectError) throw objectError
        
        if (!objectData) {
          // Object not found
          return
        }
        
        // 2. Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('object_id', id)
          
        if (propertiesError) throw propertiesError
        
        // 3. Fetch relations (both incoming and outgoing)
        const { data: outgoingRelations, error: outgoingError } = await supabase
          .from('relations')
          .select('*')
          .eq('from_object_id', id)
          
        if (outgoingError) throw outgoingError
        
        const { data: incomingRelations, error: incomingError } = await supabase
          .from('relations')
          .select('*')
          .eq('to_object_id', id)
          
        if (incomingError) throw incomingError
        
        // 4. Format the object
        const formattedObject: CustomObject = {
          id: objectData.id,
          userId: objectData.user_id,
          type: objectData.type,
          title: objectData.title,
          properties: propertiesData.map((prop: any) => ({
            id: prop.id,
            objectId: prop.object_id,
            name: prop.name,
            type: prop.type,
            value: prop.value,
            colorCode: prop.color_code,
            createdAt: prop.created_at,
            updatedAt: prop.updated_at
          })),
          incomingRelations: incomingRelations.map((rel: any) => ({
            id: rel.id,
            fromObjectId: rel.from_object_id,
            toObjectId: rel.to_object_id,
            relationType: rel.relation_type,
            createdAt: rel.created_at
          })),
          outgoingRelations: outgoingRelations.map((rel: any) => ({
            id: rel.id,
            fromObjectId: rel.from_object_id,
            toObjectId: rel.to_object_id,
            relationType: rel.relation_type,
            createdAt: rel.created_at
          })),
          createdAt: objectData.created_at,
          updatedAt: objectData.updated_at
        }
        
        setObject(formattedObject)
        
        // 5. Fetch related objects for the relation section
        const relatedObjectIds = new Set([
          ...(formattedObject.incomingRelations || []).map(rel => rel.fromObjectId),
          ...(formattedObject.outgoingRelations || []).map(rel => rel.toObjectId)
        ])
        
        if (relatedObjectIds.size > 0) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('objects')
            .select('*')
            .in('id', Array.from(relatedObjectIds))
            
          if (relatedError) throw relatedError
          
          const objectMap: Record<string, CustomObject> = {}
          for (const obj of relatedData) {
            objectMap[obj.id] = {
              id: obj.id,
              userId: obj.user_id,
              type: obj.type,
              title: obj.title,
              properties: [],
              createdAt: obj.created_at,
              updatedAt: obj.updated_at
            }
          }
          
          setRelatedObjects(objectMap)
        }
      } catch (error) {
        console.error('Error fetching object details:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchObjectDetails()
  }, [id])
  
  const handleSaveProperties = async (properties: Property[]) => {
    try {
      if (!object) return
      
      // Update in Supabase
      // 1. Delete existing properties
      await supabase
        .from('properties')
        .delete()
        .eq('object_id', object.id)
      
      // 2. Insert new properties
      const propertiesToInsert = properties.map(prop => ({
        object_id: object.id,
        name: prop.name,
        type: prop.type,
        value: prop.value,
        color_code: prop.colorCode
      }))
      
      if (propertiesToInsert.length > 0) {
        const { error } = await supabase
          .from('properties')
          .insert(propertiesToInsert)
        
        if (error) throw error
      }
      
      // 3. Update local state
      setObject({
        ...object,
        properties
      })
    } catch (error) {
      console.error('Failed to save properties:', error)
      throw error
    }
  }
  
  const handleViewRelatedObject = (objectId: string) => {
    router.push(`/objects/${objectId}`)
  }
  
  const handleRemoveRelation = async (relation: Relation) => {
    try {
      if (!object) return
      
      // Delete relation in Supabase
      const { error } = await supabase
        .from('relations')
        .delete()
        .eq('id', relation.id)
      
      if (error) throw error
      
      // Update local state
      const updatedObject = { ...object }
      
      // Remove from incoming relations
      if (relation.toObjectId === object.id) {
        updatedObject.incomingRelations = (updatedObject.incomingRelations || [])
          .filter(rel => rel.id !== relation.id)
      }
      
      // Remove from outgoing relations
      if (relation.fromObjectId === object.id) {
        updatedObject.outgoingRelations = (updatedObject.outgoingRelations || [])
          .filter(rel => rel.id !== relation.id)
      }
      
      setObject(updatedObject)
    } catch (error) {
      console.error('Failed to remove relation:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!object) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Object Not Found</h1>
        <p>The object you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push('/objects')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Objects
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/objects')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Objects
      </Button>
      
      {/* Object Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{object.title}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 capitalize">{object.type}</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsPropertyPanelOpen(true)} variant="secondary">
            <Edit className="mr-2 h-4 w-4" />
            Edit Properties
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Object Properties */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {object.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {object.properties.map((property) => (
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
              No properties have been added to this object yet.
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Relations Section */}
      <RelationSection
        object={object}
        relatedObjects={relatedObjects}
        onViewObject={handleViewRelatedObject}
        onRemoveRelation={handleRemoveRelation}
      />
      
      {/* Property Panel */}
      <PropertyPanel
        object={object}
        open={isPropertyPanelOpen}
        onClose={() => setIsPropertyPanelOpen(false)}
        onSave={handleSaveProperties}
      />
    </div>
  )
} 