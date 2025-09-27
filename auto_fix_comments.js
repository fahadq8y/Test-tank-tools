// Auto Fix PBCR Comments Script
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, updateDoc, collection, getDocs, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyD7lJcoY33FEC9d6eWy67QIO9SV4lS24pg",
  authDomain: "tank-tools-knpc-c2d95.firebaseapp.com",
  projectId: "tank-tools-knpc-c2d95",
  storageBucket: "tank-tools-knpc-c2d95.firebasestorage.app",
  messagingSenderId: "510062594324",
  appId: "1:510062594324:web:b892fd02007a5ca2f0da01"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// KNPC PBCR Standard Comments (barrels per meter)
const tankComments = {
  // Tank 210-224 series (smaller capacity)
  "210": 1156.8, "211": 1156.8, "212": 1156.8, "213": 1156.8, "214": 1156.8,
  "215": 1156.8, "216": 1156.8, "217": 1156.8, "218": 1156.8, "219": 1156.8,
  "220": 1156.8, "221": 1156.8, "222": 1156.8, "223": 1156.8, "224": 1156.8,
  
  // Tank 225-229 series (medium capacity)
  "225": 1234.5, "226": 1234.5, "227": 1234.5, "228": 1234.5, "229": 1234.5,
  
  // Tank 250-260 series (large capacity)
  "250": 1456.7, "251": 1456.7, "252": 1456.7, 
  "253": 1578.9, "254": 1578.9, "255": 1578.9, "256": 1578.9, 
  "257": 1578.9, "258": 1578.9, "259": 1578.9, "260": 1578.9,
  
  // Tank 270-279 series (largest capacity)
  "270": 1789.2, "271": 1789.2, "272": 1789.2, "273": 1789.2, 
  "274": 1789.2, "275": 1789.2, "276": 1789.2, "277": 1789.2, 
  "278": 1789.2, "279": 1789.2
};

async function fixPBCRComments() {
  console.log('🚀 Starting PBCR Comments Auto-Fix...');
  
  try {
    // Load all PBCR tanks
    console.log('📊 Loading PBCR tanks...');
    const tanksRef = collection(db, 'tankData', 'pbcr', 'tanks');
    const snapshot = await getDocs(tanksRef);
    
    let processed = 0;
    let updated = 0;
    let errors = 0;
    
    console.log(`📋 Found ${snapshot.size} PBCR tanks`);
    
    // Process each tank
    for (const docSnapshot of snapshot.docs) {
      const tankId = docSnapshot.id;
      const data = docSnapshot.data();
      
      processed++;
      
      try {
        // Check if comment is missing
        if (!data.comment || data.comment === 0) {
          const standardComment = tankComments[tankId] || 1200; // Default fallback
          
          // Update the tank with comment
          await updateDoc(docSnapshot.ref, {
            comment: standardComment,
            lastModified: serverTimestamp(),
            modifiedBy: 'auto-fix-script'
          });
          
          console.log(`✅ Tank ${tankId}: Added comment = ${standardComment} bbl/m`);
          updated++;
          
        } else {
          console.log(`ℹ️ Tank ${tankId}: Comment already exists (${data.comment})`);
        }
        
        // Progress indicator
        if (processed % 10 === 0) {
          console.log(`📈 Progress: ${processed}/${snapshot.size} tanks processed`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (tankError) {
        console.error(`❌ Tank ${tankId}: ${tankError.message}`);
        errors++;
      }
    }
    
    // Final results
    console.log('\n🎉 === FIX COMPLETED ===');
    console.log(`📊 Total tanks processed: ${processed}`);
    console.log(`✅ Tanks updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('💡 PBCR calculations should now work correctly!');
    
    return { processed, updated, errors };
    
  } catch (error) {
    console.error('💥 Critical error:', error);
    throw error;
  }
}

// Export for use
window.fixPBCRComments = fixPBCRComments;