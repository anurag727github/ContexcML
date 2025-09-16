# 🗺️ GIS System with Real-Time Speech-to-Text

A comprehensive web-based Geographic Information System (GIS) with advanced voice control capabilities, built with Next.js, React, and Leaflet.

## ✨ Features

### 🎤 **Real-Time Speech Recognition**
- **Continuous Voice Recognition**: Always-on listening mode
- **Real-Time Transcription**: Live speech-to-text conversion
- **Voice Command Processing**: Intelligent command interpretation
- **Speech Feedback**: Audio responses to voice commands
- **Command History**: Track recent voice commands
- **Multi-language Support**: Configurable language settings

### 🗣️ **Voice Commands**
- **Navigation**: "zoom in", "zoom out", "reset view"
- **Search**: "search for [location]" (e.g., "search for Paris")
- **Tools**: "select marker tool", "select polygon tool", "select measure tool"
- **Layers**: "show cities", "show regions", "hide layers"
- **Data**: "export data", "clear measurements"
- **Quick Navigation**: "go to New York", "go to London", "go to Tokyo"
- **Help**: "help" - lists all available commands

### 🗺️ **Interactive Mapping**
- Interactive map with zoom, pan, and navigation
- Multiple base map layers (OpenStreetMap)
- Real-time map updates and smooth interactions
- Voice-controlled navigation and zoom

### 📊 **Layer Management**
- Multiple data layers with visibility controls
- Voice-controlled layer toggling
- Layer opacity adjustment
- Color-coded layer visualization
- Layer statistics and information

### 🔍 **Search & Geocoding**
- Voice-activated location search
- Text-based search with geocoding
- Address and place name lookup
- Automatic map centering on search results

### 🛠️ **Drawing & Editing Tools**
- Voice-controlled tool selection
- Add markers, polygons, and polylines
- Interactive drawing tools
- Feature editing and deletion
- Spatial measurement tools

### 📈 **Spatial Analysis**
- Voice-activated measurements
- Distance and area calculations
- Feature selection and querying
- Spatial statistics
- Data visualization

### 💾 **Data Management**
- Voice-controlled data export
- Import GeoJSON and CSV files
- Export data in multiple formats
- Feature attribute management
- Data validation and processing

## 🎯 **Voice Commands Reference**

### **Navigation Commands**
- `"zoom in"` - Zoom in on the map
- `"zoom out"` - Zoom out on the map  
- `"reset view"` - Reset to default map view
- `"go to [city]"` - Navigate to specific cities (New York, London, Paris, Tokyo, Los Angeles)

### **Search Commands**
- `"search for [location]"` - Search for any location
- Example: `"search for Eiffel Tower"`
- Example: `"search for Central Park"`

### **Tool Selection**
- `"select marker tool"` - Switch to marker drawing tool
- `"select polygon tool"` - Switch to polygon drawing tool
- `"select measure tool"` - Switch to measurement tool

### **Layer Control**
- `"show cities"` - Toggle cities layer visibility
- `"show regions"` - Toggle regions layer visibility

### **Data Management**
- `"export data"` - Export visible layers as GeoJSON
- `"clear measurements"` - Remove all measurements

### **Help & Information**
- `"help"` - List all available voice commands

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ installed
- Modern web browser with microphone access
- HTTPS connection (required for speech recognition)

### Installation

1. **Clone or create the project**
   \`\`\`bash
   npx create-next-app@latest gis-voice-system --typescript --tailwind --eslint
   cd gis-voice-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install leaflet @types/leaflet @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
   \`\`\`

3. **Copy the code files**
   - Copy all the provided code files to your project
   - Ensure proper file structure as shown above

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - **Allow microphone access** when prompted
   - Click the "Voice" button to start voice recognition

## 🎤 **Voice Control Setup**

### **Browser Permissions**
1. **Allow Microphone Access**: Click "Allow" when prompted
2. **HTTPS Required**: Speech recognition requires secure connection
3. **Supported Browsers**: Chrome, Edge, Safari (latest versions)

### **Voice Recognition Settings**
- **Language**: Default set to English (US)
- **Continuous Mode**: Always listening when enabled
- **Interim Results**: Shows real-time transcription
- **Voice Feedback**: Audio responses to commands

### **Troubleshooting Voice Issues**
- **No Microphone Access**: Check browser permissions
- **Commands Not Working**: Speak clearly and wait for feedback
- **Recognition Stops**: Click the voice button to restart
- **No Audio Feedback**: Check volume settings and speech feedback toggle

## 🎯 **How to Use Voice Control**

### **Getting Started**
1. Click the **microphone button** in the header
2. Wait for "Voice recognition started" confirmation
3. Speak your commands clearly
4. Listen for audio feedback confirming actions

### **Best Practices**
- **Speak Clearly**: Use normal speaking pace
- **Wait for Feedback**: Allow system to process each command
- **Use Exact Phrases**: Follow the command reference above
- **Check Status**: Monitor the voice status panel for feedback

### **Example Voice Workflow**
1. `"search for Paris"` - Navigate to Paris
2. `"zoom in"` - Get closer view
3. `"select marker tool"` - Switch to marker mode
4. Click on map to add markers
5. `"select measure tool"` - Switch to measurement
6. `"export data"` - Save your work

## 🔧 **Technical Implementation**

### **Speech Recognition**
- **Web Speech API**: Native browser speech recognition
- **Continuous Listening**: Real-time voice processing
- **Command Parsing**: Intelligent command interpretation
- **Error Handling**: Robust error recovery

### **Speech Synthesis**
- **Text-to-Speech**: Audio feedback for all actions
- **Configurable Voice**: Adjustable rate, pitch, volume
- **Smart Responses**: Context-aware feedback messages

### **Frontend Stack**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Leaflet**: Interactive mapping library
- **Radix UI**: Accessible component primitives

## 🌐 **Browser Compatibility**

### **Speech Recognition Support**
- **Chrome 90+**: Full support
- **Edge 90+**: Full support  
- **Safari 14+**: Limited support
- **Firefox**: Not supported (uses polyfill)

### **Requirements**
- **HTTPS Connection**: Required for microphone access
- **Microphone Permission**: Must be granted by user
- **Modern Browser**: ES6+ support required

## 🔒 **Privacy & Security**

- **Local Processing**: Speech recognition runs in browser
- **No Data Storage**: Voice data not stored on servers
- **Secure Connection**: HTTPS required for microphone access
- **User Control**: Voice recognition can be disabled anytime

## 📱 **Mobile Support**

- **Touch Interface**: Full touch support for mobile devices
- **Voice Recognition**: Works on mobile browsers with microphone
- **Responsive Design**: Optimized for all screen sizes
- **Gesture Support**: Touch gestures for map navigation

## 🚀 **Deployment**

### **Deploy to Vercel**
\`\`\`bash
npm run build
vercel --prod
\`\`\`

### **HTTPS Requirement**
- Voice recognition requires HTTPS in production
- Vercel provides HTTPS by default
- Local development works with HTTP

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Test voice commands thoroughly
4. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

---

**🎤 Voice-Controlled GIS - The Future of Spatial Analysis**

*Say "help" to get started with voice commands!*
