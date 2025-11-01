# 🚀 FCM Push Notifications Deployment Guide

## ✅ **ما تم إنجازه:**

تم إضافة نظام إشعارات FCM كامل يتضمن:

### **1. Service Worker**
- ✅ `firebase-messaging-sw.js` - معالجة الإشعارات في الخلفية

### **2. Frontend Integration**
- ✅ Firebase Messaging SDK في `notifications-manager.html`
- ✅ طلب إذن الإشعارات تلقائياً
- ✅ حفظ FCM Token في Firebase
- ✅ معالجة الإشعارات في Foreground

### **3. Cloud Functions**
- ✅ `functions/index.js` - دوال السحابة
- ✅ `checkAndSendNotifications` - تفحص كل دقيقة
- ✅ `sendTestNotification` - إرسال تنبيه تجريبي
- ✅ `triggerNotificationCheck` - تشغيل يدوي

---

## 📋 **خطوات النشر:**

### **الخطوة 1: تثبيت Firebase CLI**

```bash
npm install -g firebase-tools
```

### **الخطوة 2: تسجيل الدخول**

```bash
firebase login
```

### **الخطوة 3: تهيئة المشروع**

```bash
cd /path/to/Test-tank-tools
firebase use tank-tools-knpc-c2d95
```

### **الخطوة 4: تثبيت Dependencies**

```bash
cd functions
npm install
cd ..
```

### **الخطوة 5: نشر Cloud Functions**

```bash
firebase deploy --only functions
```

**أو لنشر دالة واحدة:**
```bash
firebase deploy --only functions:checkAndSendNotifications
```

---

## 🧪 **الاختبار:**

### **1. اختبار إرسال تنبيه تجريبي:**

افتح المتصفح واذهب إلى:
```
https://us-central1-tank-tools-knpc-c2d95.cloudfunctions.net/sendTestNotification?userId=fam030
```

**استبدل `fam030` بـ username الفعلي**

### **2. اختبار الجدولة اليدوية:**

```
https://us-central1-tank-tools-knpc-c2d95.cloudfunctions.net/triggerNotificationCheck
```

### **3. اختبار على الهاتف:**

1. افتح الموقع على الهاتف
2. سجل دخول
3. اذهب لـ **Notifications Manager**
4. اقبل إذن الإشعارات
5. أضف تنبيه من **Live Tanks**
6. انتظر الوقت المحدد
7. يجب أن يصل الإشعار! 🔔

---

## 🔑 **متطلبات مهمة:**

### **1. Firebase Admin SDK Key**

الملف `tank-tools-knpc-c2d95-firebase-adminsdk-fbsvc-42eaad1453.json` يجب أن يكون في مجلد `functions`:

```bash
cp tank-tools-knpc-c2d95-firebase-adminsdk-fbsvc-42eaad1453.json functions/
```

### **2. تحديث .gitignore**

أضف للـ `.gitignore`:
```
functions/node_modules/
functions/*.json
*.log
```

---

## 📊 **كيف يعمل النظام:**

### **التدفق الكامل:**

```
1. المستخدم يضيف تنبيه في Live Tanks
         ↓
2. يحفظ في Firebase (notificationsManager collection)
         ↓
3. Cloud Function تفحص كل دقيقة
         ↓
4. عند حلول الوقت:
   - تجلب FCM Token من users collection
   - ترسل إشعار FCM
   - تحدث حالة التنبيه (sent = true)
         ↓
5. الإشعار يصل للهاتف 🔔
         ↓
6. المستخدم يضغط على الإشعار
         ↓
7. يفتح Live Tanks أو Notifications Manager
```

---

## 🗄️ **Firebase Collections:**

### **1. notificationsManager**

```javascript
{
  userId: "fam030",
  tankId: "abc123",
  tankNumber: "221",
  department: "PBCR",
  product: "Diesel",
  finishDateTime: Timestamp,
  alertTime: 30, // minutes
  sound: "sound1",
  vibrate: true,
  enabled: true,
  sent: false, // يتغير لـ true بعد الإرسال
  sentAt: Timestamp, // وقت الإرسال
  createdAt: Timestamp
}
```

### **2. users**

```javascript
{
  username: "fam030",
  fullName: "Fahad",
  role: "admin",
  fcmToken: "eXyz123...", // FCM Token
  fcmTokenUpdatedAt: Timestamp
}
```

---

## ⚙️ **إعدادات Cloud Function:**

### **التوقيت:**
- تعمل كل **دقيقة واحدة**
- المنطقة الزمنية: **Asia/Kuwait (GMT+3)**

### **الشروط:**
- `enabled = true`
- `sent = false`
- `currentTime >= (finishTime - alertTime)`

---

## 🐛 **استكشاف الأخطاء:**

### **1. الإشعارات لا تصل:**

✅ تحقق من:
- FCM Token محفوظ في Firebase
- Cloud Function تعمل (تحقق من Logs)
- إذن الإشعارات مفعّل
- Service Worker مسجل

### **2. Cloud Function لا تعمل:**

```bash
# عرض Logs
firebase functions:log

# تشغيل محلي
firebase emulators:start --only functions
```

### **3. FCM Token فارغ:**

- تأكد من أن المستخدم فتح Notifications Manager
- تأكد من قبول إذن الإشعارات
- تحقق من Console في المتصفح

---

## 💰 **التكلفة:**

### **Firebase Cloud Functions:**
- **المجاني:** 2 مليون استدعاء/شهر
- **بعد المجاني:** $0.40 لكل مليون استدعاء

### **FCM:**
- **مجاني بالكامل!** 🎉
- لا حدود على عدد الإشعارات

### **التقدير لهذا المشروع:**
- **مجاني 100%** (ضمن الحد المجاني)

---

## 📞 **الدعم:**

**المطور:**
- الاسم: Fahad - 17877
- WhatsApp: +965 55222550

---

## 🎯 **الخلاصة:**

✅ **النظام جاهز للنشر!**

بعد نشر Cloud Functions، النظام سيعمل تلقائياً:
1. المستخدم يضيف تنبيه
2. Cloud Function ترسل الإشعار في الوقت المحدد
3. الإشعار يصل للهاتف
4. المستخدم يفتح التطبيق

**كل شيء تلقائي! 🚀**

---

**Last Updated:** November 2025  
**Version:** v5.2 - FCM Push Notifications
