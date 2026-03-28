import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import MapBlock from '../editor/extensions/MapBlock'

export default function BlogContentViewer({ contentJson, contentHtml }) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      Image,
      MapBlock,
    ],
    content: contentJson || contentHtml || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return <EditorContent editor={editor} />
}