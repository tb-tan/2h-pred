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
    
    // Accuracy (was Win Rate)
    const winRate = completed.length > 0 ? (won.length / completed.length * 100).toFixed(1) : 0;
    document.getElementById('win-rate').textContent = winRate + '%';
}

// Display upcoming predictions (pending results)
function displayUpcomingPredictions(predictions) {
    const container = document.getElementById('upcoming-predictions');
    const upcoming = predictions
        .filter(p => p.result === 'pending')
        .reverse(); // Show newest first
    
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
        .reverse() // Show newest first
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
    // Handle result badge and score display
    let resultBadge = '';
    
    if (pred.result === 'pending') {
        // For pending matches, show HT score
        const htScore = pred.score ? `<div class="score-display">HT: ${pred.score}</div>` : '';
        resultBadge = `<span class="result-badge pending">⏳ Pending</span>${htScore}`;
    } else if (pred.result === 'win') {
        // For completed matches, format the score properly
        let scoreDisplay = '';
        if (pred.score) {
            // If score already has (HT: or (FT: format, show as-is with Final: prefix
            if (pred.score.includes('(HT:') || pred.score.includes('(FT:')) {
                scoreDisplay = `<div class="score-display">Final: ${pred.score.replace('(FT:', '(HT:')}</div>`;
            } else {
                // Otherwise just show the score
                scoreDisplay = `<div class="score-display">Final: ${pred.score}</div>`;
            }
        }
        resultBadge = `<span class="result-badge win">✓ Won</span>${scoreDisplay}`;
    } else {
        // For losses, format the score properly
        let scoreDisplay = '';
        if (pred.score) {
            // If score already has (HT: or (FT: format, show as-is with Final: prefix
            if (pred.score.includes('(HT:') || pred.score.includes('(FT:')) {
                scoreDisplay = `<div class="score-display">Final: ${pred.score.replace('(FT:', '(HT:')}</div>`;
            } else {
                // Otherwise just show the score
                scoreDisplay = `<div class="score-display">Final: ${pred.score}</div>`;
            }
        }
        resultBadge = `<span class="result-badge loss">✗ Lost</span>${scoreDisplay}`;
    }
    
    const analysisHTML = pred.analysis && pred.analysis.length > 0
        ? `<ul class="analysis-points">
            ${pred.analysis.map(point => `<li>${point}</li>`).join('')}
           </ul>`
        : '';
    
    // Show threshold if it exists and probability is below it
    const probabilityDisplay = pred.threshold && pred.probability < pred.threshold
        ? `<div class="probability-badge low-prob">
             <div style="font-size: 1.5rem;">${pred.probability}%</div>
             <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">threshold: ${pred.threshold}%</div>
           </div>`
        : `<div class="probability-badge">${pred.probability}%</div>`;
    
    return `
        <div class="prediction-card">
            <div class="prediction-header">
                <div class="match-info">
                    <h3>${pred.match}</h3>
                    <div class="match-meta">${pred.date} • ${pred.league}</div>
                </div>
                ${probabilityDisplay}
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