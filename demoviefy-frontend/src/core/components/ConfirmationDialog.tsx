// src/core/components/ConfirmationDialog.tsx

import { useState } from "react"
import { WarningSVG } from 'src/assets/SVG/WarningSVG'

interface ConfirmationDialogProps {
    title?: string
  message?: string
  onConfirm: () => void | Promise<void>
  children: (openDialog: () => void) => React.ReactNode
}

export function ConfirmationDialog({
    title = "Excluir item",
    message = "Tem certeza de que deseja excluir este item? Esta ação é irreversível",
  onConfirm,
  children,
}: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {children(() => setIsOpen(true))}

      {isOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-xl dark:bg-neutral-800">
            <div className="mb-4 flex justify-center">
                <WarningSVG />
            </div>

            <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
            <p className="mb-6 text-base leading-6 text-neutral-600 dark:text-neutral-300">{message}</p>

            <div className="mt-4 flex justify-between gap-3">
              <button
                type="button"
                className="cursor-pointer rounded-md bg-neutral-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                onClick={async () => {
                  await onConfirm()
                  setIsOpen(false)
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
