// Recovery Safety Net MVP Application Logic
// Implements the 3 Must-Have Features:
// 1. Save recovery point before an AI change
// 2. List recent recovery points with time and short label
// 3. Restore selected recovery point in one clear action

const STORAGE_KEY = 'recovery_mvp_checkpoints';
const ACTIVE_STATE_KEY = 'recovery_mvp_active_state';

// Initial seed checkpoints matching the interview low-fi wireframe
const DEFAULT_CHECKPOINTS = [
  {
    id: 'cp-1',
    label: 'Before "Connect Video"',
    timestamp: 'Today 10:42 AM',
    rawTime: Date.now() - 3600000,
    notes: 'Working baseline: Story input and generator produce simulated preview without errors.',
    storyContent: 'A developer asked an AI assistant to make a minor styling tweak, but the video generator button stopped responding.',
    isWorking: true,
    affectedFiles: ['videoForm.js', 'videoService.js']
  },
  {
    id: 'cp-2',
    label: 'Before "update story form"',
    timestamp: 'Yesterday 4:18 PM',
    rawTime: Date.now() - 86400000,
    notes: 'Initial stable build: Minimal form with default template story.',
    storyContent: 'Initial draft: Once upon a time, a digital prototype worked flawlessly.',
    isWorking: true,
    affectedFiles: ['storyForm.html', 'index.js']
  }
];

// Current State
let activeProjectState = {
  label: 'Working Baseline (Latest AI Edits Active)',
  storyText: 'A developer asked an AI assistant to make a minor styling tweak, but the video generator button stopped responding.',
  isWorking: true,
  lastRestoredFrom: null
};

let selectedCheckpointForRestore = null;

// Initialize Storage
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHECKPOINTS));
  }
  const savedState = localStorage.getItem(ACTIVE_STATE_KEY);
  if (savedState) {
    try {
      activeProjectState = JSON.parse(savedState);
    } catch (e) {
      console.error('Error parsing active state', e);
    }
  }
}

function getCheckpoints() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCheckpoints(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  updateCheckpointBadge();
}

function saveActiveState() {
  localStorage.setItem(ACTIVE_STATE_KEY, JSON.stringify(activeProjectState));
  renderActiveStateUI();
}

// UI Elements
const screenProject = document.getElementById('screen-project');
const screenCheckpoints = document.getElementById('screen-checkpoints');
const screenReview = document.getElementById('screen-review');
const screenVerify = document.getElementById('screen-verify');

const checkpointsContainer = document.getElementById('checkpoints-container');
const checkpointBadge = document.getElementById('checkpoint-badge');
const currentStateLabel = document.getElementById('current-state-label');
const liveIndicator = document.getElementById('live-indicator');

const storyInput = document.getElementById('story-input');
const btnGenerate = document.getElementById('btn-generate-video');
const genSpinner = document.getElementById('gen-spinner');
const genText = document.getElementById('gen-text');
const videoOutputBox = document.getElementById('video-output-box');
const videoPreviewContent = document.getElementById('video-preview-content');
const btnSimulateBreak = document.getElementById('btn-simulate-break');

// Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 3000);
}

// Navigation between wireframe screens
function showScreen(screenId) {
  [screenProject, screenCheckpoints, screenReview, screenVerify].forEach(screen => {
    screen.classList.add('hidden');
  });
  if (screenId === 'project') screenProject.classList.remove('hidden');
  if (screenId === 'checkpoints') {
    renderCheckpointsList();
    screenCheckpoints.classList.remove('hidden');
  }
  if (screenId === 'review') screenReview.classList.remove('hidden');
  if (screenId === 'verify') screenVerify.classList.remove('hidden');
}

// Update Active Project UI
function renderActiveStateUI() {
  currentStateLabel.textContent = activeProjectState.label;
  storyInput.value = activeProjectState.storyText;

  if (activeProjectState.isWorking) {
    liveIndicator.className = 'inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800';
    liveIndicator.textContent = '● Working State';
    videoOutputBox.className = 'h-44 bg-gray-900 rounded flex flex-col items-center justify-center text-center p-4 text-white relative overflow-hidden';
    videoPreviewContent.innerHTML = `
      <div class="text-3xl">🎬</div>
      <div class="text-sm font-medium">Ready for generation</div>
      <div class="text-xs text-gray-400">Click "Generate Video" to test this feature</div>
    `;
  } else {
    liveIndicator.className = 'inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800';
    liveIndicator.textContent = '⚠️ Regression Detected (Broken)';
    videoOutputBox.className = 'h-44 bg-red-950 border border-red-800 rounded flex flex-col items-center justify-center text-center p-4 text-red-100 relative overflow-hidden';
    videoPreviewContent.innerHTML = `
      <div class="text-3xl">⚠️</div>
      <div class="text-sm font-bold text-red-200">Error 500: videoService.js: undefined method</div>
      <div class="text-xs text-red-300">Feature broke after AI edit! Use "Recent Checkpoints" to restore.</div>
    `;
  }
  updateCheckpointBadge();
}

function updateCheckpointBadge() {
  const count = getCheckpoints().length;
  if (checkpointBadge) checkpointBadge.textContent = count;
}

// Screen 2: Render Checkpoint List
function renderCheckpointsList() {
  const list = getCheckpoints();
  checkpointsContainer.innerHTML = '';

  if (list.length === 0) {
    checkpointsContainer.innerHTML = `
      <div class="p-8 text-center text-gray-500 border border-dashed rounded-lg">
        No saved checkpoints yet. Click "+ Save Recovery Point" above to save one.
      </div>
    `;
    return;
  }

  list.forEach(cp => {
    const card = document.createElement('div');
    card.className = 'border border-gray-300 hover:border-gray-900 rounded-lg p-4 bg-gray-50 transition space-y-3';
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full ${cp.isWorking ? 'bg-green-600' : 'bg-gray-400'}"></span>
            <span class="font-bold text-sm text-gray-900">${cp.label}</span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">${cp.timestamp}</p>
        </div>
        <span class="text-xs px-2 py-0.5 rounded font-mono bg-white border border-gray-200 text-gray-600">Verified Good</span>
      </div>
      <p class="text-xs text-gray-600 font-mono bg-white p-2 rounded border border-gray-100">
        ${cp.notes || 'No description entered'}
      </p>
      <div class="pt-1 flex justify-end">
        <button data-cp-id="${cp.id}" class="btn-review-cp text-xs font-semibold bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded transition">
          Review this Checkpoint &rarr;
        </button>
      </div>
    `;
    checkpointsContainer.appendChild(card);
  });

  // Attach review listeners
  document.querySelectorAll('.btn-review-cp').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-cp-id');
      const cp = getCheckpoints().find(item => item.id === id);
      if (cp) {
        selectedCheckpointForRestore = cp;
        openReviewScreen(cp);
      }
    });
  });
}

// Screen 3 & 4: Open Review & Confirm Restore
function openReviewScreen(cp) {
  document.getElementById('review-checkpoint-title').textContent = cp.label;
  document.getElementById('review-checkpoint-time').textContent = cp.timestamp;
  document.getElementById('review-checkpoint-desc').textContent = `Stored Snapshot State: "${cp.notes}"`;
  showScreen('review');
}

// Restore Action (1 Clear Action)
function executeRestore(cp) {
  activeProjectState.label = `Restored to: ${cp.label}`;
  activeProjectState.storyText = cp.storyContent || activeProjectState.storyText;
  activeProjectState.isWorking = true; // Returns to verified working state
  activeProjectState.lastRestoredFrom = cp.id;

  saveActiveState();
  showToast(`Successfully restored "${cp.label}"`);

  // Reset checkboxes on Screen 5
  document.getElementById('check-step-1').checked = false;
  document.getElementById('check-step-2').checked = false;
  document.getElementById('check-step-3').checked = false;

  // Move directly to verification screen (Screen 5)
  showScreen('verify');
}

// Simulate Generate Video Feature
function handleGenerateVideo() {
  if (!activeProjectState.isWorking) {
    showToast('❌ Generation Failed! Code broke in recent edit.');
    return;
  }

  btnGenerate.disabled = true;
  genSpinner.classList.remove('hidden');
  genText.textContent = 'Generating 3s Video...';

  setTimeout(() => {
    btnGenerate.disabled = false;
    genSpinner.classList.add('hidden');
    genText.textContent = 'Generate Video';

    videoPreviewContent.innerHTML = `
      <div class="text-4xl animate-bounce">✨</div>
      <div class="text-sm font-bold text-green-300">Generated Video Preview:</div>
      <div class="text-xs text-gray-200 italic max-w-sm">"${storyInput.value.substring(0, 75)}..."</div>
      <div class="text-xs text-green-400 mt-1">✓ Function verified working at 1080p</div>
    `;
    showToast('✓ Video generated successfully!');
  }, 900);
}

// EVENT LISTENERS

// Generate Button
btnGenerate.addEventListener('click', handleGenerateVideo);

// Break Simulator Button
btnSimulateBreak.addEventListener('click', () => {
  activeProjectState.isWorking = false;
  activeProjectState.label = 'Unverified AI Edit (Regression: videoService broken)';
  saveActiveState();
  showToast('⚠️ AI Edit Simulated: The video generator has stopped working!');
});

// Navigation Links
document.getElementById('btn-nav-checkpoints').addEventListener('click', () => showScreen('checkpoints'));
document.getElementById('btn-back-to-project-from-list').addEventListener('click', () => showScreen('project'));
document.getElementById('btn-back-to-list-from-review').addEventListener('click', () => showScreen('checkpoints'));
document.getElementById('btn-trigger-recovery-flow').addEventListener('click', () => showScreen('checkpoints'));
document.getElementById('btn-cancel-restore').addEventListener('click', () => showScreen('checkpoints'));

// Confirm Restore Action Button
document.getElementById('btn-confirm-restore-action').addEventListener('click', () => {
  if (selectedCheckpointForRestore) {
    executeRestore(selectedCheckpointForRestore);
  }
});

// Screen 5 Verification Buttons
document.getElementById('btn-still-broken').addEventListener('click', () => {
  showScreen('checkpoints');
});

document.getElementById('btn-checked-passed').addEventListener('click', () => {
  showToast('🎉 Verification complete! Returning to project.');
  showScreen('project');
});

// Save Modal Handling
const modalSave = document.getElementById('modal-save');
const btnOpenSaveModal = document.getElementById('btn-open-save-modal');
const btnCloseSaveModal = document.getElementById('btn-close-save-modal');
const btnCancelSave = document.getElementById('btn-cancel-save');
const btnConfirmSave = document.getElementById('btn-confirm-save');
const checkpointLabelInput = document.getElementById('checkpoint-label-input');
const checkpointNotesInput = document.getElementById('checkpoint-notes-input');

function openSaveModal() {
  checkpointLabelInput.value = '';
  checkpointNotesInput.value = '';
  modalSave.classList.remove('hidden');
  checkpointLabelInput.focus();
}

function closeSaveModal() {
  modalSave.classList.add('hidden');
}

btnOpenSaveModal.addEventListener('click', openSaveModal);
btnCloseSaveModal.addEventListener('click', closeSaveModal);
btnCancelSave.addEventListener('click', closeSaveModal);

btnConfirmSave.addEventListener('click', () => {
  const label = checkpointLabelInput.value.trim();
  if (!label) {
    alert('Please enter a short checkpoint label.');
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newCheckpoint = {
    id: 'cp-' + Date.now(),
    label: label,
    timestamp: `Today ${timeStr}`,
    rawTime: Date.now(),
    notes: checkpointNotesInput.value.trim() || 'Manual checkpoint before AI edit.',
    storyContent: storyInput.value,
    isWorking: activeProjectState.isWorking,
    affectedFiles: ['projectWorkspace.js']
  };

  const list = getCheckpoints();
  list.unshift(newCheckpoint); // Add to beginning (most recent first)
  saveCheckpoints(list);

  closeSaveModal();
  showToast(`Saved checkpoint: "${label}"`);
});

// App Startup
initStorage();
renderActiveStateUI();
showScreen('project');
