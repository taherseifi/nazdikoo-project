import { useEffect } from 'react'
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
import { uploadEditorImageToHost } from '../../services/uploads/hostedUploads.api'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Table as TableIcon,
  PlusSquare,
  MinusSquare,
  Rows3,
  Columns3,
} from 'lucide-react'
import MapBlock from '../editor/extensions/MapBlock'

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('data-width') || '100%',
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return {
            'data-width': attributes.width,
            style: `width:${attributes.width};`,
          }
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          const align = attributes.align || 'center'

          let style = ''
          if (align === 'left') {
            style = 'display:block;margin:1rem auto 1rem 0;'
          } else if (align === 'right') {
            style = 'display:block;margin:1rem 0 1rem auto;'
          } else {
            style = 'display:block;margin:1rem auto;'
          }

          return {
            'data-align': align,
            style,
          }
        },
      },
      radius: {
        default: '16px',
        parseHTML: (element) => element.getAttribute('data-radius') || '16px',
        renderHTML: (attributes) => {
          if (!attributes.radius) return {}
          return {
            'data-radius': attributes.radius,
            style: `border-radius:${attributes.radius};`,
          }
        },
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
        'data-width': width,
        'data-align': align,
        'data-radius': radius,
        style: `width:${width};border-radius:${radius};${marginStyle}`,
      },
    ]
  },
})

function ToolbarButton({ onClick, active = false, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 transition ${
        active
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({ value, onChange, title, options }) {
  return (
    <select
      title={title}
      value={value}
      onChange={onChange}
      className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function getEditorContent(value) {
  if (!value) return '<p></p>'
  if (value.json) return value.json
  if (value.html) return value.html
  return '<p></p>'
}

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
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
    content: getEditorContent(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[320px] rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-800 outline-none focus:outline-none ' +
          '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-tight ' +
          '[&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight ' +
          '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:leading-tight ' +
          '[&_p]:my-3 [&_p]:leading-8 ' +
          '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pr-6 ' +
          '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pr-6 ' +
          '[&_blockquote]:my-4 [&_blockquote]:rounded-2xl [&_blockquote]:border-r-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-slate-50 [&_blockquote]:p-4 ' +
          '[&_hr]:my-6 [&_hr]:border-slate-300 ' +
          '[&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline ' +
          '[&_img]:max-w-full [&_img]:shadow-sm ' +
          '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-2xl ' +
          '[&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-bold ' +
          '[&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-right',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.({
        json: currentEditor.getJSON(),
        html: currentEditor.getHTML(),
        text: currentEditor.getText(),
      })
    },
  })

  useEffect(() => {
    if (!editor) return

    const nextHtml = value?.html || ''
    const currentHtml = editor.getHTML()

    if (nextHtml && nextHtml !== currentHtml && !editor.isFocused) {
      editor.commands.setContent(value?.json || value?.html || '<p></p>', false)
    }
  }, [editor, value])

  if (!editor) return null

  function setLink() {
    const previousUrl = editor.getAttributes('link').href || ''
    const url = window.prompt('لینک را وارد کنید', previousUrl)

    if (url === null) return

    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

async function addImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.addEventListener('change', async () => {
    const file = input.files?.[0]
    if (!file) return

    try {
      const url = await uploadEditorImageToHost(file)

      editor
        .chain()
        .focus()
        .setImage({
          src: url,
          alt: file.name || 'image',
          width: '100%',
          align: 'center',
          radius: '16px',
        })
        .run()
    } catch (error) {
      console.error(error)
      window.alert(error?.message || 'آپلود عکس انجام نشد')
    }
  })

  input.click()
}

  function updateSelectedImageAttributes(nextAttrs) {
    if (!editor.isActive('image')) {
      window.alert('اول روی عکس کلیک کن')
      return
    }

    editor.chain().focus().updateAttributes('image', nextAttrs).run()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-3">
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Strike"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="H1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="H3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSelect
          title="Font Size"
          value={editor.getAttributes('textStyle').fontSize || '16px'}
          onChange={(e) => {
            const size = e.target.value
            if (!size) {
              editor.chain().focus().unsetFontSize().run()
              return
            }
            editor.chain().focus().setFontSize(size).run()
          }}
          options={[
            { label: 'سایز متن', value: '16px' },
            { label: '12px', value: '12px' },
            { label: '14px', value: '14px' },
            { label: '16px', value: '16px' },
            { label: '18px', value: '18px' },
            { label: '20px', value: '20px' },
            { label: '24px', value: '24px' },
            { label: '28px', value: '28px' },
            { label: '32px', value: '32px' },
            { label: '40px', value: '40px' },
          ]}
        />

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Ordered List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton title="Image" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-3">
        <div className="mb-3 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
            جدول
          </span>

          <ToolbarButton
            title="Insert Table"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Add Column After"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Columns3 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Add Row After"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Rows3 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Delete Column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <MinusSquare className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Delete Row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <MinusSquare className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Delete Table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <MinusSquare className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Toggle Header Row"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            <PlusSquare className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
            تنظیمات عکس
          </span>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ width: '40%' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            عرض 40%
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ width: '60%' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            عرض 60%
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ width: '80%' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            عرض 80%
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ width: '100%' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            عرض 100%
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ radius: '0px' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            گوشه تیز
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ radius: '12px' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            گرد کم
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ radius: '24px' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            گرد زیاد
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ align: 'right' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            راست
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ align: 'center' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            وسط
          </button>

          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ align: 'left' })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            چپ
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}