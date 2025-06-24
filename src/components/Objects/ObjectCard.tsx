'use client'

import { CustomObject } from '@/types/object'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface ObjectCardProps {
  object: CustomObject
  onClick?: () => void
}

export function ObjectCard({ object, onClick }: ObjectCardProps) {
  // Define background color based on object type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-50 dark:bg-blue-900/20'
      case 'task':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'person':
        return 'bg-purple-50 dark:bg-purple-900/20'
      case 'project':
        return 'bg-amber-50 dark:bg-amber-900/20'
      case 'client':
        return 'bg-rose-50 dark:bg-rose-900/20'
      case 'meeting':
        return 'bg-cyan-50 dark:bg-cyan-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-800/50'
    }
  }

  // Format date for display
  const formattedDate = formatDistanceToNow(new Date(object.updatedAt), { addSuffix: true })
  
  // Get the first 3 properties to display as preview
  const previewProperties = object.properties.slice(0, 3)
  
  // Count relations
  const relationCount = (object.incomingRelations?.length || 0) + (object.outgoingRelations?.length || 0)
  
  return (
    <Card 
      className={`${getTypeColor(object.type)} hover:shadow-md transition-shadow cursor-pointer`} 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{object.title}</CardTitle>
          <Badge variant="outline" className="capitalize">{object.type}</Badge>
        </div>
        <CardDescription className="text-xs">{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        {previewProperties.length > 0 ? (
          <div className="space-y-1">
            {previewProperties.map((prop) => (
              <div key={prop.id} className="text-sm flex justify-between">
                <span className="font-medium">{prop.name}:</span> 
                <span className="truncate max-w-[200px]">
                  {typeof prop.value === 'string' ? prop.value : JSON.stringify(prop.value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No properties</p>
        )}
        
        {relationCount > 0 && (
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {relationCount} connection{relationCount !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 