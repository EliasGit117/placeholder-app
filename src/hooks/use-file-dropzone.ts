import type React from 'react'
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from 'react'

export interface IFileDropzoneOptions {
  accept?: string
  multiple?: boolean
  onFilesSelected: (files: File[]) => void
}

export interface IFileDropzoneState {
  isDragging: boolean
}

export interface IFileDropzoneActions {
  openFileDialog: () => void
  handleDragEnter: (e: DragEvent<HTMLElement>) => void
  handleDragLeave: (e: DragEvent<HTMLElement>) => void
  handleDragOver: (e: DragEvent<HTMLElement>) => void
  handleDrop: (e: DragEvent<HTMLElement>) => void
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>
  ) => InputHTMLAttributes<HTMLInputElement> & { ref: React.Ref<HTMLInputElement> }
}

export const useFileDropzone = (
  options: IFileDropzoneOptions
): [IFileDropzoneState, IFileDropzoneActions] => {
  const { accept = '*', multiple = false, onFilesSelected } = options

  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (inputRef.current?.disabled) return

    if (e.dataTransfer.files?.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      onFilesSelected(multiple ? files : [files[0]])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files))
      e.target.value = ''
    }
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const getInputProps = (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
    ...props,
    type: 'file' as const,
    onChange: handleFileChange,
    accept: props.accept ?? accept,
    multiple: props.multiple ?? multiple,
    ref: inputRef,
  })

  return [
    { isDragging },
    { openFileDialog, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleFileChange, getInputProps },
  ]
}