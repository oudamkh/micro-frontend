'use client'

import { useState } from 'react'
import { Button, Card, Modal } from '../../src'

export default function Preview() {
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAsyncAction = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Shared Components Preview</h1>
      
      {/* Button Examples */}
      <Card variant="elevated" className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading={loading} onClick={handleAsyncAction}>
            {loading ? 'Loading...' : 'Async Action'}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        
        <Button fullWidth variant="primary">Full Width Button</Button>
      </Card>

      {/* Card Examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <h3 className="text-lg font-semibold mb-2">Default Card</h3>
          <p className="text-gray-600">This is a default card with standard styling.</p>
        </Card>
        
        <Card variant="elevated">
          <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
          <p className="text-gray-600">This card has a shadow for elevation effect.</p>
        </Card>
        
        <Card variant="outlined">
          <h3 className="text-lg font-semibold mb-2">Outlined Card</h3>
          <p className="text-gray-600">This card has a border instead of shadow.</p>
        </Card>
      </div>

      {/* Modal Example */}
      <Card variant="elevated">
        <h2 className="text-2xl font-semibold mb-4">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        
        <Modal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          size="md"
        >
          <div className="space-y-4">
            <p>This is an example modal with Tailwind styling.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </Card>

      {/* Form Example */}
      <Card variant="elevated">
        <h2 className="text-2xl font-semibold mb-4">Form Components</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email" 
              className="input-field"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea 
              className="input-field h-24 resize-none"
              placeholder="Enter your message"
            />
          </div>
          <Button type="submit" variant="primary">
            Submit Form
          </Button>
        </form>
      </Card>
    </div>
  )
}