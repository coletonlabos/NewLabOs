'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomObject, ObjectType } from '@/types/object'
import { supabase } from '@/lib/supabase/client'
import { ObjectCard } from '@/components/Objects/ObjectCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

export default function ObjectsPage() {
  const [objects, setObjects] = useState<CustomObject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        setLoading(true)
        
        // Fetch objects
        let query = supabase
          .from('objects')
          .select('*')
        
        // Apply type filter if set
        if (typeFilter !== 'all') {
          query = query.eq('type', typeFilter)
        }
        
        const { data: objectsData, error } = await query.order('updated_at', { ascending: false })
        
        if (error) throw error
        
        // Format objects
        const formattedObjects: CustomObject[] = []
        
        for (const obj of objectsData) {
          // Fetch properties for each object
          const { data: propertiesData } = await supabase
            .from('properties')
            .select('*')
            .eq('object_id', obj.id)
          
          // Fetch relation counts
          const { count: incomingCount } = await supabase
            .from('relations')
            .select('*', { count: 'exact', head: true })
            .eq('to_object_id', obj.id)
          
          const { count: outgoingCount } = await supabase
            .from('relations')
            .select('*', { count: 'exact', head: true })
            .eq('from_object_id', obj.id)
          
          formattedObjects.push({
            id: obj.id,
            userId: obj.user_id,
            type: obj.type,
            title: obj.title,
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
            incomingRelations: Array(incomingCount || 0).fill({}),
            outgoingRelations: Array(outgoingCount || 0).fill({}),
            createdAt: obj.created_at,
            updatedAt: obj.updated_at
          })
        }
        
        setObjects(formattedObjects)
      } catch (error) {
        console.error('Error fetching objects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchObjects()
  }, [typeFilter])
  
  // Filter objects by search query
  const filteredObjects = objects.filter(object => 
    object.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    object.properties.some(prop => 
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof prop.value === 'string' && prop.value.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )
  
  const handleCreateObject = () => {
    router.push('/objects/new')
  }
  
  const handleObjectClick = (objectId: string) => {
    router.push(`/objects/${objectId}`)
  }
  
  const objectTypes: ObjectType[] = ['note', 'task', 'person', 'project', 'client', 'meeting', 'custom']
  
  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Objects</h1>
        <Button onClick={handleCreateObject}>
          <Plus className="mr-2 h-4 w-4" />
          Create Object
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search objects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {objectTypes.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredObjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObjects.map((object) => (
            <ObjectCard
              key={object.id}
              object={object}
              onClick={() => handleObjectClick(object.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No objects found</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            {searchQuery || typeFilter !== 'all'
              ? "Try adjusting your search or filters"
              : "You haven't created any objects yet"}
          </p>
          <Button onClick={handleCreateObject}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Object
          </Button>
        </div>
      )}
    </div>
  )
} 