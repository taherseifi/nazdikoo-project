import { useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import EditorToolbar from './EditorToolbar'
import MapBlock from './extensions/MapBlock'

export default function RichTextEditor({ value, onChange }) {
  const initialContent = useMemo(() => {
    if (value?.json) return value.json
    if (value?.html) return value.html
    return '<p></p>'
  }, [value])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      MapBlock,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none min-h-[360px] p-5 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange({
        json: editor.getJSON(),
        html: editor.getHTML(),
        text: editor.getText(),
      })
    },
  })

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}