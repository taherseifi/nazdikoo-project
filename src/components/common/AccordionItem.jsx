import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-right"
      >
        <span className="text-base font-bold text-slate-800 md:text-lg">
          {question}
        </span>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 text-sm leading-8 text-slate-600 md:text-base">
          {answer}
        </div>
      )}
    </div>
  )
}