// --- Constants & Data ---
const PRESETS = {
    dayalbagh: {
        sample: { p: 25, s: 12, k: 180, ca: 3.5, ph: 7.2, ec: 0.45, oc: 0.65 },
        ref: {
            p: { min: 20, max: 40 },
            s: { min: 10, max: 20 },
            k: { min: 150, max: 250 },
            ca: { min: 2, max: 5 },
            ph: { min: 6.0, max: 7.5 },
            ec: { min: 0, max: 1.0 },
            oc: { min: 0.5, max: 1.0 }
        }
    },
    global: {
        sample: { p: 30, s: 15, k: 200, ca: 3.5, ph: 6.5, ec: 0.5, oc: 0.75 },
        ref: {
            p: { min: 20, max: 40 },
            s: { min: 10, max: 20 },
            k: { min: 150, max: 250 },
            ca: { min: 2, max: 5 },
            ph: { min: 6.0, max: 7.5 },
            ec: { min: 0, max: 1.0 },
            oc: { min: 0.5, max: 1.0 }
        }
    }
};

// Default Ranges (Initial Load)
const DEFAULT_RANGES = {
    p: { min: 20, max: 40, unit: 'kg/ha' },
    s: { min: 10, max: 20, unit: 'ppm' },
    k: { min: 150, max: 250, unit: 'kg/ha' },
    ca: { min: 2, max: 5, unit: 'meq/100g' },
    ph: { min: 6.0, max: 7.5, unit: '' },
    ec: { min: 0, max: 1.0, unit: 'dS/m' },
    oc: { min: 0.5, max: 1.0, unit: '%' }
};

let currentAnalysis = null;
let barChartInstance = null;
let radarChartInstance = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTypewriter();
    initAnalyzer();
    initChatbot();
    loadFeedback();
});

// --- Navigation ---
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.page-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            navigateTo(targetId);
        });
    });

    // Search functionality
    document.getElementById('search-btn').addEventListener('click', () => {
        const query = document.getElementById('google-search').value;
        if (query) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query + ' sustainable agriculture')}`, '_blank');
        }
    });
}

function navigateTo(sectionId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    const activeBtn = document.querySelector(`.nav-btn[data-target="${sectionId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function scrollToInfo() {
    document.getElementById('info-cards').scrollIntoView({ behavior: 'smooth' });
}

// --- Typewriter Effect ---
function initTypewriter() {
    const text = "Tuning into the Rhythm of Sustainable Growth.";
    const el = document.getElementById('typed-tagline');
    let i = 0;

    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    type();
}

// --- Analyzer Logic ---
function initAnalyzer() {
    // Load default ranges initially
    fillReferenceInputs(DEFAULT_RANGES);

    const presetSelector = document.getElementById('preset-selector');
    presetSelector.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val !== 'manual' && PRESETS[val]) {
            fillInputs(PRESETS[val]);
        } else {
            clearSampleInputs();
            // Optionally keep reference inputs or reset them? Let's keep them as is for manual
        }
    });
}

function fillReferenceInputs(ranges) {
    for (const [key, val] of Object.entries(ranges)) {
        const minEl = document.getElementById(`ref-${key}-min`);
        const maxEl = document.getElementById(`ref-${key}-max`);
        if (minEl && maxEl) {
            minEl.value = val.min;
            maxEl.value = val.max;
        }
    }
}

function fillInputs(data) {
    // Fill Sample
    document.getElementById('input-p').value = data.sample.p;
    document.getElementById('input-s').value = data.sample.s;
    document.getElementById('input-k').value = data.sample.k;
    document.getElementById('input-ca').value = data.sample.ca;
    document.getElementById('input-ph').value = data.sample.ph;
    document.getElementById('input-ec').value = data.sample.ec;
    document.getElementById('input-oc').value = data.sample.oc;

    // Fill Reference
    if (data.ref) {
        fillReferenceInputs(data.ref);
    }
}

function clearSampleInputs() {
    document.querySelectorAll('.sample-column input').forEach(inp => inp.value = '');
}

function getRangesFromInputs() {
    const ranges = {};
    const keys = ['p', 's', 'k', 'ca', 'ph', 'ec', 'oc'];
    keys.forEach(key => {
        ranges[key] = {
            min: parseFloat(document.getElementById(`ref-${key}-min`).value) || 0,
            max: parseFloat(document.getElementById(`ref-${key}-max`).value) || 0,
            unit: DEFAULT_RANGES[key].unit // Keep unit from default
        };
    });
    return ranges;
}

function runAnalysis() {
    const data = {
        p: parseFloat(document.getElementById('input-p').value) || 0,
        s: parseFloat(document.getElementById('input-s').value) || 0,
        k: parseFloat(document.getElementById('input-k').value) || 0,
        ca: parseFloat(document.getElementById('input-ca').value) || 0,
        ph: parseFloat(document.getElementById('input-ph').value) || 0,
        ec: parseFloat(document.getElementById('input-ec').value) || 0,
        oc: parseFloat(document.getElementById('input-oc').value) || 0
    };

    const currentRanges = getRangesFromInputs();

    currentAnalysis = analyzeData(data, currentRanges);
    updateCharts(data, currentRanges);
    updateStatusIndicators(currentAnalysis);
    updateClassification(data, currentAnalysis);
    generateSuggestions(currentAnalysis);
    generateReport(data, currentAnalysis);

    // Save to local storage
    localStorage.setItem('lastAnalysis', JSON.stringify({ data, ranges: currentRanges }));
}

function analyzeData(data, ranges) {
    const results = {};
    for (const [key, val] of Object.entries(data)) {
        const range = ranges[key];
        if (!range) continue;

        let status = 'adequate';
        if (val < range.min) status = 'low'; // Strict check against min
        else if (val > range.max) status = 'excess'; // Strict check against max

        results[key] = { value: val, status: status, range: range };
    }
    return results;
}

function updateCharts(data, ranges) {
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxRadar = document.getElementById('radarChart').getContext('2d');

    // Normalize data for radar chart (0-100 scale relative to max range)
    const normalizedData = Object.keys(ranges).map(key => {
        const val = data[key] || 0;
        const max = ranges[key].max * 1.5; // Scale relative to dynamic max
        return max > 0 ? (val / max) * 100 : 0;
    });

    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['P', 'S', 'K', 'Ca'],
            datasets: [{
                label: 'Nutrient Levels',
                data: [data.p, data.s, data.k, data.ca],
                backgroundColor: ['#4CAF50', '#FFD700', '#2196F3', '#FF5722']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    if (radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: Object.keys(ranges).map(k => k.toUpperCase()),
            datasets: [{
                label: 'Soil Profile',
                data: normalizedData,
                backgroundColor: 'rgba(46, 125, 50, 0.2)',
                borderColor: '#2E7D32',
                pointBackgroundColor: '#fff'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }
    });
}

function updateStatusIndicators(analysis) {
    const container = document.getElementById('status-indicators');
    container.innerHTML = '';

    for (const [key, info] of Object.entries(analysis)) {
        const div = document.createElement('div');
        div.className = `status-item status-${info.status}`;
        div.textContent = `${key.toUpperCase()}: ${info.status.toUpperCase()}`;
        container.appendChild(div);
    }
}

function updateClassification(data, analysis) {
    let soilType = "Loamy"; // Simplified logic
    if (data.ec > 1.0) soilType = "Saline";
    if (data.ph > 8.0) soilType = "Alkaline";
    if (data.ph < 5.5) soilType = "Acidic";

    let qualityScore = 0;
    Object.values(analysis).forEach(item => {
        if (item.status === 'adequate') qualityScore += 14; // Max ~100
        else if (item.status === 'low') qualityScore += 5;
        else qualityScore += 8;
    });
    if (qualityScore > 100) qualityScore = 100;

    const html = `
        <p><strong>Soil Type:</strong> ${soilType}</p>
        <p><strong>Quality Score:</strong> ${Math.round(qualityScore)}/100</p>
        <p><strong>pH Class:</strong> ${data.ph < 6 ? 'Acidic' : data.ph > 7.5 ? 'Alkaline' : 'Neutral'}</p>
    `;
    document.getElementById('classification-results').innerHTML = html;
}

function generateSuggestions(analysis) {
    const container = document.getElementById('suggestion-content');
    let html = '<ul>';

    if (analysis.p.status === 'low') html += '<li>Add Superphosphate or Bone Meal to increase Phosphorus.</li>';
    if (analysis.k.status === 'low') html += '<li>Apply Potash fertilizers to boost Potassium.</li>';
    if (analysis.ph.status === 'low') html += '<li>Use Lime to raise pH levels.</li>';
    if (analysis.ph.status === 'excess') html += '<li>Add Gypsum or Sulfur to lower pH.</li>';
    if (analysis.oc.status === 'low') html += '<li>Incorporate organic compost or manure.</li>';

    if (html === '<ul>') html += '<li>Soil balance looks good! Maintain current practices.</li>';
    html += '</ul>';

    container.innerHTML = html;
}

// --- Report & PDF ---
function generateReport(data, analysis) {
    const tbody = document.querySelector('#report-table tbody');
    tbody.innerHTML = '';

    for (const [key, info] of Object.entries(analysis)) {
        const row = `<tr>
            <td>${key.toUpperCase()}</td>
            <td>${info.value} ${info.range.unit}</td>
            <td style="color: ${info.status === 'low' ? 'red' : info.status === 'adequate' ? 'green' : 'orange'}">${info.status.toUpperCase()}</td>
            <td>${info.status === 'low' ? 'Increase input' : info.status === 'excess' ? 'Reduce input' : 'Maintain'}</td>
        </tr>`;
        tbody.innerHTML += row;
    }

    document.getElementById('report-summary-text').textContent = `Analysis completed on ${new Date().toLocaleDateString()}. Overall soil health is ${analysis.ph.status === 'adequate' && analysis.oc.status === 'adequate' ? 'Good' : 'Needs Attention'}.`;

    document.getElementById('narrative-text').innerHTML = `
        <p>Based on the analysis, your soil shows specific characteristics. The pH level of ${data.ph} indicates ${data.ph < 6 ? 'acidity' : 'alkalinity/neutrality'}. 
        Organic Carbon is at ${data.oc}%, which is ${analysis.oc.status}. 
        Nutrient management should focus on balancing ${Object.keys(analysis).filter(k => analysis[k].status !== 'adequate').join(', ').toUpperCase() || 'none'}.</p>
    `;
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(46, 125, 50);
    doc.text("AgriPulse - Soil Analysis Report", 105, 20, null, null, "center");

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    doc.autoTable({
        html: '#report-table',
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50] }
    });

    doc.save("AgriPulse_Report.pdf");
}

// --- Feedback & LocalStorage ---
function handleFeedback(e) {
    e.preventDefault();
    const feedback = {
        name: document.getElementById('fb-name').value,
        email: document.getElementById('fb-email').value,
        message: document.getElementById('fb-message').value,
        date: new Date().toISOString()
    };

    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

    showPopup();
    e.target.reset();
}

function showPopup() {
    const popup = document.getElementById('success-popup');
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 2000);
}

function clearFeedback() {
    document.getElementById('feedback-form').reset();
}

function loadFeedback() {
    // Optional: Load previous feedback if needed
}

// --- Chatbot ---
function initChatbot() {
    const toggle = document.getElementById('chatbot-toggle');
    const widget = document.getElementById('chatbot-widget');
    const close = document.getElementById('close-chat');
    const send = document.getElementById('send-chat');
    const input = document.getElementById('chat-input');
    const msgs = document.getElementById('chatbot-messages');

    toggle.addEventListener('click', () => {
        widget.style.display = widget.style.display === 'flex' ? 'none' : 'flex';
    });

    close.addEventListener('click', () => widget.style.display = 'none');

    function addMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        div.textContent = text;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function handleChat() {
        const txt = input.value.trim();
        if (!txt) return;

        addMsg(txt, 'user');
        input.value = '';

        // Simple bot logic
        setTimeout(() => {
            let reply = "I'm still learning, but I can help with soil parameters!";
            const lower = txt.toLowerCase();
            if (lower.includes('ph')) reply = "pH measures soil acidity. 6.5-7.5 is ideal for most crops.";
            else if (lower.includes('nitrogen') || lower.includes('npk')) reply = "Nitrogen is key for leaf growth. Phosphorus for roots, Potassium for overall health.";
            else if (lower.includes('hello') || lower.includes('hi')) reply = "Hello! Ask me about your soil analysis.";

            addMsg(reply, 'bot');
        }, 500);
    }

    send.addEventListener('click', handleChat);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });
}

function addToPlan() {
    alert("Added suggestions to your action plan!");
}

function clearPlan() {
    document.getElementById('plan-display').innerHTML = '';
}
