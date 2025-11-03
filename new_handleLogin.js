// NEW CLEAN handleLogin function for v6.3

async function handleLogin(e) {
  e.preventDefault();
  showLoading("loginBtn", "loginLoading", true);
  
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    showMessage('❌ Please enter username and password', 'error');
    showLoading("loginBtn", "loginLoading", false);
    return;
  }
  
  try {
    // Step 1: Generate device fingerprint
    console.log('🔍 Generating device fingerprint...');
    showMessage('🔍 Checking device security...', 'info');
    
    const deviceInfo = await generateDeviceFingerprint();
    const deviceId = deviceInfo.fingerprint;
    console.log('📱 Device ID:', deviceId);
    console.log('📱 Device Type:', deviceInfo.readableInfo.deviceType);
    
    // Step 2: Check device authorization for this user
    let deviceAllowed;
    try {
      deviceAllowed = await checkDeviceAuthorization(username, deviceId, deviceInfo);
    } catch (authError) {
      console.error('❌ Device authorization check failed:', authError);
      showMessage('❌ Unable to verify device. Please check your internet connection and try again.', 'error');
      showLoading("loginBtn", "loginLoading", false);
      return;
    }
    
    if (!deviceAllowed.allowed) {
      showMessage(`🚫 ${deviceAllowed.message}`, 'error');
      showLoading("loginBtn", "loginLoading", false);
      
      // Log unauthorized device access attempt
      try {
        await addDoc(collection(db, 'activities'), {
          action: `Unauthorized device access attempt: ${username} from device ${deviceId.slice(0, 20)}...`,
          username: username,
          timestamp: serverTimestamp(),
          ip: await getUserIP(),
          userAgent: navigator.userAgent.substring(0, 100),
          page: 'login',
          deviceInfo: deviceInfo.readableInfo
        });
      } catch (logError) {
        console.error('Error logging unauthorized attempt:', logError);
      }
      
      return;
    }
    
    if (deviceAllowed.isNewDevice) {
      showMessage('📱 New device registered successfully!', 'success');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      showMessage('✅ Device recognized. Welcome back!', 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    showMessage('🔐 Device authorized. Logging in...', 'success');
    
  } catch (deviceError) {
    console.error('❌ Device fingerprint error:', deviceError);
    
    // For admin account, allow complete bypass
    if (username === 'fam030') {
      console.log('⚠️ Admin access: Bypassing device check completely');
      showMessage('🔓 Admin access: Device security bypassed', 'warning');
      await new Promise(resolve => setTimeout(resolve, 500));
      // Continue with login process for admin
    } else {
      // For regular users, require device check
      showMessage('❌ Device security check failed. Please try again or contact admin.', 'error');
      showLoading("loginBtn", "loginLoading", false);
      return; // Stop login process
    }
  }
  
  try {
    // 🔄 GRADUAL MIGRATION SYSTEM
    console.log('🔄 [Migration] Step 1: Checking Firestore...');
    const email = `${username}@knpc.com`;
    let firebaseAuthUser = null;
    let isNewMigration = false;
    
    // Step 1: Check if user exists in Firestore
    const userDocRef = doc(db, 'users', username);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // User doesn't exist in Firestore
      showMessage('❌ User not found. Please register first.', 'error');
      showLoading("loginBtn", "loginLoading", false);
      return;
    }
    
    // User exists in Firestore
    const userData = userDoc.data();
    console.log('✅ [Migration] User found in Firestore:', username);
    
    // Verify password against Firestore
    if (userData.password !== password) {
      showMessage('❌ Invalid password', 'error');
      await addActivity('failed_login_attempt', username);
      showLoading("loginBtn", "loginLoading", false);
      return;
    }
    
    // Check if user is active
    if (!userData.isActive) {
      showMessage('⏳ Your account is pending admin approval. Please wait for activation.', 'warning');
      showLoading("loginBtn", "loginLoading", false);
      return;
    }
    
    // Step 2: Try to sign in with Firebase Auth
    console.log('🔄 [Migration] Step 2: Attempting Firebase Auth sign-in...');
    try {
      const authResult = await signInWithEmailAndPassword(auth, email, password);
      firebaseAuthUser = authResult.user;
      console.log('✅ [Migration] User already migrated to Firebase Auth:', firebaseAuthUser.uid);
    } catch (authError) {
      console.log('⚠️ [Migration] User not in Firebase Auth yet:', authError.code);
      
      // Handle too-many-requests error
      if (authError.code === 'auth/too-many-requests') {
        console.error('❌ [Migration] Too many requests:', authError);
        showMessage('⏳ تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار 5-10 دقائق ثم المحاولة مرة أخرى.', 'error');
        showLoading("loginBtn", "loginLoading", false);
        return;
      }
      
      // User doesn't exist in Firebase Auth - MIGRATE!
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
        console.log('🔄 [Migration] Step 3: Migrating user to Firebase Auth...');
        showMessage('🔄 Migrating your account to new authentication system...', 'info');
        
        try {
          // Create Firebase Auth account
          const createResult = await createUserWithEmailAndPassword(auth, email, password);
          firebaseAuthUser = createResult.user;
          console.log('✅ [Migration] Firebase Auth account created:', firebaseAuthUser.uid);
          
          // Update Firestore document with uid and migration flag
          await updateDoc(userDocRef, {
            uid: firebaseAuthUser.uid,
            migratedToAuth: true,
            migrationDate: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
          
          isNewMigration = true;
          showMessage('✅ Account migrated successfully!', 'success');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Log migration activity
          await addActivity('user_migrated_to_auth', username);
          
        } catch (createError) {
          console.error('❌ [Migration] Failed to create Firebase Auth account:', createError);
          
          // Handle too-many-requests error
          if (createError.code === 'auth/too-many-requests') {
            showMessage('⏳ تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار 5-10 دقائق ثم المحاولة مرة أخرى.', 'error');
            showLoading("loginBtn", "loginLoading", false);
            return;
          }
          
          // If email already exists (user was migrated before)
          if (createError.code === 'auth/email-already-in-use') {
            console.log('⚠️ [Migration] Email already exists, trying to sign in...');
            try {
              const signInResult = await signInWithEmailAndPassword(auth, email, password);
              firebaseAuthUser = signInResult.user;
              console.log('✅ [Migration] Signed in with existing Firebase Auth account');
              
              // Update Firestore with uid if not already set
              if (!userData.uid) {
                await updateDoc(userDocRef, {
                  uid: firebaseAuthUser.uid,
                  migratedToAuth: true,
                  migrationDate: serverTimestamp(),
                  lastLogin: serverTimestamp()
                });
              }
            } catch (signInError) {
              console.error('❌ [Migration] Sign in after email-exists error failed:', signInError);
              showMessage('❌ Migration failed. Please contact admin.', 'error');
              showLoading("loginBtn", "loginLoading", false);
              return;
            }
          } else {
            showMessage('❌ Migration failed. Please contact admin.', 'error');
            showLoading("loginBtn", "loginLoading", false);
            return;
          }
        }
      } else {
        // Other auth errors
        console.error('❌ [Migration] Unexpected auth error:', authError);
        showMessage('❌ Authentication error. Please try again.', 'error');
        showLoading("loginBtn", "loginLoading", false);
        return;
      }
    }
    
    // Step 3: Load user data from Firestore (refresh to get latest)
    const latestUserDoc = await getDoc(userDocRef);
    if (!latestUserDoc.exists()) {
      showMessage('❌ User data not found', 'error');
      showLoading("loginBtn", "loginLoading", false);
      return;
    }
    
    const latestUserData = latestUserDoc.data();
    
    // Update last login
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp()
    });
    
    // Save session data
    const sessionData = {
      username: username,
      fullName: latestUserData.fullName || username,
      role: latestUserData.role || 'user',
      email: email,
      uid: firebaseAuthUser.uid,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    sessionStorage.setItem('isLoggedIn', 'true');
    
    // Log successful login
    await addActivity('login_success', username);
    
    // Show success message
    if (isNewMigration) {
      showMessage('🎉 Migration successful! Redirecting...', 'success');
    } else {
      showMessage('✅ Login successful! Redirecting...', 'success');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect based on role
    if (latestUserData.role === 'admin') {
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'user-dashboard.html';
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    showMessage('❌ Login failed. Please try again.', 'error');
    showLoading("loginBtn", "loginLoading", false);
    
    try {
      await addActivity('login_error', username);
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }
  }
}
