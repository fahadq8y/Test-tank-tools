/**
 * Simple & Reliable Device Fingerprinting System
 * Developer: Fahad - 17877
 * Version: 2.0 - Simplified & More Reliable
 * 
 * نظام بصمة جهاز مبسط وموثوق للهواتف والأجهزة اللوحية
 */

console.log('🔒 Simple Device Fingerprinting System loaded successfully!');

// ✅ دالة بصمة الجهاز المبسطة والآمنة 100%
async function generateDeviceFingerprint() {
    console.log('📱 Generating simple device fingerprint...');
    
    try {
        // جمع المعلومات الأساسية بطريقة آمنة
        const basicInfo = {
            // معلومات الشاشة الأساسية
            screenWidth: (screen && screen.width) ? screen.width : 800,
            screenHeight: (screen && screen.height) ? screen.height : 600,
            pixelRatio: window.devicePixelRatio || 1,
            
            // معلومات النظام الأساسية
            userAgent: (navigator.userAgent || 'unknown').substring(0, 200),
            language: navigator.language || 'en',
            platform: navigator.platform || 'unknown',
            
            // معلومات الوقت
            timezone: getCurrentTimezone(),
            timezoneOffset: new Date().getTimezoneOffset() || 0,
            
            // معلومات إضافية
            cookieEnabled: navigator.cookieEnabled || false,
            onlineStatus: navigator.onLine !== undefined ? navigator.onLine : true,
            
            // بصمة زمنية للجلسة
            sessionStart: Date.now()
        };
        
        // إنشاء نص مميز للجهاز
        const deviceString = [
            basicInfo.screenWidth,
            basicInfo.screenHeight,
            basicInfo.pixelRatio,
            basicInfo.userAgent.replace(/[^a-zA-Z0-9]/g, ''),
            basicInfo.language,
            basicInfo.platform,
            basicInfo.timezone
        ].join('_');
        
        // توليد hash بسيط وموثوق
        const deviceHash = await generateSimpleHash(deviceString);
        
        // معلومات قابلة للقراءة
        const readableInfo = {
            deviceName: getDeviceName(basicInfo),
            deviceType: getDeviceType(basicInfo.userAgent),
            browser: getBrowserName(basicInfo.userAgent),
            os: getOSName(basicInfo.userAgent, basicInfo.platform),
            screenResolution: `${basicInfo.screenWidth}x${basicInfo.screenHeight}`,
            timezone: basicInfo.timezone,
            language: basicInfo.language,
            cookieEnabled: basicInfo.cookieEnabled,
            javaEnabled: false, // معظم المتصفحات الحديثة لا تدعم Java
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
        
        console.log('✅ Device fingerprint generated successfully');
        
        return {
            fingerprint: deviceHash,
            data: basicInfo,
            readableInfo: readableInfo,
            readable: {
                device: readableInfo.deviceName,
                screen: readableInfo.screenResolution,
                system: readableInfo.os,
                browser: readableInfo.browser
            },
            timestamp: new Date().toISOString(),
            version: '2.0'
        };
        
    } catch (error) {
        console.error('❌ Error in generateDeviceFingerprint:', error);
        
        // Fallback آمن جداً
        const fallbackHash = `fallback_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        
        return {
            fingerprint: fallbackHash,
            data: { error: error.message, fallback: true },
            readableInfo: {
                deviceName: 'Fallback Device',
                deviceType: 'Unknown',
                browser: 'Unknown',
                os: 'Unknown',
                screenResolution: 'Unknown',
                timezone: 'Unknown',
                language: 'en',
                cookieEnabled: false,
                javaEnabled: false,
                touchSupport: 'ontouchstart' in window
            },
            readable: {
                device: 'Fallback Device',
                screen: 'Unknown',
                system: 'Unknown',
                browser: 'Unknown'
            },
            timestamp: new Date().toISOString(),
            version: '2.0-fallback',
            error: true
        };
    }
}

// ✅ دالة hash بسيطة وآمنة
async function generateSimpleHash(text) {
    let hash = 0;
    const str = text.toString();
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // تحويل إلى 32bit integer
    }
    
    const timestamp = Date.now().toString(36);
    return `device_${Math.abs(hash).toString(16)}_${timestamp}`;
}

// ✅ دالة الحصول على المنطقة الزمنية بطريقة آمنة
function getCurrentTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
        return 'UTC';
    }
}

// ✅ تحديد نوع الجهاز
function getDeviceType(userAgent) {
    const ua = (userAgent || '').toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return 'Mobile Phone';
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
        return 'Tablet';
    } else if (ua.includes('smart-tv') || ua.includes('tv')) {
        return 'Smart TV';
    } else {
        return 'Desktop/Laptop';
    }
}

// ✅ تحديد اسم المتصفح
function getBrowserName(userAgent) {
    const ua = (userAgent || '').toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('edge')) {
        return 'Chrome';
    } else if (ua.includes('firefox')) {
        return 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
        return 'Safari';
    } else if (ua.includes('edge')) {
        return 'Edge';
    } else if (ua.includes('opera')) {
        return 'Opera';
    } else {
        return 'Unknown Browser';
    }
}

// ✅ تحديد نظام التشغيل
function getOSName(userAgent, platform) {
    const ua = (userAgent || '').toLowerCase();
    const p = (platform || '').toLowerCase();
    
    if (ua.includes('android')) {
        return 'Android';
    } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        return 'iOS';
    } else if (ua.includes('windows') || p.includes('win')) {
        return 'Windows';
    } else if (ua.includes('mac') || p.includes('mac')) {
        return 'macOS';
    } else if (ua.includes('linux') || p.includes('linux')) {
        return 'Linux';
    } else {
        return 'Unknown OS';
    }
}

// ✅ إنشاء اسم الجهاز
function getDeviceName(basicInfo) {
    const deviceType = getDeviceType(basicInfo.userAgent);
    const browser = getBrowserName(basicInfo.userAgent);
    const os = getOSName(basicInfo.userAgent, basicInfo.platform);
    
    return `${os} ${deviceType} (${browser})`;
}

// ✅ حفظ بصمة الجهاز محلياً
function saveDeviceFingerprint(fingerprintData) {
    try {
        localStorage.setItem('tanktools_device_fingerprint', JSON.stringify({
            fingerprint: fingerprintData.fingerprint,
            readable: fingerprintData.readable,
            savedAt: new Date().toISOString(),
            version: fingerprintData.version
        }));
        console.log('💾 Device fingerprint saved locally');
        return true;
    } catch (error) {
        console.warn('⚠️ Could not save device fingerprint:', error);
        return false;
    }
}

// ✅ قراءة بصمة الجهاز المحفوظة
function getSavedDeviceFingerprint() {
    try {
        const saved = localStorage.getItem('tanktools_device_fingerprint');
        if (saved) {
            const parsed = JSON.parse(saved);
            // التحقق من أن البيانات المحفوظة ليست قديمة جداً (30 يوم)
            const savedDate = new Date(parsed.savedAt);
            const now = new Date();
            const daysDiff = (now - savedDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > 30) {
                console.log('📅 Saved fingerprint is old, generating new one');
                localStorage.removeItem('tanktools_device_fingerprint');
                return null;
            }
            
            return parsed;
        }
        return null;
    } catch (error) {
        console.warn('⚠️ Error reading saved device fingerprint:', error);
        return null;
    }
}

// ✅ مقارنة بصمة الجهاز
async function compareDeviceFingerprint() {
    try {
        const current = await generateDeviceFingerprint();
        const saved = getSavedDeviceFingerprint();
        
        if (!saved) {
            console.log('📱 No saved fingerprint, saving current one');
            saveDeviceFingerprint(current);
            return { 
                match: true, 
                isNew: true, 
                fingerprint: current.fingerprint 
            };
        }
        
        const isMatch = saved.fingerprint === current.fingerprint;
        
        if (!isMatch) {
            console.log('🔄 Device fingerprint changed, updating');
            saveDeviceFingerprint(current);
        }
        
        return { 
            match: isMatch, 
            isNew: false, 
            fingerprint: current.fingerprint,
            previous: saved.fingerprint 
        };
        
    } catch (error) {
        console.error('❌ Error comparing device fingerprint:', error);
        return { 
            match: false, 
            isNew: false, 
            error: error.message 
        };
    }
}

// تصدير الدوال للاستخدام العام
window.generateDeviceFingerprint = generateDeviceFingerprint;
window.saveDeviceFingerprint = saveDeviceFingerprint;
window.getSavedDeviceFingerprint = getSavedDeviceFingerprint;
window.compareDeviceFingerprint = compareDeviceFingerprint;

console.log('✅ Simple Device Fingerprinting System ready!');