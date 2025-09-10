import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload(acceptedFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.stl'],
      'application/step': ['.step', '.stp'],
      'application/iges': ['.iges', '.igs'],
      'image/svg+xml': ['.svg'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/wavefront-obj': ['.obj'],
      'application/ply': ['.ply']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isProcessing
  });

  const dropzoneClass = `
    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
    ${isDragAccept ? 'border-green-500 bg-green-50' : ''}
    ${isDragReject ? 'border-red-500 bg-red-50' : ''}
    ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}
  `;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Files</h2>
        <p className="text-gray-600">
          Upload STL, CAD, SVG, JPG, or PNG files to convert for Mini 4WD parts
        </p>
      </div>

      <div {...getRootProps()} className={dropzoneClass}>
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <CloudArrowUpIcon className="w-16 h-16 text-gray-400" />
          
          {isDragActive ? (
            <div className="text-blue-600">
              <p className="text-lg font-medium">Drop files here...</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports: STL, STEP, IGES, SVG, JPG, PNG, OBJ, PLY (max 50MB)
              </p>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Processing files...</span>
            </div>
          )}
        </div>
      </div>

      {/* Supported formats info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <DocumentIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">3D Models</h3>
          <p className="text-sm text-gray-600">STL, STEP, IGES, OBJ, PLY</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <DocumentIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Vector Graphics</h3>
          <p className="text-sm text-gray-600">SVG</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <DocumentIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Images</h3>
          <p className="text-sm text-gray-600">JPG, PNG</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;