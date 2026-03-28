import { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Pencil, Trash2, MapPinned } from 'lucide-react'
import MapInsertModal from './MapInsertModal'

export default function MapBlockView({ node, updateAttributes, deleteNode }) {
  const [open, setOpen] = useState(false)

  return (
    <NodeViewWrapper className="my-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MapPinned className="h-4 w-4" />
            <span>{node.attrs.title || 'Google Map'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={deleteNode}
              className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <iframe
          title={node.attrs.title || 'Google Map'}
          src={node.attrs.src}
          className="h-[320px] w-full md:h-[420px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {open && (
          <MapInsertModal
            initialValues={{
              title: node.attrs.title || '',
              googleMapsUrl: node.attrs.googleMapsUrl || '',
              iframeCode: '',
              latitude: node.attrs.latitude || '',
              longitude: node.attrs.longitude || '',
            }}
            onClose={() => setOpen(false)}
            onSubmit={(attrs) => {
              updateAttributes(attrs)
              setOpen(false)
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  )
}