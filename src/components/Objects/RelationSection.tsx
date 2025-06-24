'use client'

import React, { useState } from 'react'
import { CustomObject, Relation } from '@/types/object'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react'

interface RelationSectionProps {
  object: CustomObject
  relatedObjects: Record<string, CustomObject>
  onViewObject: (objectId: string) => void
  onRemoveRelation?: (relation: Relation) => void
}

export function RelationSection({ 
  object, 
  relatedObjects,
  onViewObject,
  onRemoveRelation
}: RelationSectionProps) {
  const [showIncoming, setShowIncoming] = useState(true)
  const [showOutgoing, setShowOutgoing] = useState(true)

  const incomingRelations = object.incomingRelations || []
  const outgoingRelations = object.outgoingRelations || []
  
  const hasRelations = incomingRelations.length > 0 || outgoingRelations.length > 0

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Connections ({incomingRelations.length + outgoingRelations.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasRelations && (
          <p className="text-sm text-neutral-500">
            No connections yet. Connect this object to others using @mentions in properties or journals.
          </p>
        )}

        {/* Incoming Relations */}
        {incomingRelations.length > 0 && (
          <div className="space-y-2">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setShowIncoming(!showIncoming)}
            >
              {showIncoming ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              <h3 className="text-sm font-medium">Referenced by ({incomingRelations.length})</h3>
            </div>
            
            {showIncoming && (
              <div className="pl-6 space-y-2">
                {incomingRelations.map((relation) => {
                  const relatedObject = relatedObjects[relation.fromObjectId]
                  if (!relatedObject) return null
                  
                  return (
                    <div key={relation.id} className="flex items-center justify-between text-sm p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{relatedObject.title}</span>
                        <span className="text-xs text-neutral-500">{relatedObject.type}</span>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => onViewObject(relatedObject.id)}
                        >
                          View
                        </Button>
                        {onRemoveRelation && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onRemoveRelation(relation)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Outgoing Relations */}
        {outgoingRelations.length > 0 && (
          <div className="space-y-2">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setShowOutgoing(!showOutgoing)}
            >
              {showOutgoing ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              <h3 className="text-sm font-medium">References ({outgoingRelations.length})</h3>
            </div>
            
            {showOutgoing && (
              <div className="pl-6 space-y-2">
                {outgoingRelations.map((relation) => {
                  const relatedObject = relatedObjects[relation.toObjectId]
                  if (!relatedObject) return null
                  
                  return (
                    <div key={relation.id} className="flex items-center justify-between text-sm p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{relatedObject.title}</span>
                        <span className="text-xs text-neutral-500">{relatedObject.type}</span>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => onViewObject(relatedObject.id)}
                        >
                          View
                        </Button>
                        {onRemoveRelation && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onRemoveRelation(relation)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 