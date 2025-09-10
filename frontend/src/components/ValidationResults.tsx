import React from 'react';
import { UploadedFile } from '../App';
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ValidationResultsProps {
  files: UploadedFile[];
  onDownload: (fileId: string) => void;
  onReset: () => void;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({ files, onDownload, onReset }) => {
  const renderValidationResults = (validation: any) => {
    if (!validation) return null;

    return (
      <div className="space-y-3">
        {/* Basic validation info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Part Type:</span>
            <div className="font-medium capitalize">{validation.part_type || 'Unknown'}</div>
          </div>
          {validation.dimensions && (
            <div>
              <span className="text-gray-500">Dimensions:</span>
              <div className="font-medium">
                {validation.dimensions.length}×{validation.dimensions.width}×{validation.dimensions.height}mm
              </div>
            </div>
          )}
          {validation.volume && (
            <div>
              <span className="text-gray-500">Volume:</span>
              <div className="font-medium">{validation.volume}mm³</div>
            </div>
          )}
          <div>
            <span className="text-gray-500">Watertight:</span>
            <div className={`font-medium ${validation.is_watertight ? 'text-green-600' : 'text-red-600'}`}>
              {validation.is_watertight ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Validation issues */}
        {validation.errors && validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="font-medium text-red-800 mb-2">❌ Errors</h4>
            <ul className="text-sm text-red-600 space-y-1">
              {validation.errors.map((error: string, index: number) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings && validation.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warnings</h4>
            <ul className="text-sm text-yellow-600 space-y-1">
              {validation.warnings.map((warning: string, index: number) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.suggestions && validation.suggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="font-medium text-blue-800 mb-2">💡 Suggestions</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              {validation.suggestions.map((suggestion: string, index: number) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mesh quality info */}
        {validation.mesh_quality && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <h4 className="font-medium text-gray-800 mb-2">🔍 Mesh Quality</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Vertices:</span>
                <span className="ml-2 font-medium">{validation.mesh_quality.vertex_count?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Faces:</span>
                <span className="ml-2 font-medium">{validation.mesh_quality.face_count?.toLocaleString()}</span>
              </div>
            </div>
            {validation.mesh_quality.issues && validation.mesh_quality.issues.length > 0 && (
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                {validation.mesh_quality.issues.map((issue: string, index: number) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validation Results</h2>
        <p className="text-gray-600">
          Review Mini 4WD compatibility and download your converted files
        </p>
      </div>

      <div className="space-y-6">
        {files.map((file) => (
          <div key={file.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {file.conversionResult ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                    {file.conversionResult && (
                      <p className="text-sm text-gray-500">
                        Converted to {file.conversionResult.output_format?.toUpperCase()} 
                        {file.conversionResult.conversion_time && 
                          ` in ${file.conversionResult.conversion_time}s`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {file.conversionResult && (
                <button
                  onClick={() => onDownload(file.conversionResult.output_file)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>

            {/* Mini 4WD Validation Results */}
            {file.conversionResult?.mini4wd_validation && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Mini 4WD Compatibility</h4>
                {renderValidationResults(file.conversionResult.mini4wd_validation)}
              </div>
            )}

            {/* Original file validation */}
            {file.validation && !file.conversionResult?.mini4wd_validation && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3">File Validation</h4>
                {renderValidationResults(file.validation)}
              </div>
            )}

            {/* Conversion status */}
            <div className={`p-3 rounded-md ${
              file.conversionResult ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                {file.conversionResult ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Conversion successful</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">Conversion pending</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary and actions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{files.length}</div>
            <div className="text-sm text-gray-600">Files processed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {files.filter(f => f.conversionResult).length}
            </div>
            <div className="text-sm text-gray-600">Successfully converted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {files.filter(f => f.conversionResult?.mini4wd_validation?.valid).length}
            </div>
            <div className="text-sm text-gray-600">Mini 4WD compatible</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationResults;