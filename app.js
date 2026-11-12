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


initStorage();
renderActiveStateUI();
