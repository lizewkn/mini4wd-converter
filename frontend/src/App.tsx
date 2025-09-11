import React, { useState, useCallback } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ConversionPanel from './components/ConversionPanel';
import ValidationResults from './components/ValidationResults';
import Header from './components/Header';
import Footer from './components/Footer';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  validation?: any;
  conversionResult?: any;
}

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'convert' | 'validate'>('upload');

  const handleFileUpload = useCallback(async (uploadedFiles: File[]) => {
    setIsProcessing(true);
    
    const newFiles: UploadedFile[] = [];
    
    for (const file of uploadedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        newFiles.push({
          id: response.data.file_id,
          name: response.data.original_name,
          type: response.data.file_type,
          size: response.data.file_size,
          validation: response.data.validation
        });
      } catch (error) {
        console.error('Upload failed:', error);
        // Handle error - could show toast notification
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
    
    if (newFiles.length > 0) {
      setCurrentStep('convert');
    }
  }, []);

  const handleConversion = useCallback(async (fileId: string, outputFormat: string, plateSettings?: { enabled: boolean; thickness: number; screwHoleDiameter: number }) => {
    try {
      setIsProcessing(true);
      
      const requestData: any = {
        file_id: fileId,
        output_format: outputFormat,
        validate_mini4wd: true
      };

      if (plateSettings?.enabled) {
        requestData.tamiya_plate_settings = {
          thickness: plateSettings.thickness,
          screw_hole_diameter: plateSettings.screwHoleDiameter
        };
      }
      
      const response = await axios.post('/api/convert', requestData);
      
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, conversionResult: response.data }
          : file
      ));
      
      setCurrentStep('validate');
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = useCallback(async (fileId: string) => {
    try {
      const response = await axios.get(`/api/download/${fileId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileId);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const resetApp = () => {
    setFiles([]);
    setCurrentStep('upload');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium">Upload</span>
              </div>
              
              <div className={`flex items-center ${currentStep === 'convert' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'convert' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">Convert</span>
              </div>
              
              <div className={`flex items-center ${currentStep === 'validate' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'validate' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium">Validate</span>
              </div>
            </div>
          </div>

          {/* Content based on current step */}
          {currentStep === 'upload' && (
            <FileUpload 
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'convert' && (
            <ConversionPanel 
              files={files}
              onConvert={handleConversion}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'validate' && (
            <ValidationResults 
              files={files}
              onDownload={handleDownload}
              onReset={resetApp}
            />
          )}

          {/* Navigation buttons */}
          {files.length > 0 && (
            <div className="mt-8 flex justify-between">
              {currentStep !== 'upload' && (
                <button
                  onClick={() => {
                    if (currentStep === 'convert') setCurrentStep('upload');
                    else if (currentStep === 'validate') setCurrentStep('convert');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={resetApp}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors ml-auto"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;