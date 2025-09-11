import os
import time
import tempfile
from PIL import Image
import numpy as np
try:
    import trimesh
except ImportError:
    trimesh = None

class FileProcessor:
    """Handles file processing and conversion operations"""
    
    def __init__(self):
        self.supported_input_formats = {
            'cad': ['stl', 'step', 'stp', 'iges', 'igs', 'obj', 'ply'],
            'vector': ['svg'],
            'image': ['jpg', 'jpeg', 'png']
        }
        self.supported_output_formats = ['stl', 'obj', 'ply', 'svg']
    
    def validate_file(self, filepath, file_type):
        """Basic file validation"""
        try:
            file_size = os.path.getsize(filepath)
            ext = os.path.splitext(filepath)[1].lower()[1:]
            
            validation = {
                'valid': True,
                'file_size': file_size,
                'format': ext,
                'type': file_type,
                'warnings': [],
                'errors': []
            }
            
            # Size validation
            if file_size > 50 * 1024 * 1024:  # 50MB
                validation['errors'].append('File size exceeds 50MB limit')
                validation['valid'] = False
            
            if file_size == 0:
                validation['errors'].append('File is empty')
                validation['valid'] = False
            
            # Format-specific validation
            if file_type == 'image':
                try:
                    with Image.open(filepath) as img:
                        validation['dimensions'] = img.size
                        validation['mode'] = img.mode
                except Exception as e:
                    validation['errors'].append(f'Invalid image file: {str(e)}')
                    validation['valid'] = False
            
            elif file_type == 'cad' and trimesh:
                try:
                    if ext == 'stl':
                        mesh = trimesh.load_mesh(filepath)
                        validation['vertices'] = len(mesh.vertices)
                        validation['faces'] = len(mesh.faces)
                        validation['is_watertight'] = mesh.is_watertight
                        
                        if not mesh.is_watertight:
                            validation['warnings'].append('Mesh is not watertight')
                        
                        if len(mesh.vertices) == 0:
                            validation['errors'].append('Mesh has no vertices')
                            validation['valid'] = False
                            
                except Exception as e:
                    validation['errors'].append(f'Invalid CAD file: {str(e)}')
                    validation['valid'] = False
            
            return validation
            
        except Exception as e:
            return {
                'valid': False,
                'errors': [f'Validation failed: {str(e)}']
            }
    
    def convert_file(self, input_path, output_format, tamiya_plate_settings=None):
        """Convert file to specified format"""
        start_time = time.time()
        
        try:
            input_ext = os.path.splitext(input_path)[1].lower()[1:]
            output_filename = f"converted_{int(time.time())}.{output_format}"
            output_path = os.path.join(os.path.dirname(input_path), output_filename)
            
            # Handle different conversion scenarios
            if input_ext == output_format:
                # Same format, just copy
                import shutil
                shutil.copy2(input_path, output_path)
                
            elif input_ext in ['jpg', 'jpeg', 'png'] and output_format == 'svg':
                # Image to SVG conversion (basic)
                self._image_to_svg(input_path, output_path)
                
            elif input_ext == 'svg' and output_format in ['stl', 'obj']:
                # SVG to 3D conversion (basic extrusion)
                self._svg_to_3d(input_path, output_path, output_format, tamiya_plate_settings)
                
            elif input_ext in ['stl', 'obj', 'ply'] and output_format in ['stl', 'obj', 'ply']:
                # 3D format conversion
                self._convert_3d_format(input_path, output_path, output_format, tamiya_plate_settings)
                
            else:
                return {
                    'success': False,
                    'error': f'Conversion from {input_ext} to {output_format} not supported'
                }
            
            conversion_time = time.time() - start_time
            
            return {
                'success': True,
                'output_path': output_path,
                'output_file': output_filename,
                'conversion_time': round(conversion_time, 2)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Conversion failed: {str(e)}'
            }
    
    def _image_to_svg(self, input_path, output_path):
        """Convert image to SVG by embedding"""
        import base64
        
        with open(input_path, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode()
        
        # Get image dimensions
        with Image.open(input_path) as img:
            width, height = img.size
        
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,{img_data}" width="{width}" height="{height}"/>
</svg>'''
        
        with open(output_path, 'w') as svg_file:
            svg_file.write(svg_content)
    
    def _svg_to_3d(self, input_path, output_path, output_format, tamiya_plate_settings=None):
        """Convert SVG to 3D by basic extrusion"""
        # This is a simplified conversion - in a real application you'd use
        # libraries like svg2mesh or implement proper SVG parsing and extrusion
        
        if not trimesh:
            raise ImportError("trimesh library required for 3D conversion")
        
        # Use Tamiya plate settings if provided
        if tamiya_plate_settings:
            thickness = tamiya_plate_settings.get('thickness', 1.5)
            screw_hole_diameter = tamiya_plate_settings.get('screw_hole_diameter', 2.05)
            
            # Create a plate with specified thickness instead of default box
            # This is a placeholder - in real implementation you'd extrude the SVG shape
            box = trimesh.creation.box(extents=[50, 30, thickness])
            
            # Add screw holes (simplified representation)
            if screw_hole_diameter > 0:
                # This is a placeholder for hole creation logic
                pass
        else:
            # Create a simple extruded rectangle as placeholder
            box = trimesh.creation.box(extents=[10, 10, 2])
        
        if output_format == 'stl':
            box.export(output_path)
        elif output_format == 'obj':
            box.export(output_path)
    
    def _convert_3d_format(self, input_path, output_path, output_format, tamiya_plate_settings=None):
        """Convert between 3D formats"""
        if not trimesh:
            raise ImportError("trimesh library required for 3D conversion")
        
        mesh = trimesh.load_mesh(input_path)
        
        # Apply Tamiya plate modifications if enabled
        if tamiya_plate_settings:
            # This is where you'd apply thickness adjustments and screw holes
            # For now, just export the mesh as-is
            pass
            
        mesh.export(output_path)