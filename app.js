/**
 * Rate & Equity Dynamics - Interactive Visualizer & Math Engine
 * Mathematical demonstration of why interest rate hikes reduce stock valuations.
 */

// ============================================================================
// State Management & Constants
// ============================================================================
const state = {
    theme: 'dark',
    // Chapter 2 Gordon Model
    ch2: {
        rf: 0.03,      // 3.0%
        erp: 0.05,    // 5.0%
        g: 0.03,      // 3.0%
        d1: 5.0       // $5.00
    },
    // Chapter 5 Unified Simulator
    sim: {
        rf: 0.035,    // 3.5%
        erp: 0.05,    // 5.0%
        beta: 1.20,   // 1.20
        g: 0.04,      // 4.0%
        cf: 10.0,     // $10.00
        delta: 0.015  // +1.50%
    }
};

// Preset Scenarios
const PRESETS = {
    baseline: {
        rf: 0.03, erp: 0.05, g: 0.03, d1: 5.0,
        simRf: 0.035, simErp: 0.05, simBeta: 1.0, simG: 0.035, simCf: 10.0, simDelta: 0.015
    },
    hike2022: {
        rf: 0.045, erp: 0.055, g: 0.025, d1: 4.5,
        simRf: 0.01, simErp: 0.05, simBeta: 1.4, simG: 0.04, simCf: 10.0, simDelta: 0.035
    },
    bubbleZero: {
        rf: 0.005, erp: 0.045, g: 0.04, d1: 5.0,
        simRf: 0.005, simErp: 0.045, simBeta: 1.1, simG: 0.045, simCf: 10.0, simDelta: 0.02
    },
    growthTech: {
        rf: 0.035, erp: 0.05, g: 0.055, d1: 3.0,
        simRf: 0.025, simErp: 0.05, simBeta: 1.8, simG: 0.06, simCf: 8.0, simDelta: 0.02
    },
    stagflation: {
        rf: 0.06, erp: 0.065, g: 0.01, d1: 4.0,
        simRf: 0.05, simErp: 0.065, simBeta: 1.0, simG: 0.01, simCf: 10.0, simDelta: 0.02
    }
};

// Global Chart Instances
let gordonCurveChart = null;
let cashflowBarChart = null;
let durationCompareChart = null;
let perCurveChart = null;

// ============================================================================
// Mathematical Helper Functions
// ============================================================================

/**
 * Gordon Growth Theoretical Price: P = D1 / (r - g)
 * r = rf + beta * erp
 */
function calcGordonPrice(rf, erp, beta, g, d1) {
    const r = rf + (beta * erp);
    const spread = r - g;
    if (spread <= 0.002) return 1000; // Cap to prevent division by zero / negative infinity
    return d1 / spread;
}

/**
 * 1st Derivative: dP/dr = - D1 / (r - g)^2
 */
function calcGordonDerivative(rf, erp, beta, g, d1) {
    const r = rf + (beta * erp);
    const spread = r - g;
    if (spread <= 0.002) return -10000;
    return -d1 / Math.pow(spread, 2);
}

/**
 * Equity Duration: D ≈ 1 / (r - g)
 */
function calcEquityDuration(rf, erp, beta, g) {
    const r = rf + (beta * erp);
    const spread = r - g;
    if (spread <= 0.002) return 100;
    return 1 / spread;
}

/**
 * Fair PER = 1 / (r - g)
 */
function calcFairPER(rf, erp, beta, g) {
    return calcEquityDuration(rf, erp, beta, g);
}

// ============================================================================
// Chart Initialization & Updates
// ============================================================================

function getChartColors() {
    const isDark = document.body.classList.contains('dark-theme');
    return {
        text: isDark ? '#9ca3af' : '#475569',
        grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        primary: '#6366f1',
        primaryLight: '#818cf8',
        cyan: '#06b6d4',
        rose: '#f43f5e',
        amber: '#f59e0b',
        emerald: '#10b981',
        tooltipBg: isDark ? 'rgba(18, 24, 38, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        tooltipText: isDark ? '#f3f4f6' : '#0f172a'
    };
}

/**
 * Initialize Chapter 2: Gordon Curve Chart
 */
function initGordonCurveChart() {
    const ctx = document.getElementById('gordonCurveChart').getContext('2d');
    const colors = getChartColors();

    const rfPoints = [];
    for (let r = 0.5; r <= 10.0; r += 0.25) {
        rfPoints.push(r / 100);
    }

    gordonCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: rfPoints.map(r => (r * 100).toFixed(1) + '%'),
            datasets: [
                {
                    label: '理論株価 P(rf)',
                    data: [],
                    borderColor: colors.cyan,
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: '接線 (感応度・微分係数)',
                    data: [],
                    borderColor: colors.rose,
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: '現在の動作点',
                    data: [],
                    borderColor: '#ffffff',
                    backgroundColor: colors.rose,
                    pointRadius: 6,
                    pointHoverRadius: 9,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: { color: colors.text, font: { family: 'Inter', size: 11 } }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw?.toFixed(2) || 'N/A'}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: '無リスク金利 rf (%)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text, maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: '理論株価 ($)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: {
                        color: colors.text,
                        callback: val => '$' + val
                    },
                    suggestedMin: 0,
                    suggestedMax: 250
                }
            }
        }
    });

    updateGordonCurveChart();
}

/**
 * Update Chapter 2 Chart Data
 */
function updateGordonCurveChart() {
    if (!gordonCurveChart) return;
    const colors = getChartColors();
    const { rf, erp, g, d1 } = state.ch2;

    const rfPoints = [];
    for (let r = 0.5; r <= 10.0; r += 0.25) {
        rfPoints.push(r / 100);
    }

    // 1. Calculate P(r) curve
    const curveData = rfPoints.map(r_val => {
        const p = calcGordonPrice(r_val, erp, 1.0, g, d1);
        return Math.min(Math.max(p, 0), 400); // Bound for visual stability
    });

    // 2. Current active point
    const currentP = calcGordonPrice(rf, erp, 1.0, g, d1);
    const slope = calcGordonDerivative(rf, erp, 1.0, g, d1);

    // 3. Tangent line around active point: T(r) = P(rf) + dP/dr * (r - rf)
    const tangentData = rfPoints.map(r_val => {
        if (Math.abs(r_val - rf) > 0.035) return null; // local range
        const tVal = currentP + slope * (r_val - rf);
        return tVal > 0 ? tVal : 0;
    });

    // 4. Current Point marker
    const pointData = rfPoints.map(r_val => {
        if (Math.abs(r_val - rf) < 0.001) {
            return currentP;
        }
        return null;
    });

    gordonCurveChart.data.datasets[0].data = curveData;
    gordonCurveChart.data.datasets[1].data = tangentData;
    gordonCurveChart.data.datasets[2].data = pointData;
    gordonCurveChart.update();

    // Update metrics in HTML
    const totalR = rf + erp;
    const spread = totalR - g;
    const slopePerOnePercent = slope * 0.01;
    const slopePct = (slopePerOnePercent / currentP) * 100;

    document.getElementById('totalDiscountRate').textContent = (totalR * 100).toFixed(2) + '%';
    document.getElementById('spreadRate').textContent = (spread * 100).toFixed(2) + '%';
    document.getElementById('calcPrice').textContent = '$' + currentP.toFixed(2);
    document.getElementById('calcSlope').textContent = `-$${Math.abs(slopePerOnePercent).toFixed(2)} (${slopePct.toFixed(1)}%)`;
    document.getElementById('currentPointBadge').textContent = `金利: ${(rf * 100).toFixed(1)}% → 株価: $${currentP.toFixed(2)}`;
}

/**
 * Initialize Chapter 3: Cash Flow Discounting Bar Chart
 */
function initCashflowBarChart() {
    const ctx = document.getElementById('cashflowBarChart').getContext('2d');
    const colors = getChartColors();

    const years = Array.from({ length: 20 }, (_, i) => `${i + 1}年後`);
    const initialCF = 10;
    const growth = 0.03;

    // Rate before hike (r = 5%) vs Rate after hike (r = 8%)
    const rBefore = 0.05;
    const rAfter = 0.08;

    const cfBefore = [];
    const cfAfter = [];

    for (let t = 1; t <= 20; t++) {
        const nominalCF = initialCF * Math.pow(1 + growth, t);
        cfBefore.push(nominalCF / Math.pow(1 + rBefore, t));
        cfAfter.push(nominalCF / Math.pow(1 + rAfter, t));
    }

    cashflowBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: '利上げ前 (割引率 5.0%)',
                    data: cfBefore,
                    backgroundColor: 'rgba(99, 102, 241, 0.85)',
                    borderRadius: 4
                },
                {
                    label: '利上げ後 (割引率 8.0%)',
                    data: cfAfter,
                    backgroundColor: 'rgba(244, 63, 94, 0.85)',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: context => `${context.dataset.label}: $${context.raw.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: colors.text, maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: '現在価値 PV ($)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text, callback: val => '$' + val }
                }
            }
        }
    });
}

/**
 * Initialize Chapter 3: Duration Growth vs Value Comparison Chart
 */
function initDurationCompareChart() {
    const ctx = document.getElementById('durationCompareChart').getContext('2d');
    const colors = getChartColors();

    const hikeRates = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]; // hike steps in %

    // Baseline:
    // Value stock: g = 1.5%, r0 = 8.0% -> P0 = 10 / (0.08 - 0.015) = 153.8, Duration = 1 / 0.065 = 15.4 yr
    // Growth stock: g = 6.0%, r0 = 8.0% -> P0 = 10 / (0.08 - 0.06) = 500, Duration = 1 / 0.02 = 50 yr
    const valG = 0.015;
    const growthG = 0.06;
    const baseR = 0.08;

    const valP0 = 10 / (baseR - valG);
    const growthP0 = 10 / (baseR - growthG);

    const valDrops = hikeRates.map(dh => {
        const newR = baseR + (dh / 100);
        const newP = 10 / (newR - valG);
        return ((newP - valP0) / valP0) * 100;
    });

    const growthDrops = hikeRates.map(dh => {
        const newR = baseR + (dh / 100);
        const newP = 10 / (newR - growthG);
        return ((newP - growthP0) / growthP0) * 100;
    });

    durationCompareChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hikeRates.map(dh => `+${dh.toFixed(1)}%`),
            datasets: [
                {
                    label: 'バリュー株 下落率 (%)',
                    data: valDrops,
                    borderColor: colors.emerald,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    fill: false,
                    tension: 0.3,
                    borderWidth: 3,
                    pointRadius: 4
                },
                {
                    label: 'グロース株 下落率 (%)',
                    data: growthDrops,
                    borderColor: colors.rose,
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    fill: false,
                    tension: 0.3,
                    borderWidth: 3,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: colors.text, font: { family: 'Inter', size: 11 } }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: context => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: '政策金利 引き上げ幅 (Δr)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                y: {
                    title: { display: true, text: '株価騰落率 (%)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text, callback: val => val + '%' },
                    suggestedMin: -60,
                    suggestedMax: 0
                }
            }
        }
    });
}

/**
 * Initialize Chapter 4: PER Multiple Compression Chart
 */
function initPerCurveChart() {
    const ctx = document.getElementById('perCurveChart').getContext('2d');
    const colors = getChartColors();

    const rfRates = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0];
    const erp = 0.05;
    const g = 0.02;

    const perData = rfRates.map(rf => {
        const denom = (rf / 100) + erp - g;
        return denom > 0 ? (1 / denom) : 0;
    });

    perCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: rfRates.map(r => `${r.toFixed(1)}%`),
            datasets: [
                {
                    label: '理論適正 PER (倍率)',
                    data: perData,
                    borderColor: colors.primaryLight,
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: context => `適正PER: ${context.raw.toFixed(1)} 倍`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: '無リスク金利 rf (%)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                y: {
                    title: { display: true, text: '適正PER (株価収益率倍率)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text, callback: val => val + 'x' },
                    suggestedMin: 5,
                    suggestedMax: 35
                }
            }
        }
    });
}

// ============================================================================
// Chapter 5: Unified Simulator Engine & Sensitivity Matrix
// ============================================================================

function updateUnifiedSimulator() {
    const { rf, erp, beta, g, cf, delta } = state.sim;

    // 1. Base State Calculation
    const rBase = rf + (beta * erp);
    const pBase = calcGordonPrice(rf, erp, beta, g, cf);
    const perBase = calcFairPER(rf, erp, beta, g);
    const durBase = calcEquityDuration(rf, erp, beta, g);

    // 2. Shock State Calculation (Post Hike)
    const rfShock = rf + delta;
    const rShock = rfShock + (beta * erp);
    const pShock = calcGordonPrice(rfShock, erp, beta, g, cf);
    const perShock = calcFairPER(rfShock, erp, beta, g);
    const durShock = calcEquityDuration(rfShock, erp, beta, g);

    // 3. Impacts
    const deltaPrice = pShock - pBase;
    const pctChange = ((pShock - pBase) / pBase) * 100;

    // Update DOM elements
    document.getElementById('resBaseRate').textContent = (rf * 100).toFixed(2) + '%';
    document.getElementById('resBasePrice').textContent = '$' + pBase.toFixed(2);
    document.getElementById('resBaseDiscount').textContent = (rBase * 100).toFixed(2) + '%';
    document.getElementById('resBasePER').textContent = perBase.toFixed(1) + '倍';
    document.getElementById('resBaseDuration').textContent = durBase.toFixed(1) + '年';

    document.getElementById('resShockTag').textContent = `+${(delta * 100).toFixed(2)}% 利上げ`;
    document.getElementById('resShockRate').textContent = (rfShock * 100).toFixed(2) + '%';
    document.getElementById('resShockPrice').textContent = '$' + pShock.toFixed(2);
    document.getElementById('resShockDiscount').textContent = (rShock * 100).toFixed(2) + '%';
    document.getElementById('resShockPER').textContent = perShock.toFixed(1) + '倍';
    document.getElementById('resShockDuration').textContent = durShock.toFixed(1) + '年';

    document.getElementById('resPriceChange').textContent = (deltaPrice >= 0 ? '+' : '') + '$' + deltaPrice.toFixed(2);
    document.getElementById('resPercentChange').textContent = `${pctChange.toFixed(2)}% ${pctChange < 0 ? '下落' : '上昇'}`;

    let noteText = '';
    const absPct = Math.abs(pctChange);
    if (absPct >= 40) {
        noteText = '深刻なバリュエーション崩壊（グロースショック級）';
    } else if (absPct >= 20) {
        noteText = '株式価値の約 1/4〜1/5 が消失する大幅調整';
    } else if (absPct >= 10) {
        noteText = '一般的な金融引き締めサイクルの調整幅';
    } else {
        noteText = '比較的軽微な価格変動';
    }
    document.getElementById('resImpactNote').textContent = noteText;

    // Render Sensitivity Heatmap Matrix
    renderSensitivityTable(rf, erp, beta, cf);
}

function renderSensitivityTable(currentRf, erp, beta, cf) {
    const table = document.getElementById('sensitivityTable');
    const rfHeaders = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]; // rf in %
    const gRows = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];          // g in %

    let html = '<thead><tr><th>成長率 g \\ 金利 rf</th>';
    rfHeaders.forEach(rfVal => {
        html += `<th>${rfVal.toFixed(1)}%</th>`;
    });
    html += '</tr></thead><tbody>';

    gRows.forEach(gVal => {
        html += `<tr><th><strong>g = ${gVal.toFixed(1)}%</strong></th>`;
        rfHeaders.forEach(rfVal => {
            const rf_dec = rfVal / 100;
            const g_dec = gVal / 100;
            const p = calcGordonPrice(rf_dec, erp, beta, g_dec, cf);
            
            // Highlight current cell
            const isCurrent = Math.abs(currentRf - rf_dec) < 0.006 && Math.abs(state.sim.g - g_dec) < 0.006;
            const cellClass = isCurrent ? 'class="current-cell"' : '';

            // Color coding based on price
            let bgStyle = '';
            if (p > 250) {
                bgStyle = 'background: rgba(16, 185, 129, 0.2); color: #34d399;';
            } else if (p < 90) {
                bgStyle = 'background: rgba(244, 63, 94, 0.2); color: #fb7185;';
            }

            html += `<td ${cellClass} style="${bgStyle}">$${p.toFixed(1)}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
}

// ============================================================================
// Event Listeners & Preset Handling
// ============================================================================

function bindEventListeners() {
    // Chapter 2 Gordon Model Sliders
    const rfInput = document.getElementById('rfInput');
    const erpInput = document.getElementById('erpInput');
    const gInput = document.getElementById('gInput');
    const d1Input = document.getElementById('d1Input');

    rfInput.addEventListener('input', (e) => {
        state.ch2.rf = parseFloat(e.target.value) / 100;
        document.getElementById('rfVal').textContent = parseFloat(e.target.value).toFixed(1) + '%';
        updateGordonCurveChart();
    });

    erpInput.addEventListener('input', (e) => {
        state.ch2.erp = parseFloat(e.target.value) / 100;
        document.getElementById('erpVal').textContent = parseFloat(e.target.value).toFixed(1) + '%';
        updateGordonCurveChart();
    });

    gInput.addEventListener('input', (e) => {
        state.ch2.g = parseFloat(e.target.value) / 100;
        document.getElementById('gVal').textContent = parseFloat(e.target.value).toFixed(1) + '%';
        updateGordonCurveChart();
    });

    d1Input.addEventListener('input', (e) => {
        state.ch2.d1 = parseFloat(e.target.value);
        document.getElementById('d1Val').textContent = '$' + parseFloat(e.target.value).toFixed(2);
        updateGordonCurveChart();
    });

    // Chapter 5 Unified Simulator Sliders
    const simRf = document.getElementById('simRf');
    const simErp = document.getElementById('simErp');
    const simBeta = document.getElementById('simBeta');
    const simG = document.getElementById('simG');
    const simCf = document.getElementById('simCf');
    const simDelta = document.getElementById('simDelta');

    simRf.addEventListener('input', (e) => {
        state.sim.rf = parseFloat(e.target.value) / 100;
        document.getElementById('simRfVal').textContent = parseFloat(e.target.value).toFixed(2) + '%';
        updateUnifiedSimulator();
    });

    simErp.addEventListener('input', (e) => {
        state.sim.erp = parseFloat(e.target.value) / 100;
        document.getElementById('simErpVal').textContent = parseFloat(e.target.value).toFixed(2) + '%';
        updateUnifiedSimulator();
    });

    simBeta.addEventListener('input', (e) => {
        state.sim.beta = parseFloat(e.target.value);
        document.getElementById('simBetaVal').textContent = parseFloat(e.target.value).toFixed(2);
        updateUnifiedSimulator();
    });

    simG.addEventListener('input', (e) => {
        state.sim.g = parseFloat(e.target.value) / 100;
        document.getElementById('simGVal').textContent = parseFloat(e.target.value).toFixed(2) + '%';
        updateUnifiedSimulator();
    });

    simCf.addEventListener('input', (e) => {
        state.sim.cf = parseFloat(e.target.value);
        document.getElementById('simCfVal').textContent = '$' + parseFloat(e.target.value).toFixed(1);
        updateUnifiedSimulator();
    });

    simDelta.addEventListener('input', (e) => {
        state.sim.delta = parseFloat(e.target.value) / 100;
        document.getElementById('simDeltaVal').textContent = '+' + parseFloat(e.target.value).toFixed(2) + '%';
        updateUnifiedSimulator();
    });

    // Preset Buttons
    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const presetKey = btn.getAttribute('data-preset');
            applyPreset(presetKey);
        });
    });

    // Theme Toggle Button
    const themeBtn = document.getElementById('themeToggle');
    themeBtn.addEventListener('click', toggleTheme);
}

function applyPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;

    // Apply to Chapter 2
    state.ch2.rf = p.rf;
    state.ch2.erp = p.erp;
    state.ch2.g = p.g;
    state.ch2.d1 = p.d1;

    document.getElementById('rfInput').value = (p.rf * 100).toFixed(1);
    document.getElementById('rfVal').textContent = (p.rf * 100).toFixed(1) + '%';
    document.getElementById('erpInput').value = (p.erp * 100).toFixed(1);
    document.getElementById('erpVal').textContent = (p.erp * 100).toFixed(1) + '%';
    document.getElementById('gInput').value = (p.g * 100).toFixed(1);
    document.getElementById('gVal').textContent = (p.g * 100).toFixed(1) + '%';
    document.getElementById('d1Input').value = p.d1.toFixed(1);
    document.getElementById('d1Val').textContent = '$' + p.d1.toFixed(2);

    updateGordonCurveChart();

    // Apply to Simulator
    state.sim.rf = p.simRf;
    state.sim.erp = p.simErp;
    state.sim.beta = p.simBeta;
    state.sim.g = p.simG;
    state.sim.cf = p.simCf;
    state.sim.delta = p.simDelta;

    document.getElementById('simRf').value = (p.simRf * 100).toFixed(2);
    document.getElementById('simRfVal').textContent = (p.simRf * 100).toFixed(2) + '%';
    document.getElementById('simErp').value = (p.simErp * 100).toFixed(2);
    document.getElementById('simErpVal').textContent = (p.simErp * 100).toFixed(2) + '%';
    document.getElementById('simBeta').value = p.simBeta.toFixed(2);
    document.getElementById('simBetaVal').textContent = p.simBeta.toFixed(2);
    document.getElementById('simG').value = (p.simG * 100).toFixed(2);
    document.getElementById('simGVal').textContent = (p.simG * 100).toFixed(2) + '%';
    document.getElementById('simCf').value = p.simCf.toFixed(1);
    document.getElementById('simCfVal').textContent = '$' + p.simCf.toFixed(1);
    document.getElementById('simDelta').value = (p.simDelta * 100).toFixed(2);
    document.getElementById('simDeltaVal').textContent = '+' + (p.simDelta * 100).toFixed(2) + '%';

    updateUnifiedSimulator();
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        state.theme = 'light';
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        state.theme = 'dark';
    }

    // Refresh charts with updated colors
    const colors = getChartColors();
    [gordonCurveChart, cashflowBarChart, durationCompareChart, perCurveChart].forEach(chart => {
        if (!chart) return;
        if (chart.options.scales.x) {
            chart.options.scales.x.ticks.color = colors.text;
            chart.options.scales.x.grid.color = colors.grid;
            if (chart.options.scales.x.title) chart.options.scales.x.title.color = colors.text;
        }
        if (chart.options.scales.y) {
            chart.options.scales.y.ticks.color = colors.text;
            chart.options.scales.y.grid.color = colors.grid;
            if (chart.options.scales.y.title) chart.options.scales.y.title.color = colors.text;
        }
        if (chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = colors.text;
        }
        chart.update();
    });

    updateUnifiedSimulator();
}

// ============================================================================
// Initialization on DOM Ready
// ============================================================================

function renderMathSafe() {
    if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    } else {
        setTimeout(renderMathSafe, 100);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. Render LaTeX Formulas with KaTeX
    renderMathSafe();

    // 3. Initialize All Charts
    initGordonCurveChart();
    initCashflowBarChart();
    initDurationCompareChart();
    initPerCurveChart();

    // 4. Initialize Unified Simulator
    updateUnifiedSimulator();

    // 5. Bind User Interaction Events
    bindEventListeners();
});
