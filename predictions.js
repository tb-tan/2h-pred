// predictions.js - Loads and displays your predictions

// Load predictions from data file
async function loadPredictions() {
    try {
        const response = await fetch('predictions-data.json');
        const data = await response.json();
        
        updateStats(data.predictions);
        displayUpcomingPredictions(data.predictions);
        displayRecentPredictions(data.predictions);
    } catch (error) {
        console.error('Error loading predictions:', error);
        showEmptyState();
    }
}

// Calculate and update statistics
function updateStats(predictions) {
    const completed = predictions.filter(p => p.result !== 'pending');
    const won = completed.filter(p => p.result === 'win');
    
    // Total picks
    document.getElementById('total-picks').textContent = completed.length;
    
    // Win rate
    const winRate = completed.length > 0 ? (won.length / completed.length * 100).toFixed(1) : 0;
    document.getElementById('win-rate').textContent = winRate + '%';
    
    // Calculate net correct (wins minus losses)
    const netCorrect = won.length - (completed.length - won.length);
    
    // Net Correct
    const netCorrectElement = document.getElementById('net-correct');
    const netCorrectText = (netCorrect >= 0 ? '+' : '') + netCorrect;
    netCorrectElement.textContent = netCorrectText;
    netCorrectElement.className = 'stat-value ' + (netCorrect < 0 ? 'negative' : '');
}

// Display upcoming predictions (pending results)
function displayUpcomingPredictions(predictions) {
    const container = document.getElementById('upcoming-predictions');
    const upcoming = predictions.filter(p => p.result === 'pending');
    
    if (upcoming.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No pending predictions</h3>
                <p>Check back during match days for live half-time predictions</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = upcoming.map(pred => createPredictionCard(pred)).join('');
}

// Display recent predictions with results
function displayRecentPredictions(predictions) {
    const container = document.getElementById('recent-predictions');
    const recent = predictions
        .filter(p => p.result !== 'pending')
        .slice(0, 10); // Show last 10
    
    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Building track record...</h3>
                <p>Results will appear here as predictions are settled</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recent.map(pred => createPredictionCard(pred)).join('');
}

// Create HTML for a prediction card
function createPredictionCard(pred) {
    const resultBadge = pred.result === 'pending' 
        ? '<span class="result-badge pending">⏳ Pending</span>'
        : pred.result === 'win'
        ? `<span class="result-badge win">✓ Won</span>${pred.score ? `<div class="score-display">Final: ${pred.score}</div>` : ''}`
        : `<span class="result-badge loss">✗ Lost</span>${pred.score ? `<div class="score-display">Final: ${pred.score}</div>` : ''}`;
    
    const analysisHTML = pred.analysis && pred.analysis.length > 0
        ? `<ul class="analysis-points">
            ${pred.analysis.map(point => `<li>${point}</li>`).join('')}
           </ul>`
        : '';
    
    return `
        <div class="prediction-card">
            <div class="prediction-header">
                <div class="match-info">
                    <h3>${pred.match}</h3>
                    <div class="match-meta">${pred.date} • ${pred.league}</div>
                </div>
                <div class="probability-badge">${pred.probability}%</div>
            </div>
            <div class="prediction-content">
                <div class="prediction-type">${pred.prediction}</div>
                ${analysisHTML}
                ${resultBadge}
            </div>
        </div>
    `;
}

// Show empty state if no data loads
function showEmptyState() {
    document.getElementById('upcoming-predictions').innerHTML = `
        <div class="empty-state">
            <h3>Loading predictions...</h3>
            <p>If this persists, check that predictions-data.json is configured correctly</p>
        </div>
    `;
}

// Load predictions when page loads
document.addEventListener('DOMContentLoaded', loadPredictions);
