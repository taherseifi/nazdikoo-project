export default function HeadingDropdown({ editor }) {
  const currentValue = (() => {
    for (let level = 1; level <= 6; level += 1) {
      if (editor.isActive('heading', { level })) return `h${level}`
    }
    return 'paragraph'
  })()

  return (
    <select
      value={currentValue}
      onChange={(e) => {
        const value = e.target.value

        if (value === 'paragraph') {
          editor.chain().focus().setParagraph().run()
          return
        }

        const level = Number(value.replace('h', ''))
        editor.chain().focus().toggleHeading({ level }).run()
      }}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
    >
      <option value="paragraph">Paragraph</option>
      <option value="h1">H1</option>
      <option value="h2">H2</option>
      <option value="h3">H3</option>
      <option value="h4">H4</option>
      <option value="h5">H5</option>
      <option value="h6">H6</option>
    </select>
  )
}