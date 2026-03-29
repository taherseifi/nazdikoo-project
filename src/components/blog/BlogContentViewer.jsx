import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import MapBlock from '../editor/extensions/MapBlock'

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
      },
      align: {
        default: 'center',
      },
      radius: {
        default: '16px',
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes.width || '100%'
    const radius = HTMLAttributes.radius || '16px'
    const align = HTMLAttributes.align || 'center'

    let marginStyle = 'display:block;margin:1rem auto;'
    if (align === 'left') marginStyle = 'display:block;margin:1rem auto 1rem 0;'
    if (align === 'right') marginStyle = 'display:block;margin:1rem 0 1rem auto;'

    return [
      'img',
      {
        ...HTMLAttributes,
        style: `width:${width};border-radius:${radius};${marginStyle}`,
      },
    ]
  },
})

export default function BlogContentViewer({ contentJson, contentHtml }) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CustomImage,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      MapBlock,
    ],
    content: contentJson || contentHtml || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'max-w-none text-slate-800 ' +
          '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-tight ' +
          '[&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight ' +
          '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:leading-tight ' +
          '[&_p]:my-3 [&_p]:leading-8 ' +
          '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pr-6 ' +
          '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pr-6 ' +
          '[&_blockquote]:my-4 [&_blockquote]:rounded-2xl [&_blockquote]:border-r-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-slate-50 [&_blockquote]:p-4 ' +
          '[&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline ' +
          '[&_img]:max-w-full [&_img]:shadow-sm ' +
          '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-2xl ' +
          '[&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-bold ' +
          '[&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-right',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return <EditorContent editor={editor} />
}