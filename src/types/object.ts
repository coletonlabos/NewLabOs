export type ObjectType = 'note' | 'task' | 'person' | 'project' | 'client' | 'meeting' | 'custom'

export type PropertyType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'relation' | 'url' | 'email' | 'phone' | 'tags' | 'richText'

export interface Property {
  id: string
  objectId: string
  name: string
  type: PropertyType
  value: any
  colorCode?: string
  createdAt?: string
  updatedAt?: string
}

export interface Relation {
  id: string
  fromObjectId: string
  toObjectId: string
  relationType?: string
  createdAt?: string
}

export interface CustomObject {
  id: string
  userId: string
  type: ObjectType
  title: string
  properties: Property[]
  incomingRelations?: Relation[]
  outgoingRelations?: Relation[]
  createdAt: string
  updatedAt: string
} 