<script>
let currentUser = null, c = 0, m = 0, x = 0, calcData = null;
let tankSpecsData = {};

const products={
  "PBCR":["LSFO","EGO 10PPM","EGO 500PPM","RHN","PCNA","NMOGAS","OLMOGAS","ATK","ARDR","IC5","ISOM","SLOP","OTHER"],
  "WASHERY":["MOGAS 98","MOGAS 95","MOGAS 91","GO","KERO","ATK","Slop","OTHER"],
  "PLCR":["NAPHA","PCNA","HSD-EGO","EGO","F.OIL","MOGAS","VGO","KKERO","ARDR","METHANOL","OTHER"]
};

async function fetchTankSpecifications() {
    const departments = ['pbcr', 'plcr', 'washery'];
    let allTanks = {};
    
    console.log('🔄 Loading tank specifications from Firebase...');
    
    // Check if Firebase is ready
    if (!window.db || !window.collection || !window.getDocs) {
        console.error('❌ Firebase not initialized yet');
        throw new Error('Firebase not ready - please refresh the page');
    }
    try {
        for (const dept of departments) {
            console.log(`📊 Loading ${dept.toUpperCase()} tanks...`);
            const tanksCollectionRef = collection(window.db, "tankData", dept, "tanks");
            const querySnapshot = await getDocs(tanksCollectionRef);
            let deptCount = 0;
            querySnapshot.forEach((doc) => { 
                allTanks[doc.id] = doc.data(); 
                deptCount++;
            });
            console.log(`✅ Loaded ${deptCount} tanks from ${dept.toUpperCase()}`);
        }
        if (Object.keys(allTanks).length === 0) { throw new Error("No tank specifications found."); }
        tankSpecsData = allTanks;
        console.log(`🎯 Successfully loaded ${Object.keys(allTanks).length} total tanks from Firebase!`);
        console.log('📋 Sample tank data:', Object.keys(allTanks).slice(0, 3).map(id => ({ id, data: allTanks[id] })));
        document.getElementById('loadingOverlay').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    } catch (error) {
        console.error("❌ Critical error fetching tank specifications:", error);
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.innerHTML = `
                <div style="color:red; text-align: center; padding: 20px;">
                    <h3>❌ Failed to Load Tank Data</h3>
                    <p>Unable to connect to Firebase database.</p>
                    <p style="font-size: 14px; margin-top: 15px;">Error: ${error.message}</p>
                    <button onclick="location.reload()" style="
                        background: linear-gradient(45deg, #4CAF50, #45a049);
                        color: white; border: none; padding: 12px 24px;
                        border-radius: 8px; cursor: pointer; margin-top: 15px;
                        font-size: 16px; font-weight: bold;
                    ">🔄 Retry</button>
                    <br><br>
                    <small style="opacity: 0.8;">If this problem persists, contact Fahad - 17877</small>
                </div>
            `;
        }
    }
}


window.loadTank = () => {
  const id = document.getElementById("tankInput").value.trim();
  if (tankSpecsData[id]) {
    c = tankSpecsData[id].comment;
    m = tankSpecsData[id].min;
    x = tankSpecsData[id].max;
  } else { c = m = x = 0; }
  calculate();
};

// --- بداية التعديل المهم ---
async function checkLogin() {
    console.log('🔄 Starting checkLogin process...');
    
    // Check page access first
    const hasAccess = await window.checkPageAccess();
    
    if (hasAccess) {
        console.log('✅ Access granted to PBCR Calculator');
        
        // Get user data if authenticated
        currentUser = await window.getCurrentUser();
        if (currentUser) {
            console.log('✅ User authenticated:', currentUser.username);
            loadUser();
        } else {
            console.log('✅ Public access granted for PBCR Calculator');
        }
        
        // Load basic app functions
        loadData();
        setupDark();
        
        // Load tank specifications with proper error handling
        console.log('🔄 Starting tank data loading from Firebase...');
        console.log('Firebase state check:', {
            db: !!window.db,
            collection: !!window.collection,
            getDocs: !!window.getDocs
        });
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Loading timeout - Firebase took too long')), 15000)
        );
        
        try {
            // Wait for tank data to load completely
            await Promise.race([fetchTankSpecifications(), timeoutPromise]);
            console.log('✅ Tank data loaded successfully, PBCR ready to use!');
        } catch (error) {
            console.error('❌ Failed to load tank specifications:', error);
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.innerHTML = `
                    <div style="color:red; text-align: center; padding: 20px;">
                        <h3>❌ Failed to Load Tank Data</h3>
                        <p>${error.message}</p>
                        <p style="font-size: 14px;">This usually means a slow internet connection or Firebase issue.</p>
                        <button onclick="location.reload()" style="
                            background: linear-gradient(45deg, #4CAF50, #45a049);
                            color: white; border: none; padding: 12px 24px;
                            border-radius: 8px; cursor: pointer; margin-top: 15px;
                            font-size: 16px; font-weight: bold;
                        ">🔄 Try Again</button>
                        <br><br>
                        <small style="opacity: 0.8;">Contact Fahad - 17877 if this persists</small>
                    </div>
                `;
            }
        }
    } else {
        console.log('❌ Access denied to PBCR Calculator');
        // Access denied - checkPageAccess handles showing denial UI
        // Hide loading overlay since we're not loading anything
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}
// نستدعي checkLogin عند تحميل الصفحة
window.addEventListener('load', () => {
    console.log('🏁 Window loaded, starting checkLogin process...');
    setTimeout(checkLogin, 100);
});
// --- نهاية التعديل المهم ---


function loadUser(){if(!currentUser)return;document.getElementById('userName').textContent=currentUser.username;document.getElementById('userAvatar').textContent=(currentUser.fullName||currentUser.username).charAt(0).toUpperCase();if(currentUser.username==='fam030'||currentUser.role==='admin')document.getElementById('adminLink').style.display='inline-block';
  // checkLiveTanksAccess is now handled by permissions.js
}

window.calculate = () => {
  const level = parseFloat(document.getElementById("level").value || 0);
  const target = parseFloat(document.getElementById("target").value || 0);
  const flowRaw = parseFloat(document.getElementById("flowrate").value || 0);
  const unit = document.getElementById("flowUnit").value;
  const mode = document.getElementById("mode").value;
  
  const available = document.getElementById("availablePumpable");
  const ullageDiv = document.getElementById("currentUllage");
  const levelEst = document.getElementById("levelEstimate");
  const valueDiff = document.getElementById("valueDiff");
  const output = document.getElementById("output");
  const calendar = document.getElementById("calendarLink");
  
  calcData = null;
  document.getElementById('add-to-live-tanks-btn').style.display = 'none';
  
  if (!c || isNaN(level)) {
    available.innerText = ullageDiv.innerText = valueDiff.innerText = levelEst.innerText = output.innerHTML = "";
    return;
  }
  
  const availablePumpable = (level - m) * c;
  const currentUllage = (x - level) * c;
  available.innerText = `Available Pumpable: ${availablePumpable.toFixed(2)} bbl`;
  ullageDiv.innerText = `Current Ullage: ${currentUllage.toFixed(2)} bbl`;
  
  if (!isNaN(target)) {
    let estLevel = 0;
    if (mode === "pumpable") estLevel = (target / c) + m;
    else if (mode === "ullage") estLevel = x - (target / c);
    else if (mode === "level") estLevel = target;
    
    const levelDiff = estLevel - level;
    let estText = `Level Estimate: ${estLevel.toFixed(2)} m\nLevel Difference: ${levelDiff.toFixed(2)} m`;
    
    if (estLevel >= x - 0.5 || estLevel < m) {
      levelEst.style.color = "#ff5555";
      estText += `\nHigh Level = ${x.toFixed(2)} m`;
    } else {
      levelEst.style.color = "#00ffff";
    }
    levelEst.innerText = estText;
    
    let diff = 0;
    if (mode === "pumpable") {
      diff = target - availablePumpable;
      valueDiff.innerText = `Difference: ${diff.toLocaleString()} bbl`;
    } else if (mode === "ullage") {
      diff = currentUllage - target;
      valueDiff.innerText = `To leave ${target.toLocaleString()} bbl ullage, fill: ${diff.toLocaleString()} bbl`;
    } else if (mode === "level") {
      const meters = level - target;
      diff = meters * c;
      valueDiff.innerText = `Level Difference: ${Math.abs(meters).toFixed(2)} m`;
    }
    
    const flow = unit === "m3" ? flowRaw * 6.28 : unit === "mtr" ? flowRaw : flowRaw;
    let time = 0;
    
    if (unit === "mtr") {
      time = Math.abs(diff) / (flow * c);
    } else {
      time = Math.abs(diff) / flow;
    }
    
    const hrs = Math.floor(time);
    const mins = Math.round((time - hrs) * 60);
    
    if (!isNaN(time) && flow > 0) {
      const now = new Date();
      const finishTime = new Date(now.getTime() + time * 60 * 60 * 1000);
      
      const ft = finishTime.toLocaleTimeString('en-GB', {hour12: false}).substring(0, 5);
      const fd = finishTime.toLocaleDateString('en-CA');
      
      output.innerHTML = `<strong>Time: ${hrs}h ${mins}m</strong><br>Finish at: ${ft} - ${fd}`;
      calendar.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tank%20${encodeURIComponent(document.getElementById("tankInput").value)}%20Finish&dates=${finishTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${finishTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Tank%20Number:%20${encodeURIComponent(document.getElementById("tankInput").value)}%0ATarget%20Value:%20${encodeURIComponent(target)}%20${encodeURIComponent(mode)}%0AFlow%20Rate:%20${encodeURIComponent(flowRaw)}%20${encodeURIComponent(unit)}`;
      
      calcData = {
        tankNumber: document.getElementById("tankInput").value,
        finishTime: ft,
        finishDate: fd
      };
      
      // Show "Add to Live Tanks" button if user has permission
      if (currentUser) {
        window.checkAddToLiveTanksPermission().then(hasPermission => {
          if (hasPermission) {
            document.getElementById('add-to-live-tanks-btn').style.display = 'inline-flex';
            document.getElementById('add-to-live-tanks-help').style.display = 'inline-flex';
          }
        });
      }
      
      // checkAddToLiveTanksPermission is now handled by permissions.js
      if (currentUser && document.getElementById("tankInput").value) {
        logPBCRCalculation(document.getElementById("tankInput").value, hrs, mins, ft, fd);
      }
    }
  }
};

function isSameShift(now,finish){const getShift=h=>{const m=h.getHours()*60+h.getMinutes();return m>=360&&m<840?"morning":m>=840&&m<1320?"evening":"night"};const currentShift=getShift(now),finishShift=getShift(finish);if(currentShift!==finishShift)return false;if(currentShift==="night"){const nowHour=now.getHours(),finishHour=finish.getHours();if(nowHour>=0&&nowHour<6){if(finishHour>=0&&finishHour<6)return Math.floor((finish.getTime()-now.getTime())/(24*60*60*1000))<=1;else if(finishHour>=22)return Math.floor((finish.getTime()-now.getTime())/(24*60*60*1000))===0}else if(nowHour>=22){if(finishHour>=22)return now.toDateString()===finish.toDateString();else if(finishHour>=0&&finishHour<6)return Math.floor((finish.getTime()-now.getTime())/(24*60*60*1000))===1}return false}return now.toDateString()===finish.toDateString()}
window.addToTable=()=>{if(!calcData||!calcData.tankNumber){alert("Please calculate a tank first!");return}const table=document.getElementById("tankTable").getElementsByTagName("tbody")[0],row=table.insertRow();const now=new Date();const finishDateTime=new Date(`${calcData.finishDate} ${calcData.finishTime}`);const sameShift=isSameShift(now,finishDateTime);row.className=sameShift?'same-shift':'next-shift';row.innerHTML=`<td>${calcData.tankNumber}</td><td>${calcData.finishDate}</td><td>${calcData.finishTime}</td><td><button class="delete-btn" onclick="this.parentNode.parentNode.remove();saveData()">Delete</button></td>`;saveData()};
function saveData(){const table=document.getElementById("tankTable").getElementsByTagName("tbody")[0],data=[];for(let i=0;i<table.rows.length;i++){const row=table.rows[i];data.push({tank:row.cells[0].innerText,date:row.cells[1].innerText,time:row.cells[2].innerText})}localStorage.setItem("tankData",JSON.stringify(data))}
function loadData(){const data=JSON.parse(localStorage.getItem("tankData")||"[]"),table=document.getElementById("tankTable").getElementsByTagName("tbody")[0];data.forEach(item=>{const row=table.insertRow();const now=new Date();const finishDateTime=new Date(`${item.date} ${item.time}`);const sameShift=isSameShift(now,finishDateTime);row.className=sameShift?'same-shift':'next-shift';row.innerHTML=`<td>${item.tank}</td><td>${item.date}</td><td>${item.time}</td><td><button class="delete-btn" onclick="this.parentNode.parentNode.remove();saveData()">Delete</button></td>`})}
function setupDark(){const btn=document.getElementById("darkModeButton");btn.addEventListener("click",()=>{document.body.style.filter=document.body.style.filter?"":"invert(1) hue-rotate(180deg)";btn.textContent=document.body.style.filter?"☀️":"🌙"})}
window.openLTModal=function(){if(!calcData||!calcData.tankNumber){alert("Please calculate a tank first!");return}
document.getElementById('ltTank').value=calcData.tankNumber;document.getElementById('ltTargetValue').value=document.getElementById('target').value;document.getElementById('ltTargetType').value=document.getElementById('mode').value;document.getElementById('ltRate').value=document.getElementById('flowrate').value;document.getElementById('ltRateUnit').value=document.getElementById('flowUnit').value;document.getElementById('ltDate').value=calcData.finishDate;document.getElementById('ltTime').value=calcData.finishTime;document.getElementById('ltModal').classList.add('show');}
window.closeLTModal=function(){document.getElementById('ltModal').classList.remove('show');document.getElementById('ltForm').reset();document.getElementById('otherProductField').classList.remove('show');}
window.updateLTProducts=function(){const dept=document.getElementById('ltDept').value;const productSelect=document.getElementById('ltProduct');productSelect.innerHTML='<option value="">Select Product</option>';if(dept&&products[dept]){products[dept].forEach(product=>{const option=document.createElement('option');option.value=product;option.textContent=product;productSelect.appendChild(option);});}
document.getElementById('otherProductField').classList.remove('show');}
window.checkOtherProduct=function(){const productSelect=document.getElementById('ltProduct');const otherField=document.getElementById('otherProductField');const otherInput=document.getElementById('otherProductInput');if(productSelect.value==='OTHER'){otherField.classList.add('show');otherInput.required=true;}else{otherField.classList.remove('show');otherInput.required=false;otherInput.value='';}}
document.getElementById('ltForm').addEventListener('submit',async function(e){e.preventDefault();const dept=document.getElementById('ltDept').value;const tankNumber=document.getElementById('ltTank').value;const productSelect=document.getElementById('ltProduct').value;const otherProduct=document.getElementById('otherProductInput').value;const product=productSelect==='OTHER'?otherProduct:productSelect;const targetValue=document.getElementById('ltTargetValue').value;const targetType=document.getElementById('ltTargetType').value;const rate=document.getElementById('ltRate').value;const rateUnit=document.getElementById('ltRateUnit').value;const finishDate=document.getElementById('ltDate').value;const finishTime=document.getElementById('ltTime').value;const notes=document.getElementById('ltNotes').value;if(!product){alert('Please select or specify a product.');return;}
try{const finishDateTime=new Date(finishDate+' '+finishTime);const tankData={department:dept,tankNumber:tankNumber,product:product,currentLevel:parseFloat(document.getElementById('level').value)||null,targetType:targetType,targetValue:parseFloat(targetValue),rate:parseFloat(rate),rateUnit:rateUnit,finishDate:finishDate,finishTime:finishTime,finishDateTime:finishDateTime,notes:notes,addedBy:currentUser.username,userName:currentUser.fullName||currentUser.username,addedAt:serverTimestamp(),lastModified:serverTimestamp(),modifiedBy:currentUser.username,status:'active',source:'PBCR_Calculator'};await addDoc(collection(db,'liveTanks'),tankData);alert('✅ Tank added to Live Tanks successfully!');closeLTModal();}catch(error){console.error('Error adding to Live Tanks:',error);alert('❌ Error adding to Live Tanks: '+error.message);}});
let currentFontSize=parseInt(localStorage.getItem('tanktools_font_size_index')||'16');
function increaseFontSize(){if(currentFontSize<24){currentFontSize+=2;applyFontSize();localStorage.setItem('tanktools_font_size_index',currentFontSize);showFontMessage(`📈 Font size increased to ${currentFontSize}px`);}}
function decreaseFontSize(){if(currentFontSize>12){currentFontSize-=2;applyFontSize();localStorage.setItem('tanktools_font_size_index',currentFontSize);showFontMessage(`📉 Font size decreased to ${currentFontSize}px`);}}
function applyFontSize(){const style=document.createElement('style');style.id='dynamic-font-style';const existingStyle=document.getElementById('dynamic-font-style');if(existingStyle){existingStyle.remove();}
style.textContent=`
    input, select { font-size: ${currentFontSize}px !important; }
    .result { font-size: ${currentFontSize}px !important; }
    #tankTable { font-size: ${currentFontSize - 2}px !important; }
    #tankTable th { font-size: ${currentFontSize - 1}px !important; }
    h2 { font-size: ${currentFontSize + 8}px !important; }
    .reminder-btn, .add-btn, .live-tanks-btn { font-size: ${currentFontSize - 2}px !important; }
  `;document.head.appendChild(style);}
function showFontMessage(message){const msgDiv=document.createElement('div');msgDiv.style.cssText='position:fixed;top:80px;right:20px;background:rgba(76,175,80,0.9);color:white;padding:10px 15px;border-radius:8px;font-size:12px;z-index:1000;animation:slideIn 0.3s ease';msgDiv.textContent=message;document.body.appendChild(msgDiv);setTimeout(()=>msgDiv.remove(),3000);}
applyFontSize();
window.increaseFontSize=increaseFontSize;window.decreaseFontSize=decreaseFontSize;
function showCalendarHelp(){const userAgent=navigator.userAgent.toLowerCase();let platform='';let storeUrl='';if(/android/.test(userAgent)){platform='Android';storeUrl='https://play.google.com/store/apps/details?id=com.google.android.calendar';}else if(/iphone|ipad|ipod/.test(userAgent)){platform='iOS';storeUrl='https://apps.apple.com/app/google-calendar/id909319292';}else{platform='Web Browser';storeUrl='https://calendar.google.com/';}
const message=`📅 How to use Calendar Reminder:\n\n1. Calculate your tank finish time\n2. Click "📅 Add Reminder" button\n\nFor ${platform} users, if you don't have Google Calendar, you can download it.`;if(confirm(message+'\n\nClick OK to go to the store.')){window.open(storeUrl,'_blank');}}
window.showCalendarHelp=showCalendarHelp;
async function logPBCRCalculation(tankNumber,hours,minutes,finishTime,finishDate){if(!currentUser)return;try{const userIP=await fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(data=>data.ip).catch(()=>'Unknown');const timestamp=new Date();const detailedAction=`Calculated Tank ${tankNumber} in PBCR - Result: ${hours}h ${minutes}m (Finish: ${finishTime} - ${finishDate}) by ${currentUser.username}`;await addDoc(collection(db,'activities'),{action:detailedAction,originalAction:'pbcr_calculation',username:currentUser.username,tankNumber:tankNumber,calculationResult:`${hours}h ${minutes}m`,finishTime:finishTime,finishDate:finishDate,timestamp:serverTimestamp(),ip:userIP,userAgent:navigator.userAgent.substring(0,100),page:'pbcr-calculator'});}catch(error){console.error('Error logging PBCR calculation:',error);}}
function showLiveTanksHelp(){alert('🔴 Add to Live Tanks:\n\nAdds your tank to the live monitoring system for all users to see. Requires panel operator or admin access.');}
function showTableHelp(){alert('📊 Add to Table:\n\nAdds tank to your personal table below. Only you can see this table.');}
window.showLiveTanksHelp=showLiveTanksHelp;window.showTableHelp=showTableHelp;
</script>
