import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import MapBlockView from '../MapBlockView'

const MapBlock = Node.create({
  name: 'mapBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      title: { default: '' },
      googleMapsUrl: { default: '' },
      latitude: { default: '' },
      longitude: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-map-block]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-map-block': '',
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MapBlockView)
  },
})

export default MapBlock