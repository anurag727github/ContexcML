# 🚀 Deployment Guide - AI Code Generator v13

## 🌐 **Production Deployment Options**

### **🔥 Vercel (Recommended)**
Perfect for Next.js applications with automatic HTTPS and edge functions.

#### **Quick Deploy**
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Follow prompts to configure
\`\`\`

#### **Environment Variables**
Add in Vercel Dashboard → Settings → Environment Variables:
\`\`\`
OPENAI_API_KEY=sk-your-openai-api-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
\`\`\`

#### **Custom Domain**
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS records
4. SSL certificate is automatic

---

### **🌊 Netlify**
Great for static sites with form handling and serverless functions.

#### **Deploy Steps**
\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=out
\`\`\`

#### **Configuration**
Create \`netlify.toml\`:
\`\`\`toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

---

### **🐳 Docker Deployment**
For containerized deployments and self-hosting.

#### **Dockerfile**
\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

#### **Docker Compose**
\`\`\`yaml
version: '3.8'
services:
  ai-code-generator:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=sk-your-openai-api-key-here
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
    restart: unless-stopped
\`\`\`

---

### **☁️ AWS Deployment**

#### **AWS Amplify**
\`\`\`bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
\`\`\`

#### **AWS Lambda + CloudFront**
Use Serverless Framework:
\`\`\`yaml
# serverless.yml
service: ai-code-generator

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    memory: 1024
    timeout: 30
\`\`\`

---

## 🔒 **HTTPS Requirements**

### **Why HTTPS is Required**
- **Voice recognition** requires secure context
- **Microphone access** blocked on HTTP (except localhost)
- **Modern browser security** policies
- **Production best practices**

### **SSL Certificate Options**
1. **Automatic**: Vercel, Netlify provide free SSL
2. **Let's Encrypt**: Free SSL for self-hosted
3. **CloudFlare**: Free SSL proxy service
4. **Custom**: Purchase SSL certificate

---

## 🔧 **Environment Configuration**

### **Required Environment Variables**
\`\`\`bash
# Production URL (required for CORS and redirects)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# OpenAI API Key (optional - for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Node Environment
NODE_ENV=production
\`\`\`

### **EmailJS Configuration**
Update in \`app/page.tsx\`:
\`\`\`javascript
const EMAILJS_CONFIG = {
  publicKey: 'your_production_public_key',
  serviceId: 'your_production_service_id',
  templateId: 'your_production_template_id'
}
\`\`\`

---

## 📊 **Performance Optimization**

### **Build Optimization**
\`\`\`bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Optimize images
npm install next-optimized-images
\`\`\`

### **Caching Strategy**
\`\`\`javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=86400' }
        ]
      }
    ]
  }
}
\`\`\`

### **CDN Configuration**
- **Static assets**: Serve from CDN
- **Images**: Use Next.js Image optimization
- **Fonts**: Preload critical fonts
- **Scripts**: Load non-critical scripts async

---

## 🔍 **Monitoring & Analytics**

### **Error Tracking**
\`\`\`bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.mjs
\`\`\`

### **Performance Monitoring**
- **Vercel Analytics**: Built-in performance metrics
- **Google Analytics**: User behavior tracking
- **Web Vitals**: Core performance metrics
- **Uptime monitoring**: Service availability

### **Logging**
\`\`\`javascript
// Production logging
console.log = process.env.NODE_ENV === 'production' ? () => {} : console.log
\`\`\`

---

## 🧪 **Testing in Production**

### **Pre-deployment Checklist**
- [ ] Build completes without errors
- [ ] All environment variables configured
- [ ] HTTPS certificate valid
- [ ] Microphone permissions work
- [ ] Voice recognition functional
- [ ] Email delivery working
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility verified

### **Post-deployment Testing**
\`\`\`bash
# Test production build locally
npm run build
npm start

# Test on different devices
# - Desktop browsers (Chrome, Edge, Safari, Firefox)
# - Mobile browsers (iOS Safari, Android Chrome)
# - Different screen sizes and orientations
\`\`\`

### **Load Testing**
\`\`\`bash
# Install artillery
npm install -g artillery

# Create load test
artillery quick --count 10 --num 5 https://your-app.com
\`\`\`

---

## 🚨 **Troubleshooting Deployment**

### **Common Issues**

#### **Build Failures**
\`\`\`bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
\`\`\`

#### **Environment Variables Not Working**
- Verify variable names (case-sensitive)
- Check deployment platform configuration
- Restart deployment after changes

#### **Voice Recognition Not Working**
- Ensure HTTPS is properly configured
- Check SSL certificate validity
- Test microphone permissions

#### **Email Delivery Failing**
- Verify EmailJS configuration
- Check CORS settings
- Test with different email providers

### **Debug Commands**
\`\`\`bash
# Check build output
npm run build 2>&1 | tee build.log

# Analyze bundle
npx @next/bundle-analyzer

# Test production locally
npm run start
\`\`\`

---

## 📈 **Scaling Considerations**

### **Traffic Growth**
- **CDN**: Use CloudFront or CloudFlare
- **Database**: Consider adding persistent storage
- **Caching**: Implement Redis for session storage
- **Load balancing**: Multiple server instances

### **Feature Expansion**
- **API rate limiting**: Prevent abuse
- **User authentication**: Add user accounts
- **Usage analytics**: Track feature usage
- **A/B testing**: Test new features

---

## 🔐 **Security Best Practices**

### **Production Security**
- **HTTPS only**: Force SSL redirect
- **CSP headers**: Content Security Policy
- **Rate limiting**: Prevent API abuse
- **Input validation**: Sanitize user input
- **Error handling**: Don't expose sensitive info

### **API Security**
\`\`\`javascript
// Secure API routes
export async function POST(request) {
  // Validate request origin
  const origin = request.headers.get('origin')
  if (!allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 })
  }
  
  // Rate limiting
  // Input validation
  // Error handling
}
\`\`\`

---

## 🎯 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Code tested locally
- [ ] Environment variables configured
- [ ] EmailJS setup completed
- [ ] OpenAI API key added (optional)
- [ ] Build process successful
- [ ] Dependencies up to date

### **Deployment**
- [ ] Choose deployment platform
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Verify deployment successful

### **Post-Deployment**
- [ ] Test all functionality
- [ ] Verify voice recognition works
- [ ] Test email delivery
- [ ] Check mobile compatibility
- [ ] Monitor for errors
- [ ] Set up analytics (optional)

---

**🚀 Your AI Code Generator v13 is now live in production!**

*Ready to handle voice-controlled code generation at scale.*
