class Mini4WDConverter {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.uploadedFiles = [];
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.initializeEventListeners();
        this.checkApiStatus();
        
        if (this.isGitHubPages) {
            this.showDemoMode();
        }
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // Drag and drop events
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
    }

    async checkApiStatus() {
        const statusDiv = document.getElementById('apiStatus');
        
        if (this.isGitHubPages) {
            statusDiv.className = 'status warning';
            statusDiv.innerHTML = '🌐 Demo Mode: This is a preview interface. Full functionality requires the backend server.';
            statusDiv.style.display = 'block';
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            
            if (response.ok) {
                statusDiv.className = 'status success';
                statusDiv.innerHTML = '✅ API is online and ready';
                statusDiv.style.display = 'block';
                setTimeout(() => statusDiv.style.display = 'none', 3000);
            } else {
                throw new Error('API not responding');
            }
        } catch (error) {
            statusDiv.className = 'status error';
            statusDiv.innerHTML = '❌ API is offline. Please start the backend server.';
            statusDiv.style.display = 'block';
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        this.handleFileSelect(files);
    }

    async handleFileSelect(files) {
        for (let file of files) {
            if (this.isGitHubPages) {
                await this.handleFileDemoMode(file);
            } else {
                await this.uploadFile(file);
            }
        }
    }

    async handleFileDemoMode(file) {
        const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Add file to UI immediately
        this.addFileToUI(file, fileId, 'uploading');
        
        // Simulate upload delay
        setTimeout(() => {
            const mockData = {
                file_id: fileId,
                original_name: file.name,
                file_type: this.getFileType(file.name),
                file_size: file.size,
                validation: this.generateMockValidation(file.name)
            };
            
            this.uploadedFiles.push({
                ...mockData,
                localId: fileId,
                originalFile: file
            });
            
            this.updateFileInUI(fileId, 'uploaded', mockData);
        }, 2000);
    }

    async uploadFile(file) {
        const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Add file to UI immediately
        this.addFileToUI(file, fileId, 'uploading');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.apiBaseUrl}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                this.uploadedFiles.push({
                    ...data,
                    localId: fileId,
                    originalFile: file
                });
                this.updateFileInUI(fileId, 'uploaded', data);
            } else {
                this.updateFileInUI(fileId, 'error', { error: data.error });
            }
        } catch (error) {
            this.updateFileInUI(fileId, 'error', { error: error.message });
        }
    }

    addFileToUI(file, fileId, status) {
        const fileList = document.getElementById('fileList');
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.id = `file-${fileId}`;
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-details">${this.formatFileSize(file.size)} • ${this.getFileType(file.name)}</div>
                <div class="progress-bar" id="progress-${fileId}">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="file-status" id="status-${fileId}">Uploading...</div>
            </div>
            <div class="file-actions" id="actions-${fileId}">
                <div class="spinner"></div>
            </div>
        `;
        
        fileList.appendChild(fileItem);
        
        // Animate progress bar
        if (status === 'uploading') {
            this.animateProgress(fileId);
        }
    }

    updateFileInUI(fileId, status, data) {
        const statusElement = document.getElementById(`status-${fileId}`);
        const actionsElement = document.getElementById(`actions-${fileId}`);
        const progressElement = document.getElementById(`progress-${fileId}`);

        if (status === 'uploaded') {
            statusElement.innerHTML = '✅ Uploaded successfully';
            progressElement.querySelector('.progress-fill').style.width = '100%';
            
            actionsElement.innerHTML = `
                <div class="format-selector">
                    <label>Output Format:</label>
                    <div class="format-options">
                        <div class="format-option selected" data-format="stl" onclick="this.parentNode.querySelectorAll('.format-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                            <strong>STL</strong><br><small>3D Print</small>
                        </div>
                        <div class="format-option" data-format="obj" onclick="this.parentNode.querySelectorAll('.format-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                            <strong>OBJ</strong><br><small>Universal</small>
                        </div>
                        <div class="format-option" data-format="ply" onclick="this.parentNode.querySelectorAll('.format-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                            <strong>PLY</strong><br><small>Research</small>
                        </div>
                        <div class="format-option" data-format="svg" onclick="this.parentNode.querySelectorAll('.format-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected');">
                            <strong>SVG</strong><br><small>Vector</small>
                        </div>
                    </div>
                </div>
                <div class="validation-options" style="margin: 10px 0; padding: 10px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 5px;">
                    <label style="display: flex; align-items: center; font-size: 14px; color: #075985;">
                        <input type="checkbox" id="excludeWheels-${fileId}" style="margin-right: 8px;">
                        <span>🏎️ Exclude wheels from Mini 4WD validation</span>
                    </label>
                    <small style="color: #64748b; margin-left: 20px;">Skip validation for wheel parts</small>
                </div>
                <button class="btn btn-primary" onclick="converter.convertFile('${fileId}', '${data.file_id}')">
                    Convert File
                </button>
            `;

            // Show validation results if available
            if (data.validation) {
                this.showValidationResults(fileId, data.validation);
            }
        } else if (status === 'error') {
            statusElement.innerHTML = `❌ Error: ${data.error}`;
            progressElement.style.display = 'none';
            actionsElement.innerHTML = `<button class="btn btn-secondary" onclick="this.parentNode.parentNode.parentNode.remove()">Remove</button>`;
        } else if (status === 'converting') {
            statusElement.innerHTML = '🔄 Converting...';
            actionsElement.innerHTML = '<div class="spinner"></div>';
        } else if (status === 'converted') {
            statusElement.innerHTML = '✅ Converted successfully';
            actionsElement.innerHTML = `
                <button class="btn btn-primary" onclick="converter.downloadFile('${data.output_file}')">
                    📥 Download
                </button>
                <button class="btn btn-secondary" onclick="this.parentNode.parentNode.parentNode.remove()">
                    Remove
                </button>
            `;

            // Show Mini 4WD validation results if available
            if (data.mini4wd_validation) {
                this.showValidationResults(fileId, data.mini4wd_validation, 'Mini 4WD Validation');
            }
        }
    }

    async convertFile(localFileId, serverFileId) {
        const fileElement = document.getElementById(`file-${localFileId}`);
        const selectedFormat = fileElement.querySelector('.format-option.selected')?.dataset.format || 'stl';
        const excludeWheelsCheckbox = document.getElementById(`excludeWheels-${localFileId}`);
        const excludeWheels = excludeWheelsCheckbox ? excludeWheelsCheckbox.checked : false;
        
        this.updateFileInUI(localFileId, 'converting');

        if (this.isGitHubPages) {
            // Demo mode - simulate conversion
            setTimeout(() => {
                const mockResult = {
                    output_file: `converted_${localFileId}.${selectedFormat}`,
                    mini4wd_validation: this.generateMockValidation(`converted.${selectedFormat}`, true)
                };
                this.updateFileInUI(localFileId, 'converted', mockResult);
            }, 3000);
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file_id: serverFileId,
                    output_format: selectedFormat,
                    validate_mini4wd: true,
                    exclude_wheels: excludeWheels
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.updateFileInUI(localFileId, 'converted', data);
            } else {
                this.updateFileInUI(localFileId, 'error', { error: data.error });
            }
        } catch (error) {
            this.updateFileInUI(localFileId, 'error', { error: error.message });
        }
    }

    async downloadFile(fileName) {
        if (this.isGitHubPages) {
            alert('Demo Mode: Download functionality requires the full application with backend server. Please see the documentation for setup instructions.');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/download/${fileName}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                alert('Download failed');
            }
        } catch (error) {
            alert('Download failed: ' + error.message);
        }
    }

    showValidationResults(fileId, validation, title = 'Validation Results') {
        const fileElement = document.getElementById(`file-${fileId}`);
        const existingResults = fileElement.querySelector('.validation-results');
        if (existingResults) {
            existingResults.remove();
        }

        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'validation-results';
        resultsDiv.innerHTML = `
            <div class="status ${validation.valid ? 'success' : 'warning'}" style="margin-top: 15px;">
                <strong>${title}</strong><br>
                ${validation.valid ? '✅ Valid file' : '⚠️ Issues found'}
                ${validation.part_type ? `<br>Part Type: ${validation.part_type}` : ''}
                ${validation.dimensions ? `<br>Dimensions: ${validation.dimensions.length}×${validation.dimensions.width}×${validation.dimensions.height}mm` : ''}
                ${validation.errors && validation.errors.length > 0 ? `<br><br>Errors: ${validation.errors.join(', ')}` : ''}
                ${validation.warnings && validation.warnings.length > 0 ? `<br>Warnings: ${validation.warnings.join(', ')}` : ''}
            </div>
        `;

        fileElement.querySelector('.file-info').appendChild(resultsDiv);
    }

    animateProgress(fileId) {
        const progressFill = document.querySelector(`#progress-${fileId} .progress-fill`);
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 20;
            if (width >= 90) {
                clearInterval(interval);
                width = 90;
            }
            progressFill.style.width = width + '%';
        }, 200);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const typeMap = {
            stl: 'STL Model',
            step: 'STEP CAD',
            stp: 'STEP CAD',
            iges: 'IGES CAD',
            igs: 'IGES CAD',
            svg: 'SVG Vector',
            jpg: 'JPEG Image',
            jpeg: 'JPEG Image',
            png: 'PNG Image',
            obj: 'OBJ Model',
            ply: 'PLY Model'
        };
        return typeMap[ext] || 'Unknown';
    }

    showDemoMode() {
        const header = document.querySelector('.header p');
        header.innerHTML = 'Demo Mode: Interactive Preview of the Mini 4WD Converter Interface';
        
        // Add demo notice
        const main = document.querySelector('.main');
        const demoNotice = document.createElement('div');
        demoNotice.className = 'status warning';
        demoNotice.style.marginBottom = '20px';
        demoNotice.innerHTML = `
            <strong>🌐 Demo Mode Active</strong><br>
            This is a preview of the Mini 4WD Converter interface. File processing is simulated.<br>
            For full functionality, please <a href="../index.html" style="color: #3b82f6;">visit the documentation</a> to set up the complete application.
        `;
        main.insertBefore(demoNotice, main.firstChild);
    }

    generateMockValidation(filename, isConverted = false) {
        const ext = filename.split('.').pop().toLowerCase();
        const isChassisFile = filename.toLowerCase().includes('chassis') || filename.toLowerCase().includes('frame');
        const isWheelFile = filename.toLowerCase().includes('wheel') || filename.toLowerCase().includes('tire');
        
        const validationTypes = {
            stl: {
                valid: Math.random() > 0.3,
                part_type: isChassisFile ? 'Chassis' : isWheelFile ? 'Wheel' : 'Custom Part',
                dimensions: isChassisFile 
                    ? { length: Math.floor(150 + Math.random() * 20), width: Math.floor(90 + Math.random() * 20), height: Math.floor(30 + Math.random() * 15) }
                    : { length: Math.floor(25 + Math.random() * 10), width: Math.floor(25 + Math.random() * 10), height: Math.floor(8 + Math.random() * 8) },
                errors: [],
                warnings: []
            },
            obj: {
                valid: Math.random() > 0.2,
                part_type: 'Generic 3D Model',
                dimensions: { length: Math.floor(40 + Math.random() * 80), width: Math.floor(40 + Math.random() * 80), height: Math.floor(10 + Math.random() * 30) },
                errors: [],
                warnings: ['Consider converting to STL for 3D printing']
            },
            svg: {
                valid: true,
                part_type: '2D Design',
                errors: [],
                warnings: ['2D files cannot be validated for Mini 4WD compatibility']
            }
        };

        const baseValidation = validationTypes[ext] || validationTypes.obj;
        
        if (!baseValidation.valid) {
            baseValidation.errors = ['Dimensions exceed Mini 4WD limits', 'Wall thickness too thin'];
            baseValidation.warnings = ['Consider scaling down', 'Add reinforcement structures'];
        }

        if (isConverted) {
            baseValidation.valid = true;
            baseValidation.errors = [];
            baseValidation.warnings = ['Conversion completed successfully'];
        }

        return baseValidation;
    }
}

// Initialize the converter when the page loads
const converter = new Mini4WDConverter();