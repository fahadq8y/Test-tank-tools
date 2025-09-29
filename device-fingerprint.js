/**
 * Device Fingerprinting System for Mobile Devices
 * Developer: Fahad - 17877
 * Version: 1.0
 * 
 * هذا النظام يحدد الجهاز بناءً على معلومات الهاردوير والنظام
 * مناسب للهواتف و PWA applications
 */

// ✅ دالة إنشاء بصمة الجهاز للهواتف (محسنة للتوافق العالي)
async function generateDeviceFingerprint() {
    console.log('📱 Starting device fingerprinting...');
    
    // استخدام try-catch منفصلة لكل جزء
    let screenInfo = {};
    let systemInfo = {};
    let locationInfo = {};
    let connectionInfo = {};
    let canvasFingerprint = 'unavailable';
    
    try {
        
        // 1. معلومات الشاشة (آمنة)
        screenInfo = {
            width: (screen && screen.width) ? screen.width : 1920,
            height: (screen && screen.height) ? screen.height : 1080,
            pixelRatio: window.devicePixelRatio || 1,
            colorDepth: (screen && screen.colorDepth) ? screen.colorDepth : 24,
            orientation: (screen.orientation && screen.orientation.angle !== undefined) ? screen.orientation.angle : 0
        };
    } catch (e) {
        console.warn('Screen info error:', e);
        screenInfo = { width: 1920, height: 1080, pixelRatio: 1, colorDepth: 24, orientation: 0 };
    }
    
    try {
        // 2. معلومات المتصفح والنظام (آمنة)
        systemInfo = {
            userAgent: navigator.userAgent || 'Unknown',
            language: navigator.language || 'en',
            languages: (navigator.languages && navigator.languages.length > 0) ? navigator.languages.join(',') : (navigator.language || 'en'),
            platform: navigator.platform || 'Unknown',
            vendor: navigator.vendor || 'unknown'
        };
    } catch (e) {
        console.warn('System info error:', e);
        systemInfo = { userAgent: 'Unknown', language: 'en', languages: 'en', platform: 'Unknown', vendor: 'unknown' };
    }
    
    try {
        // 3. معلومات الوقت والمنطقة (آمنة)
        locationInfo = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            timezoneOffset: new Date().getTimezoneOffset() || 0
        };
    } catch (e) {
        console.warn('Location info error:', e);
        locationInfo = { timezone: 'UTC', timezoneOffset: 0 };
    }
    
    try {
        // 4. معلومات الاتصال (اختيارية)
        connectionInfo = {
            connection: (navigator.connection && navigator.connection.effectiveType) ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink || 0
            } : null,
            online: navigator.onLine !== undefined ? navigator.onLine : true
        };
    } catch (e) {
        console.warn('Connection info error:', e);
        connectionInfo = { connection: null, online: true };
    }
    
    try {
        // 5. Canvas fingerprint (آمن تماماً)
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Device ID 🔒', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Mobile Security', 4, 32);
            
            canvasFingerprint = canvas.toDataURL().slice(-50); // آخر 50 حرف فقط
        } catch (e) {
            console.log('Canvas fingerprint not available:', e.message);
        }
        
        // 6. معلومات الذاكرة (للأجهزة الحديثة)
        const performanceInfo = {
            memory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
        };
        
        // 7. تجميع جميع المعلومات
        const deviceData = {
            screen: screenInfo,
            system: systemInfo,
            location: locationInfo,
            connection: connectionInfo,
            canvas: canvasFingerprint,
            performance: performanceInfo,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        console.log('📊 Device data collected:', deviceData);
        
        // 8. إنشاء hash من البيانات المهمة
        const fingerprintString = JSON.stringify({
            screen: `${screenInfo.width}x${screenInfo.height}@${screenInfo.pixelRatio}`,
            system: systemInfo.platform,
            timezone: locationInfo.timezone,
            userAgent: systemInfo.userAgent.slice(0, 100) // أول 100 حرف فقط
        });
        
        // 9. إنشاء hash بسيط (بدون crypto libraries)
        const fingerprint = await simpleHash(fingerprintString);
        
        console.log('🔒 Device fingerprint generated:', fingerprint);
        
        return {
            fingerprint: fingerprint,
            data: deviceData,
            readable: {
                device: getReadableDeviceInfo(systemInfo.userAgent),
                screen: `${screenInfo.width}x${screenInfo.height}`,
                system: getSimpleOS(systemInfo.userAgent),
                browser: getSimpleBrowser(systemInfo.userAgent)
            }
        };
        
    } catch (error) {
        console.error('❌ Error generating device fingerprint:', error);
        
        // Generate a more reliable fallback fingerprint
        const fallbackData = {
            screen: `${screen.width}x${screen.height}`,
            userAgent: navigator.userAgent.slice(0, 100),
            platform: navigator.platform || 'unknown',
            language: navigator.language || 'unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
        };
        
        const fallbackString = Object.values(fallbackData).join('|');
        const fallbackHash = await simpleHash(fallbackString + '_fallback');
        
        console.log('🔄 Using reliable fallback fingerprint method');
        
        return {
            fingerprint: fallbackHash,
            data: { 
                ...fallbackData,
                error: error.message,
                fallbackMode: true 
            },
            readable: {
                device: `Fallback Device (${navigator.platform || 'Unknown'})`,
                screen: fallbackData.screen,
                system: navigator.platform || 'Unknown OS',
                browser: getSimpleBrowser(navigator.userAgent)
            },
            readableInfo: {
                deviceName: `Fallback Device (${navigator.platform || 'Unknown'})`,
                deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop/Other',
                browser: getSimpleBrowser(navigator.userAgent),
                os: navigator.platform || 'Unknown OS',
                screenResolution: fallbackData.screen,
                timezone: fallbackData.timezone,
                language: fallbackData.language,
                cookieEnabled: navigator.cookieEnabled || false,
                javaEnabled: false,
                touchSupport: 'ontouchstart' in window
            },
            fallbackMode: true
        };
    }
}

// ✅ دالة hash بسيطة بدون crypto
async function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // تحويل إلى 32bit integer
    }
    return 'device_' + Math.abs(hash).toString(16) + '_' + Date.now().toString(36);
}

// ✅ استخراج معلومات مقروءة عن الجهاز
function getReadableDeviceInfo(userAgent) {
    if (/iPhone/i.test(userAgent)) {
        const match = userAgent.match(/iPhone OS ([\d_]+)/);
        const version = match ? match[1].replace(/_/g, '.') : 'Unknown';
        return `iPhone (iOS ${version})`;
    }
    
    if (/iPad/i.test(userAgent)) {
        return 'iPad';
    }
    
    if (/Android/i.test(userAgent)) {
        const match = userAgent.match(/Android ([\d.]+)/);
        const version = match ? match[1] : 'Unknown';
        return `Android ${version}`;
    }
    
    if (/Windows Phone/i.test(userAgent)) {
        return 'Windows Phone';
    }
    
    if (/Windows NT/i.test(userAgent)) {
        return 'Windows PC';
    }
    
    if (/Mac OS X/i.test(userAgent)) {
        return 'macOS';
    }
    
    if (/Linux/i.test(userAgent)) {
        return 'Linux';
    }
    
    return 'Unknown Device';
}

// ✅ استخراج نظام التشغيل المبسط
function getSimpleOS(userAgent) {
    if (/iPhone|iPad/i.test(userAgent)) return 'iOS';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/Windows Phone/i.test(userAgent)) return 'Windows Mobile';
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac OS X/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    return 'Unknown';
}

// ✅ استخراج المتصفح المبسط
function getSimpleBrowser(userAgent) {
    if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) return 'Chrome';
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari';
    if (/Firefox/i.test(userAgent)) return 'Firefox';
    if (/Edge|Edg/i.test(userAgent)) return 'Edge';
    if (/Opera|OPR/i.test(userAgent)) return 'Opera';
    if (/Samsung/i.test(userAgent)) return 'Samsung Internet';
    return 'Unknown Browser';
}

// ✅ حفظ بصمة الجهاز في localStorage للمقارنة
function saveDeviceFingerprint(fingerprintData) {
    try {
        localStorage.setItem('tanktools_device_fingerprint', JSON.stringify({
            fingerprint: fingerprintData.fingerprint,
            readable: fingerprintData.readable,
            savedAt: new Date().toISOString()
        }));
        console.log('💾 Device fingerprint saved locally');
    } catch (error) {
        console.error('❌ Error saving device fingerprint:', error);
    }
}

// ✅ قراءة بصمة الجهاز المحفوظة
function getSavedDeviceFingerprint() {
    try {
        const saved = localStorage.getItem('tanktools_device_fingerprint');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('❌ Error reading saved device fingerprint:', error);
        return null;
    }
}

// ✅ مقارنة بصمة الجهاز الحالية مع المحفوظة
async function compareDeviceFingerprint() {
    const current = await generateDeviceFingerprint();
    const saved = getSavedDeviceFingerprint();
    
    if (!saved) {
        console.log('📱 No saved fingerprint, this is first time');
        saveDeviceFingerprint(current);
        return { isMatch: true, reason: 'first_time', current, saved: null };
    }
    
    const isMatch = current.fingerprint === saved.fingerprint;
    console.log('🔍 Device fingerprint comparison:', { isMatch, current: current.fingerprint, saved: saved.fingerprint });
    
    if (!isMatch) {
        // قد يكون تحديث في النظام أو المتصفح - نحدث البصمة
        console.log('📱 Device fingerprint changed, updating...');
        saveDeviceFingerprint(current);
    }
    
    return { isMatch, reason: isMatch ? 'match' : 'updated', current, saved };
}

// تصدير الدوال للاستخدام العالمي
window.DeviceFingerprint = {
    generate: generateDeviceFingerprint,
    save: saveDeviceFingerprint,
    getSaved: getSavedDeviceFingerprint,
    compare: compareDeviceFingerprint
};

console.log('🔒 Device Fingerprinting System loaded successfully!');