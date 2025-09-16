# 🚀 Installation Guide - AI Code Generator v13

## 📋 **Prerequisites**

### **System Requirements**
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm 9+** or **yarn 1.22+** or **pnpm 8+**
- **Modern web browser** (Chrome 90+, Edge 90+, Safari 14+)
- **Microphone** (for voice recognition features)

### **Browser Compatibility**
- ✅ **Chrome 90+**: Full support (Recommended)
- ✅ **Edge 90+**: Full support
- ⚠️ **Safari 14+**: Limited voice support
- ❌ **Firefox**: No voice support (manual input only)

## 🛠️ **Step-by-Step Installation**

### **1. Extract and Setup**
\`\`\`bash
# Extract the zip file
unzip ai-code-generator-v13.zip
cd ai-code-generator-v13

# Verify Node.js version
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
\`\`\`

### **2. Install Dependencies**
\`\`\`bash
# Using npm (recommended)
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
\`\`\`

### **3. Environment Configuration**
\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit the environment file
nano .env.local  # or use your preferred editor
\`\`\`

**Add your API keys:**
\`\`\`env
# Optional: OpenAI API key for AI-powered generation
OPENAI_API_KEY=sk-your-openai-api-key-here

# Required: Configure EmailJS in app/page.tsx
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### **4. EmailJS Configuration**
Edit \`app/page.tsx\` and replace:
\`\`\`javascript
const EMAILJS_CONFIG = {
  publicKey: 'your_actual_public_key',    // From EmailJS dashboard
  serviceId: 'your_actual_service_id',    // From EmailJS dashboard
  templateId: 'your_actual_template_id'   // From EmailJS dashboard
}
\`\`\`

**Get EmailJS credentials:**
1. Sign up at [EmailJS.com](https://www.emailjs.com/)
2. Create an email service
3. Create an email template
4. Get your public key, service ID, and template ID

### **5. Start Development Server**
\`\`\`bash
# Start the development server
npm run dev

# Or with yarn
yarn dev

# Or with pnpm
pnpm dev
\`\`\`

### **6. Open in Browser**
1. Open [http://localhost:3000](http://localhost:3000)
2. **Allow microphone access** when prompted
3. Test voice recognition by clicking "Start Listening"
4. Try generating code with voice or text input

## 🔧 **Configuration Options**

### **OpenAI API Setup (Optional)**
For AI-powered code generation:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to \`.env.local\`: \`OPENAI_API_KEY=sk-your-key-here\`
3. Restart development server

**Without OpenAI API:**
- Uses smart template-based code generation
- Still fully functional with 5+ programming languages
- No external API calls required

### **EmailJS Setup (Required)**
For email delivery functionality:
1. Create account at [EmailJS.com](https://www.emailjs.com/)
2. Set up email service (Gmail, Outlook, etc.)
3. Create email template with variables
4. Update configuration in \`app/page.tsx\`

**Detailed EmailJS guide:** See \`emailjs-setup.md\`

## 🎤 **Voice Recognition Setup**

### **Browser Permissions**
1. **Chrome/Edge**: Click microphone icon in address bar → "Always allow"
2. **Safari**: Safari → Settings → Websites → Microphone → "Allow"
3. **System**: Ensure browser has microphone access in system settings

### **Testing Voice Features**
1. Click "Allow Microphone" button
2. Grant permission when browser prompts
3. Click "Start Listening"
4. Speak: "Create a React component for a todo list"
5. Watch live transcript appear
6. Verify text is added to prompt field

**Troubleshooting:** See \`MICROPHONE_PERMISSION_GUIDE.md\`

## 🚀 **Production Deployment**

### **Build for Production**
\`\`\`bash
# Create production build
npm run build

# Test production build locally
npm start
\`\`\`

### **Deploy to Vercel (Recommended)**
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Add environment variables in Vercel dashboard
\`\`\`

### **Deploy to Netlify**
\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
\`\`\`

### **Environment Variables for Production**
Add these in your deployment platform:
- \`OPENAI_API_KEY\` (optional)
- \`NEXT_PUBLIC_APP_URL\` (your production URL)

## 🧪 **Testing Installation**

### **Basic Functionality Test**
- [ ] Application loads at localhost:3000
- [ ] Form fields are responsive
- [ ] Sample text insertion works
- [ ] Code generation works (with or without OpenAI)
- [ ] Email sending works (after EmailJS setup)

### **Voice Recognition Test**
- [ ] Microphone permission can be granted
- [ ] "Start Listening" button works
- [ ] Live transcript appears when speaking
- [ ] Speech is added to prompt field
- [ ] Audio feedback works (if enabled)

### **Error Handling Test**
- [ ] Permission denied shows helpful message
- [ ] Network errors are handled gracefully
- [ ] Invalid input shows appropriate errors
- [ ] Fallback code generation works

## 🛠️ **Development Commands**

\`\`\`bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
\`\`\`

## 📁 **Project Structure**
\`\`\`
ai-code-generator-v13/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main application
│   ├── actions.ts           # Server actions
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # UI components
│   └── theme-provider.tsx   # Theme provider
├── lib/                     # Utility functions
│   └── utils.ts             # Helper functions
├── public/                  # Static assets
├── docs/                    # Documentation
├── .env.example             # Environment template
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.mjs          # Next.js configuration
\`\`\`

## 🆘 **Troubleshooting**

### **Common Issues**

**1. "Module not found" errors**
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

**2. "Permission denied" for microphone**
- Check browser permissions
- Ensure HTTPS in production
- See \`MICROPHONE_PERMISSION_GUIDE.md\`

**3. EmailJS not working**
- Verify configuration in \`app/page.tsx\`
- Check EmailJS dashboard setup
- See \`emailjs-setup.md\`

**4. Build errors**
\`\`\`bash
# Type check
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run build
\`\`\`

### **Getting Help**
1. Check documentation files in the project
2. Review browser console for errors
3. Test in different browsers
4. Verify all configuration steps

## ✅ **Installation Complete!**

Your AI Code Generator v13 is now ready to use with:
- 🎤 **Voice recognition** for hands-free coding
- 🤖 **AI-powered** code generation
- 📧 **Email delivery** of generated code
- 🎯 **Smart templates** for multiple languages
- 📱 **Mobile support** and responsive design

**Next Steps:**
1. Configure EmailJS for email delivery
2. Add OpenAI API key for enhanced AI features
3. Deploy to production with HTTPS
4. Start generating code with voice commands!
