import os
import math
try:
    import trimesh
    import numpy as np
except ImportError:
    trimesh = None
    np = None

class Mini4WDValidator:
    """Validates 3D models for Mini 4WD compatibility"""
    
    # Mini 4WD specifications (in mm)
    CHASSIS_MAX_WIDTH = 105
    CHASSIS_MAX_LENGTH = 165
    CHASSIS_MAX_HEIGHT = 40
    WHEEL_DIAMETER_SMALL = 24
    WHEEL_DIAMETER_LARGE = 30
    AXLE_DIAMETER = 2
    BEARING_HOLE_DIAMETER = 2.1
    
    def __init__(self):
        self.validation_rules = {
            'chassis': {
                'max_dimensions': (self.CHASSIS_MAX_LENGTH, self.CHASSIS_MAX_WIDTH, self.CHASSIS_MAX_HEIGHT),
                'min_thickness': 1.5,
                'required_holes': ['axle_front', 'axle_rear']
            },
            'wheel': {
                'allowed_diameters': [self.WHEEL_DIAMETER_SMALL, self.WHEEL_DIAMETER_LARGE],
                'min_thickness': 2,
                'max_thickness': 15,
                'axle_hole_diameter': self.AXLE_DIAMETER
            },
            'body': {
                'max_dimensions': (self.CHASSIS_MAX_LENGTH, self.CHASSIS_MAX_WIDTH, 50),
                'min_thickness': 0.8
            }
        }
    
    def validate_part(self, file_path, tamiya_plate_settings=None):
        """Validate a 3D part for Mini 4WD compatibility"""
        try:
            if not trimesh:
                return {
                    'valid': False,
                    'errors': ['trimesh library not available for 3D validation'],
                    'warnings': [],
                    'suggestions': []
                }
            
            # Load the mesh
            mesh = trimesh.load_mesh(file_path)
            if not hasattr(mesh, 'vertices') or len(mesh.vertices) == 0:
                return {
                    'valid': False,
                    'errors': ['Invalid or empty 3D model'],
                    'warnings': [],
                    'suggestions': []
                }
            
            # Get basic mesh properties
            bounds = mesh.bounds
            dimensions = bounds[1] - bounds[0]  # [length, width, height]
            volume = mesh.volume if hasattr(mesh, 'volume') else 0
            is_watertight = mesh.is_watertight if hasattr(mesh, 'is_watertight') else False
            
            # If Tamiya plate mode is enabled, focus on FRP/Carbon plate validation
            if tamiya_plate_settings:
                validation_result = self._validate_tamiya_plate(mesh, dimensions, tamiya_plate_settings)
            else:
                # Original validation logic
                part_type = self._classify_part(dimensions, mesh)
                validation_result = self._validate_by_type(mesh, dimensions, part_type)
            
            # Add general mesh quality checks
            general_checks = self._check_mesh_quality(mesh)
            validation_result['mesh_quality'] = general_checks
            
            # Add basic info
            validation_result['dimensions'] = {
                'length': round(dimensions[0], 2),
                'width': round(dimensions[1], 2),
                'height': round(dimensions[2], 2)
            }
            validation_result['volume'] = round(volume, 2) if volume > 0 else 0
            validation_result['is_watertight'] = is_watertight
            
            if tamiya_plate_settings:
                validation_result['tamiya_plate_mode'] = True
                validation_result['plate_settings'] = tamiya_plate_settings
            
            return validation_result
            
        except Exception as e:
            return {
                'valid': False,
                'errors': [f'Validation failed: {str(e)}'],
                'warnings': [],
                'suggestions': ['Check if the file is a valid 3D model']
            }
    
    def _classify_part(self, dimensions, mesh):
        """Classify the part type based on dimensions and geometry"""
        length, width, height = dimensions
        
        # Simple classification based on dimensions
        if length > 100 and width > 80:
            return 'chassis'
        elif min(length, width) < 35 and max(length, width) < 35:
            return 'wheel'
        elif height < 20 and (length > 50 or width > 50):
            return 'body'
        elif height > 30:
            return 'body'
        else:
            return 'accessory'
    
    def _validate_by_type(self, mesh, dimensions, part_type):
        """Validate based on the identified part type"""
        validation = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'suggestions': [],
            'part_type': part_type
        }
        
        rules = self.validation_rules.get(part_type, {})
        
        if part_type == 'chassis':
            validation.update(self._validate_chassis(mesh, dimensions, rules))
        elif part_type == 'wheel':
            validation.update(self._validate_wheel(mesh, dimensions, rules))
        elif part_type == 'body':
            validation.update(self._validate_body(mesh, dimensions, rules))
        else:
            validation['warnings'].append(f'Part type "{part_type}" - basic validation only')
        
        return validation
    
    def _validate_chassis(self, mesh, dimensions, rules):
        """Validate chassis-specific requirements"""
        result = {'errors': [], 'warnings': [], 'suggestions': []}
        
        length, width, height = dimensions
        max_dims = rules.get('max_dimensions', (165, 105, 40))
        
        # Check maximum dimensions
        if length > max_dims[0]:
            result['errors'].append(f'Length {length:.1f}mm exceeds maximum {max_dims[0]}mm')
        if width > max_dims[1]:
            result['errors'].append(f'Width {width:.1f}mm exceeds maximum {max_dims[1]}mm')
        if height > max_dims[2]:
            result['errors'].append(f'Height {height:.1f}mm exceeds maximum {max_dims[2]}mm')
        
        # Check for reasonable minimum size
        if length < 140:
            result['warnings'].append('Chassis length might be too short for standard Mini 4WD')
        if width < 90:
            result['warnings'].append('Chassis width might be too narrow')
        
        # Check if watertight (important for 3D printing)
        if not mesh.is_watertight:
            result['warnings'].append('Chassis is not watertight - may cause 3D printing issues')
            result['suggestions'].append('Fix mesh holes and ensure watertight geometry')
        
        result['suggestions'].append('Ensure axle holes are properly positioned')
        result['suggestions'].append('Add mounting points for body and accessories')
        
        return result
    
    def _validate_wheel(self, mesh, dimensions, rules):
        """Validate wheel-specific requirements"""
        result = {'errors': [], 'warnings': [], 'suggestions': []}
        
        # For wheels, we expect roughly circular cross-section
        length, width, height = dimensions
        diameter = max(length, width)
        thickness = min(length, width, height)
        
        allowed_diameters = rules.get('allowed_diameters', [24, 30])
        min_thickness = rules.get('min_thickness', 2)
        max_thickness = rules.get('max_thickness', 15)
        
        # Check diameter
        diameter_ok = False
        for allowed_d in allowed_diameters:
            if abs(diameter - allowed_d) < 2:  # 2mm tolerance
                diameter_ok = True
                break
        
        if not diameter_ok:
            result['warnings'].append(f'Wheel diameter {diameter:.1f}mm is not standard Mini 4WD size')
            result['suggestions'].append(f'Consider using standard diameters: {allowed_diameters}mm')
        
        # Check thickness
        if thickness < min_thickness:
            result['errors'].append(f'Wheel thickness {thickness:.1f}mm is too thin (minimum {min_thickness}mm)')
        if thickness > max_thickness:
            result['warnings'].append(f'Wheel thickness {thickness:.1f}mm might be too thick')
        
        # Check for axle hole (simplified check)
        if mesh.is_watertight:
            result['warnings'].append('Wheel appears solid - ensure axle hole is present')
            result['suggestions'].append('Create 2mm diameter hole for axle')
        
        return result
    
    def _validate_body(self, mesh, dimensions, rules):
        """Validate body shell requirements"""
        result = {'errors': [], 'warnings': [], 'suggestions': []}
        
        length, width, height = dimensions
        max_dims = rules.get('max_dimensions', (165, 105, 50))
        
        # Check maximum dimensions
        if length > max_dims[0]:
            result['warnings'].append(f'Body length {length:.1f}mm might be too long')
        if width > max_dims[1]:
            result['warnings'].append(f'Body width {width:.1f}mm might be too wide')
        if height > max_dims[2]:
            result['warnings'].append(f'Body height {height:.1f}mm might be too tall')
        
        # Check minimum thickness for 3D printing
        result['suggestions'].append('Ensure minimum 0.8mm wall thickness for 3D printing')
        result['suggestions'].append('Add mounting holes for chassis attachment')
        
        return result
    
    def _check_mesh_quality(self, mesh):
        """Check general mesh quality"""
        quality = {
            'vertex_count': len(mesh.vertices),
            'face_count': len(mesh.faces) if hasattr(mesh, 'faces') else 0,
            'is_watertight': mesh.is_watertight if hasattr(mesh, 'is_watertight') else False,
            'issues': []
        }
        
        # Check for reasonable polygon count
        if quality['face_count'] > 100000:
            quality['issues'].append('Very high polygon count - consider simplifying mesh')
        elif quality['face_count'] < 10:
            quality['issues'].append('Very low polygon count - mesh might be too simple')
        
        # Check for watertight mesh
        if not quality['is_watertight']:
            quality['issues'].append('Mesh has holes or non-manifold geometry')
        
        return quality
    
    def _validate_tamiya_plate(self, mesh, dimensions, plate_settings):
        """Validate Tamiya FRP/Carbon plate requirements"""
        result = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'suggestions': [],
            'part_type': 'tamiya_frp_carbon_plate'
        }
        
        length, width, height = dimensions
        expected_thickness = plate_settings.get('thickness', 1.5)
        screw_hole_diameter = plate_settings.get('screw_hole_diameter', 2.05)
        
        # Check if thickness matches expected value (with tolerance)
        thickness_tolerance = 0.2  # 0.2mm tolerance
        if abs(height - expected_thickness) > thickness_tolerance:
            result['warnings'].append(
                f'Plate thickness {height:.2f}mm differs from expected {expected_thickness}mm '
                f'(tolerance: ±{thickness_tolerance}mm)'
            )
            result['suggestions'].append(f'Consider adjusting thickness to {expected_thickness}mm for Tamiya compatibility')
        
        # Check for reasonable plate dimensions
        min_plate_size = 10  # 10mm minimum
        max_plate_size = 160  # 160mm maximum
        
        if length < min_plate_size or width < min_plate_size:
            result['warnings'].append(f'Plate dimensions ({length:.1f}×{width:.1f}mm) might be too small')
        
        if length > max_plate_size or width > max_plate_size:
            result['warnings'].append(f'Plate dimensions ({length:.1f}×{width:.1f}mm) might be too large for Mini 4WD')
        
        # Check for watertight mesh (important for 3D printing)
        if not mesh.is_watertight:
            result['errors'].append('Plate mesh is not watertight - will cause 3D printing issues')
            result['suggestions'].append('Fix mesh holes and ensure watertight geometry')
            result['valid'] = False
        
        # FRP/Carbon specific recommendations
        result['suggestions'].extend([
            f'Recommended for FRP/Carbon plates: {expected_thickness}mm thickness',
            f'Screw holes should be {screw_hole_diameter}mm diameter',
            'Ensure proper fiber direction for FRP plates',
            'Consider layer adhesion for 3D printed prototypes'
        ])
        
        # Material-specific warnings
        if expected_thickness == 1.5:
            result['suggestions'].append('1.5mm thickness suitable for lightweight FRP plates')
        elif expected_thickness == 3.0:
            result['suggestions'].append('3.0mm thickness suitable for structural Carbon plates')
        
        return result