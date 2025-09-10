# 🏎️ Mini 4WD Converter

A complete web application for converting STL, CAD, SVG, JPG, and PNG files for Tamiya Mini 4WD parts. Features multi-format upload, CAD/STL output, Mini 4WD parts validation with error handling, drag-and-drop interface, real-time feedback, and responsive design.

[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://lizewkn.github.io/mini4wd-converter/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)

## ✨ Features

- **🎯 Multi-Format Support**: Convert between STL, STEP, IGES, SVG, JPG, PNG, OBJ, PLY formats
- **🏁 Mini 4WD Validation**: Automated compatibility checking for Tamiya Mini 4WD specifications
- **🖱️ Drag & Drop Interface**: Intuitive file upload with real-time progress feedback
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Real-Time Processing**: Live conversion progress and validation results
- **🔧 Error Handling**: Comprehensive error detection and user-friendly messages
- **🌐 Multiple Interfaces**: React frontend, standalone HTML, and REST API
- **📚 Complete Documentation**: GitHub Pages site with user manual and API reference

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
git clone https://github.com/lizewkn/mini4wd-converter.git
cd mini4wd-converter
docker-compose up --build
```

Access the application at:
- **React App**: http://localhost:3000
- **API**: http://localhost:5000
- **Documentation**: http://localhost:8080

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

#### Standalone Interface

Simply open `standalone/index.html` in your web browser.

## 📖 Documentation

- **📘 User Manual**: [Complete guide with examples](https://lizewkn.github.io/mini4wd-converter/user-manual.html)
- **🔧 API Reference**: [REST API documentation](https://lizewkn.github.io/mini4wd-converter/#api)
- **🏠 Main Documentation**: [https://lizewkn.github.io/mini4wd-converter/](https://lizewkn.github.io/mini4wd-converter/)

## 🛠️ Technology Stack

### Backend
- **Python 3.8+** with Flask framework
- **Trimesh** for 3D model processing
- **Pillow** for image handling
- **NumPy** for numerical computations

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Heroicons** for UI icons
- **React Dropzone** for file uploads

### Infrastructure
- **Docker** containerization
- **GitHub Pages** for documentation
- **REST API** for programmatic access

## 📁 Project Structure

```
mini4wd-converter/
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── utils/              # Processing utilities
│   │   ├── file_processor.py
│   │   └── mini4wd_validator.py
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container
├── frontend/               # React TypeScript app
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   └── App.tsx         # Main application
│   ├── package.json        # Node dependencies
│   └── Dockerfile          # Frontend container
├── standalone/             # HTML/JS interface
│   ├── index.html          # Standalone app
│   └── script.js           # JavaScript logic
├── docs/                   # GitHub Pages site
│   ├── index.html          # Documentation home
│   └── user-manual.md      # User guide
├── docker-compose.yml      # Multi-container setup
└── README.md               # This file
```

## 🎯 Mini 4WD Validation Features

The application includes comprehensive validation for Mini 4WD compatibility:

### Chassis Validation
- ✅ Maximum dimensions (165×105×40mm)
- ✅ Axle hole positioning
- ✅ Wall thickness analysis
- ✅ Structural integrity checks

### Wheel Validation
- ✅ Standard diameter checking (24mm/30mm)
- ✅ Thickness validation (2-15mm)
- ✅ Axle hole compatibility
- ✅ Balance assessment

### General Quality Checks
- ✅ Mesh watertightness
- ✅ File format validation
- ✅ 3D printing compatibility
- ✅ Error detection and reporting

## 🔌 API Usage

### Upload a File
```bash
curl -X POST \
  http://localhost:5000/api/upload \
  -F "file=@example.stl"
```

### Convert File
```bash
curl -X POST \
  http://localhost:5000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "uploaded_file_id",
    "output_format": "obj",
    "validate_mini4wd": true
  }'
```

### Download Result
```bash
curl -X GET \
  http://localhost:5000/api/download/converted_file_id \
  -o result.obj
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🐛 Report Bugs**: [Open an issue](https://github.com/lizewkn/mini4wd-converter/issues)
2. **💡 Suggest Features**: [Create a feature request](https://github.com/lizewkn/mini4wd-converter/issues)
3. **📝 Improve Documentation**: Submit pull requests for docs
4. **🔧 Add Features**: Fork, develop, and submit pull requests
5. **🧪 Write Tests**: Help improve test coverage

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mini4wd-converter.git
cd mini4wd-converter

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
cd frontend && npm install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- **Tamiya** for creating the amazing Mini 4WD platform
- **Open Source Community** for the excellent libraries used
- **Contributors** who help improve this project

## 🔗 Links

- **🌐 Live Demo**: [GitHub Pages](https://lizewkn.github.io/mini4wd-converter/)
- **📚 Documentation**: [User Manual](https://lizewkn.github.io/mini4wd-converter/user-manual.html)
- **🐛 Issues**: [GitHub Issues](https://github.com/lizewkn/mini4wd-converter/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/lizewkn/mini4wd-converter/discussions)

---

**Built with ❤️ for the Mini 4WD community**
