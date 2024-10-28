// DropZone.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LinearProgress } from '@mui/material'

interface DropZoneProps {
  selectedFiles: FileList | null
  uploadProgress: number[]
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const DropZone: React.FC<DropZoneProps> = ({
  selectedFiles,
  uploadProgress,
  onDrop,
  onDragOver,
  onChange,
}) => {
  const { t } = useTranslation()

  return (
    <div className='text-center'>
      <div
        className='bg-grisclair p-4 rounded-lg border-dashed border-2 border-anthracite text-center cursor-pointer mb-2'
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        {selectedFiles
          ? t('create-ad.upload-drag-drop')
          : t('create-ad.upload-drag-drop')}
      </div>
      <input
        id='fileInput'
        type='file'
        multiple
        onChange={onChange}
        style={{ display: 'none' }}
      />
      {selectedFiles && (
        <div style={{ marginBottom: '10px' }}>
          {uploadProgress.map((progress, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{selectedFiles[index].name}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <LinearProgress
                variant='determinate'
                value={progress}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DropZone
