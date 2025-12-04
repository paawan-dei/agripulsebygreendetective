// State Management
let state = {
  preset: 'manual',
  inputs: { P: 0, S: 0, K: 0, Ca: 0, pH: 7, EC: 1, OC: 0.5 },
  ref: {},
  results: {},
  plan: []
};

// Reference Data
const refs = {
  dayalbagh: {
    P: 25,
    S: 20,
    K: 150,
    Ca: 1500,
    pH: 7.2,
    EC: 1.2,
    OC: 0.8
  },
  global: {
    P: 30,
    S: 25,
    K: 160,
    Ca: 1600,
    pH: 7.0,
    EC: 1.0,
    OC: 0.7
  }
};

// Nutrient Notes for Global Data Page
const nutrientNotes = {
  P: 'Phosphorus supports root growth, flowering, and energy transfer in plants. Essential for ATP formation.',
  S: 'Sulfur is crucial for protein synthesis, enzyme activation, and chlorophyll production.',
  K: 'Potassium regulates water uptake, enhances disease resistance, and improves fruit quality.',
  Ca: 'Calcium strengthens cell walls, aids root development, and prevents physiological disorders.',
  pH: 'Soil pH affects nutrient availability. Most crops prefer 6.0-7.5 range for optimal growth.',
  EC: 'Electrical conductivity indicates soil salinity. High EC can limit water and nutrient uptake.',
  OC: 'Organic carbon reflects soil organic matter content, improving water retention and nutrient cycling.'
};

// Page Navigation
function showSection(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
  
  const targetPage = document.getElementById(id);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  document.querySelectorAll(`[data-target="${id}"]`).forEach(b => {
    b.classList.add('active');
  });

  // Load results if navigating to results page
  if (id === 'results') {
    loadResults();
  }

  // Load global table if navigating to global page
  if (id === 'global') {
    buildGlobalTable();
  }
}

// Navigation Event Listeners
document.querySelectorAll('[data-target]').forEach(b => {
  b.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(b.dataset.target);
  });
});

// Typed Tagline Animation
const tagline = 'Tuning into the Rhythm of Sustainable Growth.';
let ti = 0;

function typeTagline() {
  if (ti <= tagline.length) {
    const typedEl = document.getElementById('typed');
    if (typedEl) {
      typedEl.textContent = tagline.slice(0, ti);
      ti += 1;
      setTimeout(typeTagline, 50);
    }
  }
}

// Start typing animation when page loads
document.addEventListener('DOMContentLoaded', () => {
  typeTagline();
});

// Google Search
document.getElementById('googleSearch').addEventListener('click', () => {
  const query = document.getElementById('googleQuery').value.trim();
  if (query) {
    window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
  }
});

document.getElementById('googleQuery').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('googleSearch').click();
  }
});

// About Modal
document.getElementById('aboutOpen').addEventListener('click', () => {
  document.getElementById('about').classList.add('show');
});

document.getElementById('aboutClose').addEventListener('click', () => {
  document.getElementById('about').classList.remove('show');
});

document.getElementById('about').addEventListener('click', (e) => {
  if (e.target.id === 'about') {
    document.getElementById('about').classList.remove('show');
  }
});

// Preset Selection
document.getElementById('presetSelect').addEventListener('change', (e) => {
  state.preset = e.target.value;
  if (state.preset === 'manual') {
    state.ref = {};
    clearInputs();
  } else if (state.preset === 'dayalbagh') {
    state.ref = { ...refs.dayalbagh };
    fillInputs(state.ref);
  } else if (state.preset === 'global') {
    state.ref = { ...refs.global };
    fillInputs(state.ref);
  }
});

function clearInputs() {
  document.getElementById('inP').value = '';
  document.getElementById('inS').value = '';
  document.getElementById('inK').value = '';
  document.getElementById('inCa').value = '';
  document.getElementById('inPH').value = '';
  document.getElementById('inEC').value = '';
  document.getElementById('inOC').value = '';
}

function fillInputs(ref) {
  document.getElementById('inP').value = ref.P;
  document.getElementById('inS').value = ref.S;
  document.getElementById('inK').value = ref.K;
  document.getElementById('inCa').value = ref.Ca;
  document.getElementById('inPH').value = ref.pH;
  document.getElementById('inEC').value = ref.EC;
  document.getElementById('inOC').value = ref.OC;
}

// Read Input Values
function readInputs() {
  state.inputs.P = parseFloat(document.getElementById('inP').value) || 0;
  state.inputs.S = parseFloat(document.getElementById('inS').value) || 0;
  state.inputs.K = parseFloat(document.getElementById('inK').value) || 0;
  state.inputs.Ca = parseFloat(document.getElementById('inCa').value) || 0;
  state.inputs.pH = parseFloat(document.getElementById('inPH').value) || 7;
  state.inputs.EC = parseFloat(document.getElementById('inEC').value) || 1;
  state.inputs.OC = parseFloat(document.getElementById('inOC').value) || 0.5;
}

// Comparison Function
function compare(a, b) {
  if (!b || b === 0) return { pct: 100, status: 'adequate' };
  const pct = Math.round((a / b) * 100);
  let status = 'adequate';
  if (pct < 80) status = 'low';
  else if (pct > 120) status = 'excess';
  return { pct, status };
}

// Build Comparison Table
function buildTable() {
  const tbody = document.querySelector('#comparisonTable tbody');
  const r = state.ref.pH ? state.ref : refs.global;
  const rows = [
    ['P', state.inputs.P, r.P],
    ['S', state.inputs.S, r.S],
    ['K', state.inputs.K, r.K],
    ['Ca', state.inputs.Ca, r.Ca],
    ['pH', state.inputs.pH, r.pH],
    ['EC', state.inputs.EC, r.EC],
    ['OC', state.inputs.OC, r.OC]
  ];

  let html = '';
  let statuses = {};

  rows.forEach(([k, v, ref]) => {
    const c = compare(v, ref);
    statuses[k] = c;
    const cls = c.status === 'low' ? 'status-low' : c.status === 'excess' ? 'status-excess' : 'status-adequate';
    html += `
      <tr>
        <td><strong>${k}</strong></td>
        <td>${v.toFixed(2)}</td>
        <td>${ref.toFixed(2)}</td>
        <td>${c.pct}%</td>
        <td class="${cls}">${c.status.toUpperCase()}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  state.results.statuses = statuses;
}

// Draw Bar Chart
function drawBar() {
  const canvas = document.getElementById('barChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = container.clientWidth - 32;
  const height = 300;
  
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  ctx.clearRect(0, 0, width, height);

  if (!state.results.statuses) return;

  const labels = ['P', 'S', 'K', 'Ca'];
  const values = labels.map(k => state.results.statuses[k]?.pct || 100);
  const maxValue = Math.max(...values, 160);
  
  const barWidth = (width - 80) / labels.length - 20;
  const gap = 20;
  const baseY = height - 40;
  const maxHeight = baseY - 40;

  labels.forEach((label, i) => {
    const value = values[i];
    const barHeight = (value / maxValue) * maxHeight;
    const x = 40 + i * (barWidth + gap);
    const y = baseY - barHeight;

    // Bar color based on status
    let color = '#0b7a4f'; // adequate
    if (value < 80) color = '#b00020'; // low
    else if (value > 120) color = '#885800'; // excess

    // Draw bar
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw value text
    ctx.fillStyle = '#0f2a18';
    ctx.font = '600 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${value}%`, x + barWidth / 2, y - 5);

    // Draw label
    ctx.fillText(label, x + barWidth / 2, baseY + 20);
  });

  // Draw grid lines
  ctx.strokeStyle = 'rgba(15, 42, 24, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const gridY = 40 + (i / 4) * maxHeight;
    ctx.beginPath();
    ctx.moveTo(40, gridY);
    ctx.lineTo(width - 40, gridY);
    ctx.stroke();
  }
}

// Draw Radar Chart
function drawRadar() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(container.clientWidth - 32, 380);
  
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  ctx.clearRect(0, 0, size, size);

  if (!state.results.statuses) return;

  const labels = ['pH', 'EC', 'OC'];
  const values = labels.map(k => {
    const status = state.results.statuses[k];
    return status ? Math.min(160, Math.max(0, status.pct)) : 100;
  });

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2 - 40;
  const numRings = 4;

  // Draw rings
  ctx.strokeStyle = 'rgba(15, 42, 24, 0.2)';
  ctx.lineWidth = 1;
  for (let ring = 0; ring <= numRings; ring++) {
    const radius = (ring / numRings) * maxRadius;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = 'rgba(15, 42, 24, 0.3)';
  labels.forEach((_, i) => {
    const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * maxRadius;
    const y = centerY + Math.sin(angle) * maxRadius;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // Draw data polygon
  ctx.beginPath();
  values.forEach((value, i) => {
    const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
    const radius = (value / 160) * maxRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(29, 119, 56, 0.3)';
  ctx.strokeStyle = '#1d7738';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // Draw labels
  ctx.fillStyle = '#0f2a18';
  ctx.font = '600 14px Inter';
  ctx.textAlign = 'center';
  labels.forEach((label, i) => {
    const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * (maxRadius + 20);
    const y = centerY + Math.sin(angle) * (maxRadius + 20);
    ctx.fillText(label, x, y);
  });
}

// Soil Classification
function classify() {
  const ph = state.inputs.pH;
  const oc = state.inputs.OC;
  const ec = state.inputs.EC;

  let phClass = 'Neutral';
  if (ph < 6.5) phClass = 'Acidic';
  else if (ph > 7.5) phClass = 'Alkaline';

  let ocClass = 'Medium';
  if (oc < 0.5) ocClass = 'Low';
  else if (oc > 0.75) ocClass = 'High';

  let soilType = 'Normal';
  if (ec > 4 && ph >= 7.0) soilType = 'Saline';
  if (ph > 8.5) soilType = 'Sodic';
  if (ec > 4 && ph > 8.5) soilType = 'Saline-Sodic';

  const scores = Object.values(state.results.statuses).map(s => s.status);
  const ok = scores.filter(s => s === 'adequate').length;
  const score = Math.round((ok / scores.length) * 100);

  const el = document.getElementById('classification');
  el.innerHTML = `
    <div class="classification-item">
      <strong>pH Class:</strong> ${phClass} (${ph.toFixed(2)})
    </div>
    <div class="classification-item">
      <strong>OC Class:</strong> ${ocClass} (${oc.toFixed(2)}%)
    </div>
    <div class="classification-item">
      <strong>Soil Type:</strong> ${soilType}
    </div>
    <div class="classification-item">
      <strong>Quality Score:</strong> ${score}/100
    </div>
  `;

  state.results.classification = { phClass, ocClass, soilType, score };
}

// Suggestion Engine
function suggest() {
  const r = state.ref.pH ? state.ref : refs.global;
  const items = [];

  ['P', 'S', 'K', 'Ca', 'OC'].forEach(k => {
    const v = state.inputs[k];
    const rv = r[k];
    if (rv) {
      const c = compare(v, rv);
      if (c.status === 'low') {
        const deficit = Math.max(0, rv - v);
        items.push({
          item: k,
          amount: deficit.toFixed(2),
          unit: k === 'OC' ? '%' : 'mg/kg',
          current: v.toFixed(2),
          target: rv.toFixed(2)
        });
      }
    }
  });

  const el = document.getElementById('suggestions');
  if (items.length === 0) {
    el.innerHTML = '<p style="color: var(--text-muted); text-align: center;">All parameters are adequate. No amendments needed.</p>';
  } else {
    el.innerHTML = items.map(item => `
      <div class="suggestion-item">
        <div>
          <strong>${item.item}:</strong> Add ${item.amount} ${item.unit}
          <br>
          <small style="color: var(--text-muted);">Current: ${item.current} → Target: ${item.target}</small>
        </div>
      </div>
    `).join('');
  }

  state.results.suggestions = items;
}

// Plan Management
document.getElementById('addPlan').addEventListener('click', () => {
  if (state.results.suggestions && state.results.suggestions.length > 0) {
    state.plan = [...state.results.suggestions];
    renderPlan();
  }
});

document.getElementById('clearPlan').addEventListener('click', () => {
  state.plan = [];
  renderPlan();
});

function renderPlan() {
  const el = document.getElementById('plan');
  if (!state.plan || state.plan.length === 0) {
    el.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No items in plan</p>';
  } else {
    el.innerHTML = state.plan.map(item => `
      <div class="plan-item">
        <span><strong>${item.item}:</strong> ${item.amount} ${item.unit}</span>
      </div>
    `).join('');
  }
}

document.getElementById('googleSuggest').addEventListener('click', () => {
  if (state.results.suggestions && state.results.suggestions.length > 0) {
    const items = state.results.suggestions.map(i => i.item).join(' ');
    const query = 'soil amendment ' + items;
    window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
  }
});

// Run Analytics
document.getElementById('runAnalytics').addEventListener('click', () => {
  readInputs();
  buildTable();
  
  // Small delay to ensure DOM is updated
  setTimeout(() => {
    drawBar();
    drawRadar();
    classify();
    suggest();
    
    // Auto-save session
    saveSession();
  }, 100);
});

// Save Session
document.getElementById('saveSession').addEventListener('click', () => {
  saveSession();
  showPopup('Session saved successfully!');
});

function saveSession() {
  const payload = {
    inputs: state.inputs,
    preset: state.preset,
    ref: state.ref.pH ? state.ref : refs.global,
    results: state.results,
    plan: state.plan,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('agriSession', JSON.stringify(payload));
}

// Load Results
function loadResults() {
  const raw = localStorage.getItem('agriSession');
  if (!raw) {
    document.getElementById('summary').innerHTML = '<p style="color: var(--text-muted);">No saved session found. Run analytics first.</p>';
    return;
  }

  try {
    const data = JSON.parse(raw);
    
    // Summary
    const summary = document.getElementById('summary');
    summary.innerHTML = `
      <div class="summary-item">
        <h4>Analysis Overview</h4>
        <p><strong>Preset:</strong> ${data.preset.charAt(0).toUpperCase() + data.preset.slice(1)}</p>
        <p><strong>Quality Score:</strong> ${data.results.classification?.score || 0}/100</p>
        <p><strong>Soil Type:</strong> ${data.results.classification?.soilType || 'N/A'}</p>
        <p><strong>Date:</strong> ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}</p>
      </div>
    `;

    // Summary Table
    const table = document.querySelector('#summaryTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = `
      <tr>
        <th>Parameter</th>
        <th>Input Value</th>
        <th>Reference Value</th>
        <th>Percentage</th>
        <th>Status</th>
      </tr>
    `;

    const keys = ['P', 'S', 'K', 'Ca', 'pH', 'EC', 'OC'];
    let html = '';
  keys.forEach(k => {
      const s = data.results.statuses?.[k];
      if (s) {
        const cls = s.status === 'low' ? 'status-low' : s.status === 'excess' ? 'status-excess' : 'status-adequate';
        html += `
          <tr>
            <td><strong>${k}</strong></td>
            <td>${data.inputs[k]?.toFixed(2) || 'N/A'}</td>
            <td>${data.ref[k]?.toFixed(2) || 'N/A'}</td>
            <td>${s.pct}%</td>
            <td class="${cls}">${s.status.toUpperCase()}</td>
          </tr>
        `;
      }
    });
    tbody.innerHTML = html;

    // Full Report
    const report = document.getElementById('report');
    const reportLines = [];
    
    reportLines.push(`
      <div class="report-section">
        <h4>Executive Summary</h4>
        <p>This analytical report presents a comprehensive assessment of soil parameters based on ${data.preset} reference standards. The analysis covers macronutrients, pH levels, electrical conductivity, and organic carbon content.</p>
      </div>
    `);

    reportLines.push(`
      <div class="report-section">
        <h4>Parameter Analysis</h4>
        ${keys.map(k => {
          const s = data.results.statuses?.[k];
          if (s) {
            const statusText = s.status === 'low' ? 'below optimal levels' : s.status === 'excess' ? 'above optimal levels' : 'within optimal range';
            return `<p><strong>${k}:</strong> Measured value of ${data.inputs[k]?.toFixed(2) || 'N/A'} compared to reference ${data.ref[k]?.toFixed(2) || 'N/A'} (${s.pct}%). Status: ${statusText}.</p>`;
          }
          return '';
        }).join('')}
      </div>
    `);

    reportLines.push(`
      <div class="report-section">
        <h4>Soil Classification</h4>
        <p><strong>pH Classification:</strong> ${data.results.classification?.phClass || 'N/A'}</p>
        <p><strong>Organic Carbon Classification:</strong> ${data.results.classification?.ocClass || 'N/A'}</p>
        <p><strong>Soil Type:</strong> ${data.results.classification?.soilType || 'N/A'}</p>
        <p><strong>Overall Quality Score:</strong> ${data.results.classification?.score || 0}/100</p>
      </div>
    `);

    if (data.results.suggestions && data.results.suggestions.length > 0) {
      reportLines.push(`
        <div class="report-section">
          <h4>Recommendations</h4>
          <p>The following amendments are suggested to optimize soil health:</p>
          <ul style="margin-left: 20px; line-height: 2;">
            ${data.results.suggestions.map(s => `<li>Add ${s.amount} ${s.unit} of ${s.item}</li>`).join('')}
          </ul>
        </div>
      `);
    }

    report.innerHTML = reportLines.join('');

    // Classification Explanation
    const clsExplain = document.getElementById('classExplain');
    clsExplain.innerHTML = `
      <div class="summary-item">
        <h4>Understanding Soil Classification</h4>
        <p><strong>pH Class:</strong> Soil pH measures acidity or alkalinity on a scale of 0-14. Most crops prefer slightly acidic to neutral soils (6.0-7.5). pH affects nutrient availability and microbial activity.</p>
        <p><strong>OC Class:</strong> Organic Carbon indicates soil organic matter content. Higher OC improves water retention, nutrient cycling, and soil structure. Optimal range is typically 0.5-1.0%.</p>
        <p><strong>Soil Type:</strong> Classification based on pH, EC, and other factors. Normal soils support most crops. Saline soils have high salt content. Sodic soils have high sodium levels affecting structure.</p>
        <p><strong>Quality Score:</strong> Overall assessment (0-100) based on parameter adequacy. Higher scores indicate better soil health and nutrient balance.</p>
      </div>
    `;
  } catch (error) {
    console.error('Error loading results:', error);
    document.getElementById('summary').innerHTML = '<p style="color: #b00020;">Error loading session data.</p>';
  }
}

// PDF Export
document.getElementById('exportPDF').addEventListener('click', () => {
  const raw = localStorage.getItem('agriSession');
  if (!raw) {
    showPopup('No session data to export');
    return;
  }

  try {
    const data = JSON.parse(raw);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AgriPulse Analytical Report', 14, y);
    y += 10;

    // Header Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Date: ${new Date(data.timestamp || Date.now()).toLocaleDateString()}`, 14, y);
    y += 7;
    doc.text(`Preset: ${data.preset.charAt(0).toUpperCase() + data.preset.slice(1)}`, 14, y);
    y += 7;
    doc.text(`Quality Score: ${data.results.classification?.score || 0}/100`, 14, y);
    y += 10;

    // Parameters Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Parameter Analysis', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Parameter', 14, y);
    doc.text('Input', 60, y);
    doc.text('Reference', 90, y);
    doc.text('%', 130, y);
    doc.text('Status', 145, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    const keys = ['P', 'S', 'K', 'Ca', 'pH', 'EC', 'OC'];
  keys.forEach(k => {
      const s = data.results.statuses?.[k];
      if (s) {
        doc.text(k, 14, y);
        doc.text((data.inputs[k] || 0).toFixed(2).toString(), 60, y);
        doc.text((data.ref[k] || 0).toFixed(2).toString(), 90, y);
        doc.text(`${s.pct}%`, 130, y);
        doc.text(s.status.toUpperCase(), 145, y);
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }
    });

    y += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Soil Classification', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`pH Class: ${data.results.classification?.phClass || 'N/A'}`, 14, y);
    y += 6;
    doc.text(`OC Class: ${data.results.classification?.ocClass || 'N/A'}`, 14, y);
    y += 6;
    doc.text(`Soil Type: ${data.results.classification?.soilType || 'N/A'}`, 14, y);
    y += 10;

    if (data.results.suggestions && data.results.suggestions.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 14, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      data.results.suggestions.forEach(s => {
        doc.text(`Add ${s.amount} ${s.unit} of ${s.item}`, 20, y);
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save(`AgriPulse_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showPopup('PDF exported successfully!');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    showPopup('Error exporting PDF');
  }
});

// Build Global Data Table
function buildGlobalTable() {
  const tbody = document.querySelector('#globalTable tbody');
  const d = refs.dayalbagh;
  const g = refs.global;
  const rows = ['P', 'S', 'K', 'Ca', 'pH', 'EC', 'OC'];

  let html = '';
  rows.forEach(k => {
    const note = nutrientNotes[k] || 'No additional information';
    html += `
      <tr>
        <td>
          <strong>${k}</strong>
          <span class="info-icon" title="${note}">i</span>
        </td>
        <td>${g[k].toFixed(2)}${k === 'pH' ? '' : k === 'EC' ? ' dS/m' : k === 'OC' ? ' %' : ' mg/kg'}</td>
        <td>${d[k].toFixed(2)}${k === 'pH' ? '' : k === 'EC' ? ' dS/m' : k === 'OC' ? ' %' : ' mg/kg'}</td>
        <td class="note-cell">${note}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Feedback Form
function feedbackInit() {
  const form = document.getElementById('feedbackForm');
  const clear = document.getElementById('fbClear');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const entry = {
      name: document.getElementById('fbName').value.trim(),
      email: document.getElementById('fbEmail').value.trim(),
      message: document.getElementById('fbMessage').value.trim(),
      timestamp: new Date().toISOString()
    };

    const raw = localStorage.getItem('agriFeedback');
    const list = raw ? JSON.parse(raw) : [];
    list.push(entry);
    localStorage.setItem('agriFeedback', JSON.stringify(list));
    
    showPopup('Feedback saved successfully!');
    form.reset();
  });

  clear.addEventListener('click', () => {
    form.reset();
  });
}

// Show Popup
function showPopup(message) {
  const popup = document.getElementById('popup');
  popup.textContent = message;
  popup.classList.add('show');
  setTimeout(() => {
    popup.classList.remove('show');
  }, 2000);
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  buildGlobalTable();
  feedbackInit();
  
  // Load saved session if exists
  const saved = localStorage.getItem('agriSession');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.preset = data.preset || 'manual';
      state.inputs = data.inputs || state.inputs;
      state.ref = data.ref || {};
      state.results = data.results || {};
      state.plan = data.plan || [];
      
      if (state.preset !== 'manual') {
        document.getElementById('presetSelect').value = state.preset;
        fillInputs(state.ref);
      }
    } catch (error) {
      console.error('Error loading saved session:', error);
    }
  }
  
  // Handle window resize for charts
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (state.results.statuses) {
        drawBar();
        drawRadar();
      }
    }, 250);
  });
});
