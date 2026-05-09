// Component taken as a base from 'https://github.com/Aslam97/react-confirm-dialog'

import {
  useState,
  useContext,
  createContext,
  memo,
  type ReactNode,
  type ComponentPropsWithRef
} from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

export interface CustomActionsProps {
  confirm: () => void
  cancel: () => void
  config: ConfirmOptions
  setConfig: ConfigUpdater
}

export type ConfigUpdater = (
  config: ConfirmOptions | ((prev: ConfirmOptions) => ConfirmOptions)
) => void

export type LegacyCustomActions = (
  onConfirm: () => void,
  onCancel: () => void
) => ReactNode

export type EnhancedCustomActions = (props: CustomActionsProps) => ReactNode

export interface ConfirmOptions {
  title?: ReactNode
  description?: ReactNode
  contentSlot?: ReactNode
  confirmText?: string
  cancelText?: string
  icon?: ReactNode
  customActions?: LegacyCustomActions | EnhancedCustomActions
  confirmButton?: ComponentPropsWithRef<typeof AlertDialogAction>
  cancelButton?: ComponentPropsWithRef<typeof AlertDialogCancel> | null
  alertDialogOverlay?: ComponentPropsWithRef<typeof AlertDialogOverlay>
  alertDialogContent?: ComponentPropsWithRef<typeof AlertDialogContent>
  alertDialogHeader?: ComponentPropsWithRef<typeof AlertDialogHeader>
  alertDialogTitle?: ComponentPropsWithRef<typeof AlertDialogTitle>
  alertDialogDescription?: ComponentPropsWithRef<typeof AlertDialogDescription>
  alertDialogFooter?: ComponentPropsWithRef<typeof AlertDialogFooter>
}

export interface ConfirmDialogState {
  isOpen: boolean
  config: ConfirmOptions
  resolver: ((value: boolean) => void) | null
}

export interface ConfirmContextValue {
  confirm: ConfirmFunction
  updateConfig: ConfigUpdater
}

export interface ConfirmFunction {
  (options: ConfirmOptions): Promise<boolean>
  updateConfig?: ConfigUpdater
}

export const ConfirmContext = createContext<ConfirmContextValue | undefined>(
  undefined
)

const baseDefaultOptions: ConfirmOptions = {
  title: '',
  description: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmButton: {},
  cancelButton: {},
  alertDialogContent: {},
  alertDialogHeader: {},
  alertDialogTitle: {},
  alertDialogDescription: {},
  alertDialogFooter: {}
}

function isLegacyCustomActions(
  fn: LegacyCustomActions | EnhancedCustomActions
): fn is LegacyCustomActions {
  return fn.length === 2
}

const ConfirmDialogContent = memo(
  ({
     config,
     onConfirm,
     onCancel,
     setConfig
   }: {
    config: ConfirmOptions
    onConfirm: () => void
    onCancel: () => void
    setConfig: ConfigUpdater
  }) => {
    const {
      title,
      description,
      cancelButton,
      confirmButton,
      confirmText,
      cancelText,
      icon,
      contentSlot,
      customActions,
      alertDialogOverlay,
      alertDialogContent,
      alertDialogHeader,
      alertDialogTitle,
      alertDialogDescription,
      alertDialogFooter
    } = config

    const renderActions = () => {
      if (!customActions) {
        return (
          <>
            {cancelButton !== null && (
              <AlertDialogCancel onClick={onCancel} {...cancelButton}>
                {cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={onConfirm} {...confirmButton}>
              {confirmText}
            </AlertDialogAction>
          </>
        )
      }

      if (isLegacyCustomActions(customActions)) {
        return customActions(onConfirm, onCancel)
      }

      return customActions({
        confirm: onConfirm,
        cancel: onCancel,
        config,
        setConfig
      })
    }

    const renderTitle = () => {
      if (!title && !icon) return null

      return (
        <AlertDialogTitle {...alertDialogTitle}>
          {icon}
          {title}
        </AlertDialogTitle>
      )
    }

    return (
      <AlertDialogPortal>
        <AlertDialogOverlay {...alertDialogOverlay} />
        <AlertDialogContent {...alertDialogContent}>
          <AlertDialogHeader {...alertDialogHeader}>
            {renderTitle()}
            {description && (
              <AlertDialogDescription {...alertDialogDescription}>
                {description}
              </AlertDialogDescription>
            )}
            {contentSlot}
          </AlertDialogHeader>
          <AlertDialogFooter {...alertDialogFooter}>
            {renderActions()}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    )
  }
)
ConfirmDialogContent.displayName = 'ConfirmDialogContent'

const ConfirmDialog = memo(
  ({
     isOpen,
     onOpenChange,
     config,
     onConfirm,
     onCancel,
     setConfig
   }: {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    config: ConfirmOptions
    onConfirm: () => void
    onCancel: () => void
    setConfig: ConfigUpdater
  }) => (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <ConfirmDialogContent
        config={config}
        onConfirm={onConfirm}
        onCancel={onCancel}
        setConfig={setConfig}
      />
    </AlertDialog>
  )
)
ConfirmDialog.displayName = 'ConfirmDialog'

export function ConfirmDialogProvider({
                                        defaultOptions = {},
                                        children
                                      }: {
  defaultOptions?: ConfirmOptions
  children: ReactNode
}) {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    config: baseDefaultOptions,
    resolver: null
  })

  const mergedDefaultOptions = { ...baseDefaultOptions, ...defaultOptions }

  const updateConfig: ConfigUpdater = (newConfig) => {
    setDialogState((prev) => ({
      ...prev,
      config:
        typeof newConfig === 'function'
          ? newConfig(prev.config)
          : { ...prev.config, ...newConfig }
    }))
  }

  const confirm: ConfirmFunction = (options) =>
    new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        config: { ...mergedDefaultOptions, ...options },
        resolver: resolve
      })
    })

  const handleConfirm = () => {
    setDialogState((prev) => {
      prev.resolver?.(true)
      return { ...prev, isOpen: false, resolver: null }
    })
  }

  const handleCancel = () => {
    setDialogState((prev) => {
      prev.resolver?.(false)
      return { ...prev, isOpen: false, resolver: null }
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) handleCancel()
  }

  const contextValue: ConfirmContextValue = {
    confirm,
    updateConfig
  }

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onOpenChange={handleOpenChange}
        config={dialogState.config}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        setConfig={updateConfig}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider')
  }

  return Object.assign(context.confirm, { updateConfig: context.updateConfig })
}
