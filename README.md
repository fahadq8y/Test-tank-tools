# 🛢️ Tank Tools KNPC v5.0

**Complete Tank Management System for KNPC Operations**

## 🎯 **Features**

### 📊 **Calculators**
- **PBCR Calculator** (`index.html`) - Barrel calculations with smart tank data
- **PLCR Calculator** (`plcr.html`) - MT/hr calculations for PLCR operations  

### 🔴 **Live Operations**
- **Live Tanks** (`live-tanks.html`) - Real-time tank monitoring with smart Firebase path selection
- **NMOGAS Blender** (`nmogas.html`) - Blending calculations and operations

### 🔧 **Management**
- **Admin Dashboard** (`dashboard.html`) - User management and system administration
- **Login System** (`login.html`) - Secure authentication with device fingerprinting

## 🚀 **Quick Start**

### **🌍 Live Demo**
- **Production**: https://test-tank-tools.vercel.app
- **Local Development**: Use any HTTP server

### **📱 Main Pages**
- `/` - PBCR Calculator (Home)
- `/login` - User Authentication
- `/dashboard` - Admin Dashboard
- `/live-tanks` - Live Tank Monitoring
- `/plcr` - PLCR Calculations
- `/nmogas` - NMOGAS Blender

## 🔧 **Technical Stack**

- **Frontend**: Pure HTML5, CSS3, JavaScript ES6+
- **Database**: Firebase Firestore
- **Authentication**: Custom session management with device fingerprinting
- **Deployment**: Vercel (Static Site)
- **Security**: XSS protection, CORS handling, device authorization

## 🔥 **Firebase Integration**

### **Smart Path Selection**
- **MT/hr tanks** → PLCR department (`tankData/plcr/tanks`)
- **bbl, m³/hr, meter/hr tanks** → PBCR department (`tankData/pbcr/tanks`)

### **Data Collections**
- `users` - User accounts and permissions
- `tankData/{dept}/tanks` - Tank specifications by department
- `liveTanks` - Active tank operations
- `activities` - System activity logs

## 🛠️ **Development**

### **Local Development**
```bash
# Serve locally
python -m http.server 8000
# Or use any HTTP server
npx serve .
```

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

## 🔐 **Security Features**

- Device fingerprinting and authorization
- Session management with timeout
- Firebase security rules
- XSS and CSRF protection
- Role-based access control

## 📝 **Recent Updates (v5.0)**

### ✅ **Tank Calculation Fixes**
- Fixed broken tanks: 221, 460, 462, 834, 833, 520, 521
- Implemented smart Firebase path selection based on Rate Unit
- Resolved Firebase duplicate app initialization errors

### ✅ **Session Management**
- Extended login redirect timing (2000ms)
- Added session verification before redirect
- Automatic session recovery mechanism
- Enhanced error logging and debugging

### ✅ **Firebase Optimization**
- Prevented duplicate app initialization across pages
- Improved connection handling for Vercel deployment
- Added getApps() checks before initializeApp()

## 👨‍💻 **Developer**

**Fahad - 17877**
- KNPC Tank Operations Specialist
- Full-stack Developer
- Firebase & JavaScript Expert

## 📞 **Support**

For technical support or feature requests:
- **Internal**: Contact Fahad - 17877
- **Issues**: Create GitHub issue for bug reports
- **Updates**: Check this repository for latest versions

---

**🔥 Built for KNPC Operations - Tank Management Excellence**