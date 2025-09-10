# Mini 4WD Converter User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Using the Web Interface](#using-the-web-interface)
4. [File Format Support](#file-format-support)
5. [Mini 4WD Validation](#mini-4wd-validation)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

## Introduction

Welcome to the Mini 4WD Converter! This comprehensive tool helps you convert various file formats for use with Tamiya Mini 4WD parts. Whether you're designing custom chassis, wheels, or body shells, this application provides the tools you need to ensure compatibility and quality.

### What Can You Do?

- **Convert Files**: Transform STL, CAD, SVG, JPG, PNG files between different formats
- **Validate Parts**: Check if your designs meet Mini 4WD specifications
- **3D Print Ready**: Generate STL files optimized for 3D printing
- **Quality Check**: Analyze mesh quality and detect potential issues

## Getting Started

### Accessing the Application

You have three ways to use the Mini 4WD Converter:

1. **React Web Application**: Full-featured interface with modern UI
2. **Standalone HTML**: Simple drag-and-drop interface that works offline
3. **REST API**: Programmatic access for automation

### System Requirements

- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **File Size Limit**: Maximum 50MB per file
- **Internet Connection**: Required for the React web app, optional for standalone

## Using the Web Interface

### Step 1: Upload Files

1. **Drag and Drop**: Simply drag your files onto the upload area
2. **Click to Browse**: Click the upload area to open a file picker
3. **Multiple Files**: You can upload multiple files at once

**Supported Formats**:
- 3D Models: STL, STEP, IGES, OBJ, PLY
- Vector Graphics: SVG
- Images: JPG, PNG

### Step 2: Choose Output Format

For each uploaded file, select your desired output format:

- **STL**: Perfect for 3D printing
- **OBJ**: Universal 3D format, works with most software
- **PLY**: Research format with additional data
- **SVG**: Vector graphics for 2D applications

### Step 3: Convert and Validate

1. Click "Convert File" to start the conversion process
2. The system will automatically validate Mini 4WD compatibility
3. Monitor the progress in real-time

### Step 4: Review Results

After conversion, you'll see:

- **Validation Results**: Compatibility check for Mini 4WD standards
- **Quality Analysis**: Mesh quality and potential issues
- **Part Classification**: Automatic detection of part type (chassis, wheel, body)
- **Download Link**: Access to your converted file

## File Format Support

### Input Formats

| Format | Extension | Description | Best For |
|--------|-----------|-------------|----------|
| STL | .stl | Standard 3D printing format | 3D printed parts |
| STEP | .step, .stp | CAD interchange format | Professional CAD files |
| IGES | .iges, .igs | Legacy CAD format | Older CAD systems |
| OBJ | .obj | Universal 3D format | General 3D models |
| PLY | .ply | Research 3D format | Scientific applications |
| SVG | .svg | Vector graphics | 2D designs, logos |
| JPEG | .jpg, .jpeg | Raster image | Photos, textures |
| PNG | .png | Raster image | Graphics with transparency |

### Output Formats

- **STL**: Optimized for 3D printing with proper normals and watertight mesh
- **OBJ**: Compatible with most 3D software, includes material information
- **PLY**: Preserves additional mesh data like colors and vertex properties
- **SVG**: Vector format for 2D applications and laser cutting

## Mini 4WD Validation

The application includes comprehensive validation for Mini 4WD compatibility:

### Chassis Validation

- **Maximum Dimensions**: 165mm × 105mm × 40mm
- **Axle Holes**: Proper positioning for front and rear axles
- **Wall Thickness**: Minimum 1.5mm for structural integrity
- **Mounting Points**: Space for body and accessory attachment

### Wheel Validation

- **Standard Sizes**: 24mm or 30mm diameter
- **Thickness**: 2-15mm recommended range
- **Axle Hole**: 2mm diameter for standard axles
- **Balance**: Check for uniform mass distribution

### Body Shell Validation

- **Aerodynamics**: Basic shape analysis
- **Mounting**: Compatibility with chassis attachment points
- **Weight**: Estimation for overall car balance
- **Clearance**: Ensure no interference with wheels

### Validation Results

Results are color-coded for easy understanding:

- 🟢 **Green**: Passes all checks
- 🟡 **Yellow**: Minor issues or warnings
- 🔴 **Red**: Critical problems that need fixing

## Troubleshooting

### Common Issues

#### "File Upload Failed"
- **Cause**: File too large or unsupported format
- **Solution**: Check file size (max 50MB) and format compatibility

#### "Conversion Failed"
- **Cause**: Corrupted file or unsupported geometry
- **Solution**: Try re-exporting from your CAD software with different settings

#### "Mesh Not Watertight"
- **Cause**: Holes or gaps in the 3D model
- **Solution**: Use mesh repair tools in your CAD software

#### "API Connection Error"
- **Cause**: Backend server not running
- **Solution**: Ensure the Python backend is started

### File Quality Tips

1. **Export Settings**: Use high-quality export settings from your CAD software
2. **Mesh Density**: Balance detail with file size
3. **Units**: Ensure correct units (millimeters recommended)
4. **Orientation**: Position parts for optimal 3D printing

## Advanced Usage

### API Integration

For developers, the REST API provides programmatic access:

```bash
# Upload a file
curl -X POST -F "file=@model.stl" http://localhost:5000/api/upload

# Convert with validation
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"file_id":"id","output_format":"obj","validate_mini4wd":true}' \
  http://localhost:5000/api/convert
```

### Batch Processing

Use the API to process multiple files automatically:

```python
import requests
import os

def convert_files(directory, output_format="stl"):
    for filename in os.listdir(directory):
        if filename.endswith(('.step', '.iges', '.obj')):
            # Upload file
            with open(os.path.join(directory, filename), 'rb') as f:
                response = requests.post(
                    'http://localhost:5000/api/upload',
                    files={'file': f}
                )
            
            # Convert file
            file_id = response.json()['file_id']
            requests.post(
                'http://localhost:5000/api/convert',
                json={
                    'file_id': file_id,
                    'output_format': output_format,
                    'validate_mini4wd': True
                }
            )
```

### Custom Validation Rules

The validation system can be extended with custom rules for specific requirements:

```python
# Example: Custom wheel diameter validation
def validate_custom_wheel(mesh, diameter_mm):
    # Implementation of custom validation logic
    return validation_result
```

## Tips for Best Results

### 3D Printing Optimization

1. **Wall Thickness**: Maintain minimum 0.8mm walls
2. **Support Structures**: Design parts to minimize support needs
3. **Layer Adhesion**: Orient parts for strong layer bonding
4. **Material Choice**: Consider PLA for beginners, ABS for durability

### CAD Best Practices

1. **Parametric Design**: Use parameters for easy modifications
2. **Feature History**: Maintain clean feature trees
3. **Constraints**: Properly constrain sketches
4. **Units**: Work in millimeters for consistency

### File Management

1. **Naming Convention**: Use descriptive filenames
2. **Version Control**: Keep track of design iterations
3. **Backup**: Regularly backup your design files
4. **Documentation**: Include notes about design decisions

## Support and Community

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share tips
- **Wiki**: Community-contributed guides and tutorials
- **Documentation**: This manual and API reference

### Contributing

The Mini 4WD Converter is open source! You can contribute by:

- Reporting bugs and suggesting features
- Improving documentation
- Adding new file format support
- Enhancing validation rules
- Creating tutorials and examples

### License

This project is licensed under the MIT License, allowing free use, modification, and distribution.

---

**Happy Designing!** 🏎️

For more information, visit the [GitHub repository](https://github.com/lizewkn/mini4wd-converter) or check out the [online documentation](https://lizewkn.github.io/mini4wd-converter/).