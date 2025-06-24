'use client'

import React, { useState } from 'react'
import { CustomObject, Property, PropertyType } from '@/types/object'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Trash2, Plus, X, Save, Palette } from 'lucide-react'

interface PropertyPanelProps {
  object?: CustomObject
  open: boolean
  onClose: () => void
  onSave: (properties: Property[]) => Promise<void>
}

export function PropertyPanel({ object, open, onClose, onSave }: PropertyPanelProps) {
  const [properties, setProperties] = useState<Property[]>(object?.properties || [])
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    name: '',
    type: 'text',
    value: ''
  })
  const [saving, setSaving] = useState(false)

  const handleAddProperty = () => {
    if (!newProperty.name) return
    
    const property: Property = {
      id: `temp_${Date.now()}`,
      objectId: object?.id || '',
      name: newProperty.name,
      type: newProperty.type as PropertyType,
      value: newProperty.value || '',
      colorCode: '#6366f1' // Default indigo color
    }
    
    setProperties([...properties, property])
    setNewProperty({ name: '', type: 'text', value: '' })
  }

  const handleUpdateProperty = (index: number, field: keyof Property, value: any) => {
    const updated = [...properties]
    updated[index] = { ...updated[index], [field]: value }
    setProperties(updated)
  }

  const handleRemoveProperty = (index: number) => {
    const updated = [...properties]
    updated.splice(index, 1)
    setProperties(updated)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(properties)
      onClose()
    } catch (error) {
      console.error('Failed to save properties:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[400px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Object Properties</SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-6">
          {/* Current Properties */}
          {properties.length > 0 ? (
            <div className="space-y-4">
              {properties.map((property, index) => (
                <div key={property.id} className="space-y-2 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <Input
                      value={property.name}
                      onChange={(e) => handleUpdateProperty(index, 'name', e.target.value)}
                      className="font-medium"
                      placeholder="Property name"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProperty(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={property.type}
                      onValueChange={(value) => handleUpdateProperty(index, 'type', value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="relation">Relation</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="tags">Tags</SelectItem>
                        <SelectItem value="richText">Rich Text</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <Palette className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      value={typeof property.value === 'string' ? property.value : JSON.stringify(property.value)}
                      onChange={(e) => handleUpdateProperty(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-neutral-500">
              <p>No properties added yet</p>
            </div>
          )}
          
          {/* Add New Property */}
          <div className="space-y-2 pt-2">
            <Label>Add a new property</Label>
            <div className="flex gap-2">
              <Input
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                placeholder="Name"
                className="flex-1"
              />
              
              <Select
                value={newProperty.type as string}
                onValueChange={(value) => setNewProperty({ ...newProperty, type: value as PropertyType })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="relation">Relation</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="tags">Tags</SelectItem>
                  <SelectItem value="richText">Rich Text</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleAddProperty} size="icon" variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              value={newProperty.value as string || ''}
              onChange={(e) => setNewProperty({ ...newProperty, value: e.target.value })}
              placeholder="Value"
              className="mt-2"
            />
          </div>

          <Separator />
          
          {/* Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 