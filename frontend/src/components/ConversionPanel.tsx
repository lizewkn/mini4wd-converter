import React, { useState } from 'react';
import { UploadedFile } from '../App';
import { DocumentIcon, CogIcon } from '@heroicons/react/24/outline';

interface ConversionPanelProps {
  files: UploadedFile[];
  onConvert: (fileId: string, outputFormat: string, plateSettings?: { enabled: boolean; thickness: number; screwHoleDiameter: number }, excludeWheels?: boolean) => void;
  isProcessing: boolean;
}

const ConversionPanel: React.FC<ConversionPanelProps> = ({ files, onConvert, isProcessing }) => {
  const [selectedFormats, setSelectedFormats] = useState<{ [key: string]: string }>({});
  const [tamiyaPlateSettings, setTamiyaPlateSettings] = useState<{ [key: string]: { enabled: boolean; thickness: number; screwHoleDiameter: number } }>({});
  const [excludeWheels, setExcludeWheels] = useState<{ [key: string]: boolean }>({});

  const outputFormats = [
    { value: 'stl', label: 'STL', description: '3D printing ready format' },
    { value: 'obj', label: 'OBJ', description: 'Universal 3D format' },
    { value: 'ply', label: 'PLY', description: 'Research format' },
    { value: 'svg', label: 'SVG', description: 'Vector graphics' }
  ];

  const handleFormatChange = (fileId: string, format: string) => {
    setSelectedFormats(prev => ({
      ...prev,
      [fileId]: format
    }));
  };

  const handleTamiyaSettingChange = (fileId: string, setting: 'enabled' | 'thickness' | 'screwHoleDiameter', value: boolean | number) => {
    setTamiyaPlateSettings(prev => ({
      ...prev,
      [fileId]: {
        enabled: prev[fileId]?.enabled || false,
        thickness: prev[fileId]?.thickness || 1.5,
        screwHoleDiameter: prev[fileId]?.screwHoleDiameter || 2.05,
        [setting]: value
      }
    }));
  };

  const handleExcludeWheelsChange = (fileId: string, exclude: boolean) => {
    setExcludeWheels(prev => ({
      ...prev,
      [fileId]: exclude
    }));
  };

  const handleConvert = (fileId: string) => {
    const format = selectedFormats[fileId] || 'stl';
    const plateSettings = tamiyaPlateSettings[fileId];
    const excludeWheelsForFile = excludeWheels[fileId] || false;
    onConvert(fileId, format, plateSettings, excludeWheelsForFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Convert Files</h2>
        <p className="text-gray-600">
          Choose output format and configure Tamiya FRP/Carbon plate settings for your Mini 4WD parts
        </p>
      </div>

      <div className="space-y-6">
        {files.map((file) => (
          <div key={file.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <DocumentIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    {file.type} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              {file.validation && (
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    file.validation.valid ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm ${
                    file.validation.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {file.validation.valid ? 'Valid' : 'Issues found'}
                  </span>
                </div>
              )}
            </div>

            {/* Validation warnings/errors */}
            {file.validation && (file.validation.warnings?.length > 0 || file.validation.errors?.length > 0) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                {file.validation.errors?.map((error: string, index: number) => (
                  <p key={index} className="text-sm text-red-600 mb-1">❌ {error}</p>
                ))}
                {file.validation.warnings?.map((warning: string, index: number) => (
                  <p key={index} className="text-sm text-yellow-600">⚠️ {warning}</p>
                ))}
              </div>
            )}

            {/* Output format selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {outputFormats.map((format) => (
                  <label key={format.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`format-${file.id}`}
                      value={format.value}
                      checked={selectedFormats[file.id] === format.value}
                      onChange={() => handleFormatChange(file.id, format.value)}
                      className="sr-only"
                    />
                    <div className={`p-3 border rounded-lg text-center transition-all ${
                      selectedFormats[file.id] === format.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tamiya FRP/Carbon Plate Settings */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id={`tamiya-${file.id}`}
                  checked={tamiyaPlateSettings[file.id]?.enabled || false}
                  onChange={(e) => handleTamiyaSettingChange(file.id, 'enabled', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`tamiya-${file.id}`} className="text-sm font-medium text-blue-800">
                  🏎️ Tamiya FRP/Carbon Plate Mode
                </label>
              </div>
              
              {tamiyaPlateSettings[file.id]?.enabled && (
                <div className="space-y-3 bg-white p-3 rounded border border-blue-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plate Thickness
                    </label>
                    <div className="flex space-x-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`thickness-${file.id}`}
                          value="1.5"
                          checked={(tamiyaPlateSettings[file.id]?.thickness || 1.5) === 1.5}
                          onChange={() => handleTamiyaSettingChange(file.id, 'thickness', 1.5)}
                          className="mr-1 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">1.5mm (FRP)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`thickness-${file.id}`}
                          value="3"
                          checked={(tamiyaPlateSettings[file.id]?.thickness || 1.5) === 3}
                          onChange={() => handleTamiyaSettingChange(file.id, 'thickness', 3)}
                          className="mr-1 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">3.0mm (Carbon)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor={`screwhole-${file.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Screw Hole Diameter (mm)
                    </label>
                    <input
                      type="number"
                      id={`screwhole-${file.id}`}
                      value={tamiyaPlateSettings[file.id]?.screwHoleDiameter || 2.05}
                      onChange={(e) => handleTamiyaSettingChange(file.id, 'screwHoleDiameter', parseFloat(e.target.value) || 2.05)}
                      step="0.01"
                      min="1"
                      max="5"
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-500">Default: 2.05mm</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mini 4WD Validation Settings */}
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-3">
                <span className="text-sm font-medium text-green-800 mr-4">
                  🏎️ Mini 4WD Validation Options
                </span>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`exclude-wheels-${file.id}`}
                  checked={excludeWheels[file.id] || false}
                  onChange={(e) => handleExcludeWheelsChange(file.id, e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor={`exclude-wheels-${file.id}`} className="text-sm text-green-700">
                  Exclude wheels from validation
                </label>
                <span className="ml-2 text-xs text-gray-500">
                  (Skip validation for wheel parts)
                </span>
              </div>
            </div>

            {/* Convert button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleConvert(file.id)}
                disabled={isProcessing || !selectedFormats[file.id]}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  isProcessing || !selectedFormats[file.id]
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <CogIcon className="w-4 h-4 animate-spin" />
                    <span>Converting...</span>
                  </div>
                ) : (
                  'Convert File'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionPanel;