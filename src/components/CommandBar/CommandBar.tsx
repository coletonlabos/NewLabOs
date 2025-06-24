'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { 
  CommandDialog,
  CommandInput, 
  CommandList, 
  CommandGroup, 
  CommandItem,
  CommandSeparator 
} from '@/components/ui/command'
import {
  PlusCircle,
  CheckSquare,
  BookOpen,
  Users,
  LayoutDashboard,
  Calendar,
  LineChart,
  MessageSquare,
  Sparkles,
  Settings,
  Search
} from 'lucide-react'

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  // Listen for keyboard shortcut
  useHotkeys('mod+k', (e) => {
    e.preventDefault()
    setOpen((open) => !open)
  })
  
  // Close on escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  
  // Handle command selection
  const runCommand = (command: string) => {
    setOpen(false)
    
    switch (command) {
      case 'new-object':
        router.push('/objects/new')
        break
      case 'new-task':
        router.push('/tasks/new')
        break
      case 'new-journal':
        router.push('/journals/new')
        break
      case 'new-client':
        router.push('/clients/new')
        break
      case 'go-dashboard':
        router.push('/dashboard')
        break
      case 'go-calendar':
        router.push('/calendar')
        break
      case 'go-crm':
        router.push('/crm')
        break
      case 'ai-chat':
        router.push('/chat')
        break
      case 'search-all':
        router.push('/search')
        break
      case 'settings':
        router.push('/settings')
        break
      default:
        break
    }
  }
  
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="What would you like to do?" />
      <CommandList>
        <CommandGroup heading="Create New">
          <CommandItem onSelect={() => runCommand('new-object')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Object</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand('new-task')}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>New Task</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand('new-journal')}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>New Journal Entry</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand('new-client')}>
            <Users className="mr-2 h-4 w-4" />
            <span>New Client</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => runCommand('go-dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand('go-calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand('go-crm')}>
            <LineChart className="mr-2 h-4 w-4" />
            <span>CRM</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="AI Actions">
          <CommandItem onSelect={() => runCommand('ai-chat')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Open AI Chat</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand('ai-analyze')}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Analyze Data</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Other">
          <CommandItem onSelect={() => runCommand('search-all')}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Everything</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand('settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
} 