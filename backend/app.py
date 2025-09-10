from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from utils.file_processor import FileProcessor
from utils.mini4wd_validator import Mini4WDValidator
import traceback

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'stl', 'step', 'stp', 'iges', 'igs', 'svg', 'jpg', 'jpeg', 'png', 'obj', 'ply'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    """Determine file type based on extension"""
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in ['stl', 'step', 'stp', 'iges', 'igs', 'obj', 'ply']:
        return 'cad'
    elif ext == 'svg':
        return 'vector'
    elif ext in ['jpg', 'jpeg', 'png']:
        return 'image'
    return 'unknown'

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and basic validation"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'File type not supported',
                'supported_types': list(ALLOWED_EXTENSIONS)
            }), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        
        # Get file info
        file_type = get_file_type(filename)
        file_size = os.path.getsize(filepath)
        
        # Basic file validation
        processor = FileProcessor()
        validation_result = processor.validate_file(filepath, file_type)
        
        return jsonify({
            'file_id': unique_filename,
            'original_name': filename,
            'file_type': file_type,
            'file_size': file_size,
            'validation': validation_result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/convert', methods=['POST'])
def convert_file():
    """Convert uploaded file to specified format"""
    try:
        data = request.get_json()
        if not data or 'file_id' not in data:
            return jsonify({'error': 'file_id required'}), 400
        
        file_id = data['file_id']
        output_format = data.get('output_format', 'stl').lower()
        validate_mini4wd = data.get('validate_mini4wd', True)
        
        # Validate input file exists
        input_path = os.path.join(UPLOAD_FOLDER, file_id)
        if not os.path.exists(input_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Process conversion
        processor = FileProcessor()
        result = processor.convert_file(input_path, output_format)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        # Mini 4WD validation if requested
        validation_result = None
        if validate_mini4wd and output_format in ['stl', 'obj']:
            validator = Mini4WDValidator()
            validation_result = validator.validate_part(result['output_path'])
        
        response_data = {
            'success': True,
            'output_file': result['output_file'],
            'output_format': output_format,
            'conversion_time': result.get('conversion_time', 0),
            'timestamp': datetime.now().isoformat()
        }
        
        if validation_result:
            response_data['mini4wd_validation'] = validation_result
        
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"Conversion error: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({'error': f'Conversion failed: {str(e)}'}), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_file(file_id):
    """Download converted file"""
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file_id)
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        app.logger.error(f"Download error: {str(e)}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/validate', methods=['POST'])
def validate_mini4wd():
    """Validate file as Mini 4WD part"""
    try:
        data = request.get_json()
        if not data or 'file_id' not in data:
            return jsonify({'error': 'file_id required'}), 400
        
        file_id = data['file_id']
        file_path = os.path.join(UPLOAD_FOLDER, file_id)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        validator = Mini4WDValidator()
        result = validator.validate_part(file_path)
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': f'Validation failed: {str(e)}'}), 500

@app.route('/api/formats', methods=['GET'])
def supported_formats():
    """Get supported input and output formats"""
    return jsonify({
        'input_formats': {
            'cad': ['stl', 'step', 'stp', 'iges', 'igs', 'obj', 'ply'],
            'vector': ['svg'],
            'image': ['jpg', 'jpeg', 'png']
        },
        'output_formats': ['stl', 'obj', 'ply', 'svg'],
        'mini4wd_compatible': ['stl', 'obj']
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)