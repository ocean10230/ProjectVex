import { ChevronDown } from "lucide-react"
import React, { useState } from "react"

export interface AccordionItem {
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  Items: AccordionItem[]
  ClassName?: string
  allowMultiple?: boolean
  defaultOpenIds?: (string | number)[]
}

const Accordion: React.FC<AccordionProps> = ({
  Items = [],
  ClassName = "",
  allowMultiple = false,
  defaultOpenIds = [],
}) => {
  const [openIds, setOpenIds] = useState<(string | number)[]>(defaultOpenIds)

  const toggleItem = (id: string | number) => {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id)
      if (isOpen) {
        return prev.filter((item) => item !== id)
      }
      return allowMultiple ? [...prev, id] : [id]
    })
  }

  if (!Items.length) return null

  return (
    <div className={`border border-muted/50 divide-y divide-1 divide-muted/50 rounded-lg ${ClassName}`}>
      {Items.map((item) => {
        const id = item.title.replaceAll(" ", "").trim()
        const isOpen = openIds.includes(id)

        return (
          <div key={id} className="overflow-hidden">
            <h3>
              <button
                type="button"
                role="switch"
                aria-expanded={isOpen}
                onClick={() => toggleItem(id)}
                className="cursor-pointer bg-s1/50 flex w-full items-center justify-between px-4 py-3 text-left font-medium transition-colors"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden="true"
                  className={`ml-2 transition-transform duration-250 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className="size-4" />
                </span>
              </button>
            </h3>

            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-3 pt-1 text-sm text-muted">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Accordion