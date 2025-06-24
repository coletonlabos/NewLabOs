export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-6">Welcome to Lab OS</h1>
        <p className="text-xl mb-8">
          Life and Business Operating System for coaches, consultants, and course creators
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Daily Journal</h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Log your thoughts, track progress, and connect entries to tasks and objects.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Objects & Relations</h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Create custom objects and connect anything with anything using @mentions.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Calendar & Tasks</h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Plan your days with drag-and-drop tasks and calendar integration.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Press <kbd className="px-2 py-1 text-xs font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 rounded-md">⌘K</kbd> to open command menu
          </p>
        </div>
      </div>
    </main>
  )
} 