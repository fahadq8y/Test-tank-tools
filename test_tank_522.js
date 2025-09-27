console.log('🔍 Testing Tank 522 in PBCR Calculator...');

// Check browser console on the live page
const script = `
// First check if tankSpecsData is loaded
if (typeof tankSpecsData !== 'undefined' && tankSpecsData) {
  console.log('📊 Available tanks count:', Object.keys(tankSpecsData).length);
  
  // Check if Tank 522 exists
  if (tankSpecsData['522']) {
    console.log('✅ Tank 522 FOUND:', tankSpecsData['522']);
  } else {
    console.log('❌ Tank 522 NOT found in database');
    
    // Show first few tank IDs as sample
    const sampleTanks = Object.keys(tankSpecsData).slice(0, 10);
    console.log('📋 Sample tank IDs:', sampleTanks);
    
    // Check if we can add Tank 522 manually
    console.log('🔧 Attempting to add Tank 522 using built-in function...');
    if (typeof addMissingTanksToFirebase === 'function') {
      console.log('✅ addMissingTanksToFirebase function is available');
      console.log('💡 You can run: addMissingTanksToFirebase()');
    } else {
      console.log('❌ addMissingTanksToFirebase function not available');
    }
  }
} else {
  console.log('❌ tankSpecsData not loaded yet');
}

// Test the loadTank function with Tank 522
console.log('\\n🧪 Testing loadTank function with Tank 522...');
document.getElementById('tankInput').value = '522';
if (typeof loadTank === 'function') {
  loadTank();
  console.log('✅ loadTank() executed for Tank 522');
} else {
  console.log('❌ loadTank function not available');
}
`;

console.log('Copy and paste this in browser console:');
console.log('=====================================');
console.log(script);
console.log('=====================================');
