# 📱 Deploy Firebase Cloud Functions من Termux

## 🎯 **دليل كامل خطوة بخطوة**

---

## 📋 **المتطلبات:**

1. ✅ هاتف Android
2. ✅ Termux مثبت من F-Droid (مو من Google Play!)
3. ✅ اتصال إنترنت جيد

---

## 🚀 **الخطوات الكاملة:**

---

### **الخطوة 1: تثبيت Termux (إذا ما عندك)**

1. حمّل Termux من F-Droid:
   ```
   https://f-droid.org/packages/com.termux/
   ```

2. **مهم:** لا تحمّل من Google Play (نسخة قديمة!)

---

### **الخطوة 2: تحديث Termux**

افتح Termux واكتب:

```bash
pkg update && pkg upgrade -y
```

اضغط Enter وانتظر...

---

### **الخطوة 3: تثبيت الأدوات الأساسية**

```bash
pkg install git nodejs -y
```

انتظر حتى ينتهي التثبيت...

---

### **الخطوة 4: التحقق من التثبيت**

```bash
node --version
npm --version
git --version
```

يجب أن تشوف أرقام الإصدارات:
```
v22.x.x
10.x.x
2.x.x
```

---

### **الخطوة 5: تثبيت Firebase CLI**

```bash
npm install -g firebase-tools
```

⏳ **انتظر 3-5 دقائق...** (حجم كبير!)

---

### **الخطوة 6: التحقق من Firebase CLI**

```bash
firebase --version
```

يجب أن تشوف:
```
13.x.x
```

---

### **الخطوة 7: تسجيل الدخول لـ Firebase**

```bash
firebase login --no-localhost
```

**سيظهر لك:**
```
? Allow Firebase to collect CLI and Emulator Suite usage and error reporting information? (Y/n)
```

اكتب: `Y` واضغط Enter

**بعدها سيظهر:**
```
Visit this URL on this device to log in:
https://accounts.google.com/o/oauth2/auth?...

Waiting for authentication...
```

---

### **الخطوة 8: تسجيل الدخول**

1. **انسخ الرابط** (long press على الشاشة → Copy)

2. **افتح Chrome** والصق الرابط

3. **سجل دخول** بحساب Google اللي فيه Firebase project

4. **اضغط "Allow"**

5. **سيظهر:**
   ```
   ✔ Success! Logged in as your-email@gmail.com
   ```

6. **ارجع لـ Termux**

---

### **الخطوة 9: Clone المشروع**

```bash
cd ~
git clone https://github.com/fahadq8y/Test-tank-tools.git
```

---

### **الخطوة 10: الدخول للمشروع**

```bash
cd Test-tank-tools
```

---

### **الخطوة 11: التحقق من المشروع**

```bash
firebase projects:list
```

يجب أن تشوف:
```
┌──────────────────────┬──────────────────────┬────────────────┐
│ Project Display Name │ Project ID           │ Resource       │
├──────────────────────┼──────────────────────┼────────────────┤
│ Tank Tools KNPC      │ tank-tools-knpc-c2d95│ ...            │
└──────────────────────┴──────────────────────┴────────────────┘
```

---

### **الخطوة 12: تحديد المشروع**

```bash
firebase use tank-tools-knpc-c2d95
```

يجب أن تشوف:
```
Now using project tank-tools-knpc-c2d95
```

---

### **الخطوة 13: تثبيت Dependencies**

```bash
cd functions
npm install
```

⏳ **انتظر 2-3 دقائق...**

---

### **الخطوة 14: الرجوع للمجلد الرئيسي**

```bash
cd ..
```

---

### **الخطوة 15: Deploy Cloud Functions! 🚀**

```bash
firebase deploy --only functions
```

⏳ **انتظر 3-5 دقائق...**

**سيظهر:**
```
=== Deploying to 'tank-tools-knpc-c2d95'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing codebase default for deployment
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function checkAndSendNotifications(us-central1)...
i  functions: creating Node.js 18 function triggerNotificationCheck(us-central1)...
i  functions: creating Node.js 18 function sendTestNotification(us-central1)...
✔  functions[checkAndSendNotifications(us-central1)]: Successful create operation.
✔  functions[triggerNotificationCheck(us-central1)]: Successful create operation.
✔  functions[sendTestNotification(us-central1)]: Successful create operation.

✔  Deploy complete!
```

---

### **الخطوة 16: التحقق من Deploy**

```bash
firebase functions:list
```

يجب أن تشوف:
```
┌──────────────────────────────┬────────────┬────────────┐
│ Function                     │ Status     │ Region     │
├──────────────────────────────┼────────────┼────────────┤
│ checkAndSendNotifications    │ ACTIVE     │ us-central1│
│ triggerNotificationCheck     │ ACTIVE     │ us-central1│
│ sendTestNotification         │ ACTIVE     │ us-central1│
└──────────────────────────────┴────────────┴────────────┘
```

---

## 🎉 **تم Deploy بنجاح!**

---

## 🧪 **اختبار الإشعارات:**

### **1. افتح Firebase Console:**
```
https://console.firebase.google.com/project/tank-tools-knpc-c2d95/functions
```

### **2. شوف Logs:**
Firebase Console → Functions → Logs

يجب أن تشوف كل دقيقة:
```
🔍 Checking for notifications to send...
✅ No notifications to send
```

### **3. جرّب Test Notification:**
```
1. افتح: https://test-tank-tools.vercel.app/notifications-manager.html
2. اضغط "Send Test Notification" (1 minute)
3. انتظر دقيقة
4. ✅ يجب أن يصل إشعار!
```

---

## 🔧 **حل المشاكل:**

### **Problem 1: pkg: command not found**

Termux غير محدث، جرّب:
```bash
apt update && apt upgrade -y
```

---

### **Problem 2: firebase: command not found**

Firebase CLI لم يثبت بشكل صحيح:
```bash
npm install -g firebase-tools
```

---

### **Problem 3: Error: Not logged in**

```bash
firebase login --no-localhost
```

---

### **Problem 4: Permission denied**

```bash
termux-setup-storage
```

ثم اضغط "Allow" في الـ popup

---

### **Problem 5: Deploy failed - Billing account**

Firebase project يحتاج Blaze Plan (Pay as you go).

**لكن لا تقلق:**
- ✅ Free Tier كافي 100%
- ✅ ما راح تدفع شيء
- ✅ فقط يحتاج ربط بطاقة (للتحقق)

**الحل:**
1. روح Firebase Console
2. Upgrade to Blaze Plan
3. أضف بطاقة (ما راح يخصم شيء)
4. ارجع لـ Termux وجرّب Deploy مرة ثانية

---

### **Problem 6: Network error**

تأكد من اتصال الإنترنت وجرّب مرة ثانية:
```bash
firebase deploy --only functions
```

---

## 📊 **الأوامر المختصرة:**

```bash
# تحديث Termux
pkg update && pkg upgrade -y

# تثبيت الأدوات
pkg install git nodejs -y

# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login --no-localhost

# Clone المشروع
git clone https://github.com/fahadq8y/Test-tank-tools.git
cd Test-tank-tools

# Deploy
firebase use tank-tools-knpc-c2d95
cd functions && npm install && cd ..
firebase deploy --only functions
```

---

## 💡 **نصائح:**

1. ✅ **استخدم WiFi** (Deploy يستهلك data)
2. ✅ **شحن البطارية** (Deploy يأخذ وقت)
3. ✅ **لا تقفل Termux** أثناء Deploy
4. ✅ **إذا فشل Deploy**، جرّب مرة ثانية

---

## 🎯 **بعد Deploy:**

الإشعارات راح تشتغل أوتوماتيك:
- ✅ Test Notifications (1, 5, 10, 15, 30 minutes)
- ✅ Live Tanks Alerts
- ✅ System Notifications (Android/iOS)
- ✅ Background Notifications

---

## 📞 **إذا احتجت مساعدة:**

أرسل لي screenshot من:
1. Output من `firebase deploy --only functions`
2. Firebase Console → Functions → Logs

وأساعدك! 🚀

---

## 🎊 **الخلاصة:**

| **الخطوة** | **الأمر** | **الوقت** |
|-----------|----------|----------|
| 1. تحديث Termux | `pkg update && pkg upgrade -y` | 2-3 دقائق |
| 2. تثبيت الأدوات | `pkg install git nodejs -y` | 3-5 دقائق |
| 3. تثبيت Firebase CLI | `npm install -g firebase-tools` | 3-5 دقائق |
| 4. تسجيل الدخول | `firebase login --no-localhost` | 1-2 دقائق |
| 5. Clone المشروع | `git clone ...` | 1 دقيقة |
| 6. Deploy | `firebase deploy --only functions` | 3-5 دقائق |

**المجموع: 15-20 دقيقة** ⏱️

---

## 🚀 **ابدأ الآن!**

افتح Termux وابدأ من الخطوة 2! 🎉
