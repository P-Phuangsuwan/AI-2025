// rice_care.js

let currentWeatherData = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const tabBtns = document.querySelectorAll('.care-tab-btn');
    const analyzeBtn = document.getElementById('analyzeBtn');

    let currentCategory = 'water'; // Default

    // Fetch Weather Data on Load
    fetchFarmWeather();

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            // Update category
            currentCategory = btn.getAttribute('data-tab');

            // Update UI Context Box depending on tab dynamically
            updateContextBox(currentCategory);

            // Reset AI result
            resetAIResult();
        });
    });

    // 2. Simulate AI Analysis
    analyzeBtn.addEventListener('click', () => {
        analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังประมวลผลข้อมูล...';
        analyzeBtn.disabled = true;

        // Get common data
        const stage = document.getElementById('riceStage').value;
        const variety = document.getElementById('riceVariety').value;

        setTimeout(() => {
            generateAIResponse(currentCategory, stage, variety, currentWeatherData);

            analyzeBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> วิเคราะห์ข้อมูลสภาพอากาศและรับคำแนะนำ';
            analyzeBtn.disabled = false;
        }, 1500); // Simulate network latency
    });
});

// --- Fetch Weather ---
function fetchFarmWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherData(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn("Geolocation denied or error, defaulting to Bangkok");
                getWeatherData(13.754, 100.5014); // Default BKK
            }
        );
    } else {
        getWeatherData(13.754, 100.5014); // Default BKK
    }
}

async function getWeatherData(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&timezone=auto&forecast_days=1`;
        const response = await fetch(url);
        const data = await response.json();

        // Simulate some farm specific data that API doesn't have
        const simWaterLevel = Math.floor(Math.random() * 15); // 0-14 cm
        const simSoilPH = (Math.random() * 2.5 + 4.5).toFixed(1); // 4.5-7.0

        currentWeatherData = {
            temp: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            rainProb: Math.max(...data.hourly.precipitation_probability), // Max rain prob for the day
            waterLevel: simWaterLevel,
            soilPH: parseFloat(simSoilPH)
        };

        // Enable button
        const btn = document.getElementById('analyzeBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> วิเคราะห์ข้อมูลสภาพอากาศและรับคำแนะนำ';

        // Update Context Box for default tab
        updateContextBox('water');

    } catch (e) {
        console.error("Error fetching weather for rice care", e);
        document.getElementById('dynamicContextBox').innerHTML = '<div style="color:var(--danger-color);"><i class="fa-solid fa-triangle-exclamation"></i> ไม่สามารถดึงข้อมูลสภาพอากาศได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</div>';
    }
}


function updateContextBox(category) {
    const contextBox = document.getElementById('dynamicContextBox');

    if (!currentWeatherData) {
        return; // Still loading...
    }

    if (category === 'water') {
        contextBox.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div><i class="fa-solid fa-droplet" style="width: 20px; color: #0284c7;"></i> <strong>ความชื้นสัมพัทธ์:</strong> ${currentWeatherData.humidity}%</div>
                <div><i class="fa-solid fa-cloud-rain" style="width: 20px; color: #0284c7;"></i> <strong>โอกาสเกิดฝน (วันนี้):</strong> ${currentWeatherData.rainProb}%</div>
                <div><i class="fa-solid fa-water" style="width: 20px; color: #0284c7;"></i> <strong>ระดับน้ำในนา (เซนเซอร์จำลอง):</strong> ${currentWeatherData.waterLevel} ซม.</div>
            </div>
        `;
    } else if (category === 'temperature') {
        contextBox.innerHTML = `
             <div style="display: flex; flex-direction: column; gap: 8px;">
                <div><i class="fa-solid fa-temperature-half" style="width: 20px; color: #ea580c;"></i> <strong>อุณหภูมิปัจจุบัน:</strong> ${currentWeatherData.temp}°C</div>
                <div><i class="fa-solid fa-droplet" style="width: 20px; color: #0284c7;"></i> <strong>ความชื้นสัมพัทธ์:</strong> ${currentWeatherData.humidity}%</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;"><i class="fa-solid fa-circle-info"></i> อุณหภูมิที่สูงเกิน 35°C หรือต่ำเกินไป จะส่งผลต่อการเจริญเติบโตของข้าว</div>
            </div>
        `;
    } else if (category === 'disease') {
        contextBox.innerHTML = `
             <div style="display: flex; flex-direction: column; gap: 8px;">
                <div><i class="fa-solid fa-temperature-half" style="width: 20px; color: #ea580c;"></i> <strong>อุณหภูมิปัจจุบัน:</strong> ${currentWeatherData.temp}°C</div>
                <div><i class="fa-solid fa-droplet" style="width: 20px; color: #0284c7;"></i> <strong>ความชื้นสัมพัทธ์:</strong> ${currentWeatherData.humidity}%</div>
                <div><i class="fa-solid fa-cloud-rain" style="width: 20px; color: #0284c7;"></i> <strong>โอกาสเกิดฝน:</strong> ${currentWeatherData.rainProb}%</div>
                 <div style="font-size: 0.85rem; color: var(--danger-color); margin-top: 5px;"><i class="fa-solid fa-bug"></i> อากาศร้อนชื้น (อุณหภูมิ 28-32°C, ความชื้น > 85%) เป็นปัจจัยเสี่ยงต่อการเกิดโรคราและแมลงศัตรูพืช</div>
            </div>
        `;
    } else if (category === 'soil') {
        contextBox.innerHTML = `
             <div style="display: flex; flex-direction: column; gap: 8px;">
                <div><i class="fa-solid fa-flask" style="width: 20px; color: #8b5cf6;"></i> <strong>ค่า pH ในดิน (จำลองข้อมูล):</strong> ${currentWeatherData.soilPH}</div>
                <div><i class="fa-solid fa-temperature-half" style="width: 20px; color: #ea580c;"></i> <strong>อุณหภูมิเฉลี่ย:</strong> ${currentWeatherData.temp}°C</div>
                 <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;"><i class="fa-solid fa-circle-info"></i> ค่า pH ที่ดีที่สุดสำหรับการเติบโตของข้าวหอมมะลิควรอยู่ระหว่าง 5.5 - 6.5</div>
            </div>
        `;
    }
}

function resetAIResult() {
    const aiContent = document.getElementById('aiResultContent');
    aiContent.innerHTML = `
        <div class="empty-state">
            <i class="fa-regular fa-lightbulb"></i>
            <p>ระบบพร้อมทำงาน<br>กดปุ่ม <strong>"วิเคราะห์ข้อมูลสภาพอากาศและรับคำแนะนำ"</strong><br>เพื่อให้ AI ประมวลผลจากข้อมูลจริงของฟาร์มคุณ</p>
        </div>
    `;
}

// Logic Rules for AI based on Real Weather Data
function generateAIResponse(category, stage, variety, weather) {
    const aiContent = document.getElementById('aiResultContent');
    let html = '<div class="ai-result-box">';

    // Get Stage Name TH
    let stageName = "ระยะกล้า";
    if (stage === 'tillering') stageName = "ระยะแตกกอ";
    if (stage === 'booting') stageName = "ระยะตั้งท้อง";
    if (stage === 'flowering') stageName = "ระยะออกรวง";

    const { temp, humidity, rainProb, waterLevel } = weather;

    if (category === 'water') {
        if (waterLevel <= 2 && rainProb < 30) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-triangle-exclamation"></i> ตรวจพบความเครียดจากภัยแล้ง (Drought Risk)</strong>
                    <p>ระดับน้ำจำลองต่ำมาก (${waterLevel} ซม.) และโอกาสฝนตกน้อย (${rainProb}%) ข้าว${stageName} อาจขาดน้ำ</p>
                </div>
                <h4>คำแนะนำเร่งด่วน:</h4>
                <ul>
                    <li><strong>การจัดการน้ำ:</strong> เร่งสูบน้ำเข้าแปลงนา รักษาระดับน้ำให้ได้ 3-5 ซม.</li>
                    <li>งดใส่ปุ๋ยเคมีทางดินในช่วงนี้ เพื่อป้องกันรากไหม้</li>
                </ul>
            `;
        } else if (rainProb > 80 || waterLevel > 12) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-water"></i> ความเสี่ยงน้ำท่วมขัง (Flood Risk)</strong>
                    <p>โอกาสฝนตกสูงถึง ${rainProb}% ระวังน้ำท่วมขังแปลงนา</p>
                </div>
                <h4>คำแนะนำเร่งด่วน:</h4>
                <ul>
                    <li>เตรียมระบายน้ำออกจากแปลงนา เพื่อไม่ให้ระดับน้ำท่วมต้นกระหม่อมข้าวใน${stageName}</li>
                    <li>หากน้ำท่วมขังเกิน 7 วัน รากจะขาดออกซิเจน หลังน้ำลดให้ฉีดพ่นอาหารเสริมทางใบ</li>
                </ul>
            `;
        } else {
            html += `
                <div class="ai-success">
                     <strong><i class="fa-solid fa-circle-check"></i> ระดับน้ำเหมาะสม</strong>
                     <p>สภาพแวดล้อมปัจจุบัน (โอกาสฝน ${rainProb}%) ไม่มีความเสี่ยงเรื่องปัญหาน้ำมากนัก</p>
                </div>
                <ul><li>พยายามรักษาระดับน้ำให้เหมาะสมกับ${stageName} อย่างต่อเนื่อง หากอยู่ระยะแตกกอ อาจใช้วิธีเปียกสลับแห้งได้</li></ul>
             `;
        }

    } else if (category === 'temperature') {
        if (temp >= 35) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-sun"></i> ความเครียดจากความร้อน (Heat Stress)</strong>
                    <p>อุณหภูมิปัจจุบันสูงถึง ${temp}°C โดยเฉพาะถ้าอยู่ในระยะตั้งท้องและออกรวง จะทำให้ละอองเกสรเป็นหมัน ข้าวเมล็ดลีบ</p>
                </div>
                <h4>คำแนะนำชดเชย:</h4>
                <ul>
                    <li>เพิ่มระดับน้ำในแปลงนาให้สูงขึ้นเพื่อลดอุณหภูมิดิน</li>
                    <li>ฉีดพ่นฮอร์โมนพืชเสริมความแข็งแรงในช่วงเช้าตรู่ (ก่อนแดดจัด)</li>
                </ul>
            `;
        } else if (temp <= 20) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-snowflake"></i> ความเครียดจากอากาศเย็น (Cold Stress)</strong>
                    <p>อุณหภูมิ ${temp}°C อาจทำให้ข้าวชะงักการเจริญเติบโต</p>
                </div>
                <h4>คำแนะนำ:</h4>
                <ul><li>เพิ่มระดับน้ำในแปลงนาเพื่อช่วยรักษาอุณหภูมิไม่ให้ลดต่ำเกินไปในช่วงกลางคืน</li></ul>
            `;
        } else {
            html += `
                <div class="ai-success">
                     <strong><i class="fa-solid fa-check-circle"></i> อุณหภูมิอยู่ในเกณฑ์เหมาะสม</strong>
                     <p>อุณหภูมิ ${temp}°C เหมาะสมสำหรับการเจริญเติบโตของข้าว${stageName}</p>
                </div>
             `;
        }

    } else if (category === 'disease') {
        if (humidity > 80 && temp >= 28 && temp <= 32) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-bug"></i> ความเสี่ยงระบาดของเชื้อราและเพลี้ย</strong>
                    <p>อากาศร้อนชื้น (อุณหภูมิ ${temp}°C, ความชื้น ${humidity}%) เป็นสภาพแวดล้อมที่เหมาะสมมากต่อการเกิดโรคไหม้ (Blast) และการแพร่ขยายพันธุ์ของเพลี้ยกระโดดสีน้ำตาล</p>
                </div>
                <h4>วิธีป้องกันและแก้ไข:</h4>
                <ul>
                    <li><strong>ระวังโรค:</strong> ควรชะลอการใส่ปุ๋ยไนโตรเจน (เช่น ยูเรีย) เพราะจะทำให้ใบข้าวอ่อนแอรับเชื้อราได้ง่าย</li>
                    <li><strong>ตรวจสอบแปลง:</strong> หมั่นเดินสำรวจแปลงนาอย่างใกล้ชิด หากพบแผลรูปตาสีน้ำตาล ให้ใช้สารชีวภัณฑ์ <em>ไตรโคเดอร์มา</em> ฉีดพ่น</li>
                </ul>
             `;
        } else if (rainProb > 70) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-cloud-showers-heavy"></i> ความเสี่ยงโรคที่มากับฝน</strong>
                    <p>โอกาสฝนตกชุก (${rainProb}%) ระวังการระบาดของโรคขอบใบแห้ง (Bacterial Blight)</p>
                </div>
                <ul>
                    <li>หากเกิดแผลตามขอบใบ หลีกเลี่ยงการเดินลุยแปลงนาขณะที่ใบข้าวเปียกเพราะจะทำให้เชื้อแบคทีเรียกระจาย</li>
                </ul>
             `;
        } else {
            html += `
                <div class="ai-success">
                     <strong><i class="fa-solid fa-shield-cat"></i> ความเสี่ยงโรคและแมลงต่ำ</strong>
                     <p>สภาพอากาศปัจจุบันไม่เอื้อต่อการแพร่ระบาดรุนแรงของโรคและแมลง</p>
                </div>
                <ul>
                     <li>หมั่นกำจัดวัชพืชเพื่อให้แปลงนาโปร่ง แสงแดดส่องถึงโคนต้น เป็นการตัดวงจรแมลงศัตรูพืช</li>
                </ul>
             `;
        }
    } else if (category === 'soil') {
        if (weather.soilPH < 5.5) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-flask"></i> ภาวะดินเปรี้ยว (Acid Soil)</strong>
                    <p>ค่า pH ต่ำกว่า 5.5 (เซนเซอร์จำลองวัดได้ ${weather.soilPH}) ทำให้ดินเป็นกรด ข้าว${stageName} อาจดูดซึมฟอสฟอรัสได้น้อยและเสี่ยงประเด็นรากเน่า</p>
                </div>
                <h4>คำแนะนำการปรับปรุงดิน:</h4>
                <ul>
                    <li><strong>ระยะสั้น:</strong> หว่านปูนมาร์ล หรือ ปูนขาว ในอัตราที่เหมาะสม (ประมาณ 100-200 กก./ไร่) เพื่อปรับสภาพความเปนกรดในดิน</li>
                    <li><strong>ระยะยาว:</strong> ไถกลบตอซังและหมักฟางข้าว หรือปลูกพืชตระกูลถั่ว (เช่น ปอเทือง) เป็นปุ๋ยสดก่อนทำนา</li>
                </ul>
             `;
        } else if (weather.soilPH > 6.5) {
            html += `
                <div class="ai-warning">
                    <strong><i class="fa-solid fa-flask"></i> ภาวะดินด่าง (Alkaline Soil)</strong>
                    <p>ค่า pH สูงกว่า 6.5 (เซนเซอร์จำลองวัดได้ ${weather.soilPH}) อาจทำให้ข้าว${stageName} ขาดธาตุอาหารรอง เช่น เหล็ก สังกะสี</p>
                </div>
                <h4>คำแนะนำ:</h4>
                <ul>
                    <li>หลีกเลี่ยงการใช้ปุ๋ยที่มีฤทธิ์เป็นด่างรุนแรง</li>
                    <li>ใช้ปุ๋ยอินทรีย์หรือปุ๋ยหมักเพื่อช่วยปรับโครงสร้างและลดความเปนด่างของดิน</li>
                    <li>เสริมธาตุอาหารทางใบ (เช่น สารละลายสังกะสี) หากพบว่าใบข้าวมีสีซีดผิดปกติ</li>
                </ul>
             `;
        } else {
            html += `
                <div class="ai-success">
                     <strong><i class="fa-solid fa-leaf"></i> สภาพดินเหมาะสม</strong>
                     <p>ค่า pH ในดินอยู่ที่ ${weather.soilPH} ซึ่งอยู่ในเกณฑ์ที่ดีมากกับการเจริญเติบโตของข้าว${stageName}</p>
                </div>
                <ul>
                     <li>ดูแลรักษาระดับน้ำตามปกติ และสามารถใส่ปุ๋ยหลัก/ปุ๋ยรองตามกำหนดระยะเจริญเติบโตได้เลย</li>
                </ul>
             `;
        }
    }

    html += `
        <div class="ai-info" style="margin-top:20px;">
            <i class="fa-solid fa-robot"></i> วิเคราะห์สดผ่าน AI ร่วมกับข้อมูลพันธุ์${variety === 'white_jasmine105' ? 'หอมมะลิ 105' : 'อื่นๆ'} (${stageName})
        </div>
    </div>`;

    aiContent.innerHTML = html;
}
