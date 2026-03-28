import { useMemo, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Link2Off,
  MapPinned,
  ImagePlus,
} from 'lucide-react'
import HeadingDropdown from './HeadingDropdown'
import LinkModal from './LinkModal'
import MapInsertModal from './MapInsertModal'
import { uploadInlineBlogImages } from '../../services/supabase/blogEditorStorage.api'

function ToolbarButton({ onClick, active, children, title, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2 transition ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  )
}

export default function EditorToolbar({ editor }) {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const imageInputRef = useRef(null)

  const linkAttrs = useMemo(() => editor?.getAttributes('link') || {}, [editor])

  if (!editor) return null

  async function handleImageFiles(files) {
    if (!files || files.length === 0) return

    try {
      setUploadingImages(true)
      const urls = await uploadInlineBlogImages(Array.from(files))

      urls.forEach((url) => {
        editor.chain().focus().setImage({ src: url }).run()
      })
    } catch (err) {
      window.alert(err.message || 'آپلود تصویر انجام نشد')
    } finally {
      setUploadingImages(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <HeadingDropdown editor={editor} />

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
          title="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
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
          title="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Insert / Edit Link"
          active={editor.isActive('link')}
          onClick={() => setShowLinkModal(true)}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Remove Link"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Insert Google Map"
          onClick={() => setShowMapModal(true)}
        >
          <MapPinned className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Upload Image"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImages}
        >
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleImageFiles(e.target.files)}
        />
      </div>

      {showLinkModal && (
        <LinkModal
          initialValues={linkAttrs}
          onClose={() => setShowLinkModal(false)}
          onSubmit={(attrs) => {
            editor.chain().focus().extendMarkRange('link').setLink(attrs).run()
            setShowLinkModal(false)
          }}
        />
      )}

      {showMapModal && (
        <MapInsertModal
          onClose={() => setShowMapModal(false)}
          onSubmit={(attrs) => {
            editor.chain().focus().insertContent({
              type: 'mapBlock',
              attrs,
            }).run()
            setShowMapModal(false)
          }}
        />
      )}
    </>
  )
}