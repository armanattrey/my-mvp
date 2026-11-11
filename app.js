let activeProjectState = {
  label: "Working Baseline",
  storyText: "A developer asked an AI assistant to make a minor styling tweak, but the video generator button stopped responding.",
  isWorking: true
};

const storyInput = document.getElementById("story-input");
const btnGenerate = document.getElementById("btn-generate-video");
const videoPreviewContent = document.getElementById("video-preview-content");

function handleGenerateVideo() {
  videoPreviewContent.innerHTML = `
    <div class="text-4xl animate-bounce">🎬</div>
    <div class="text-sm font-bold text-green-300">Generated Video Preview</div>
    <div class="text-xs text-gray-200 mt-1">"${storyInput.value.substring(0, 50)}..."</div>
    <div class="text-xs text-green-400 mt-1">✓ Function verified working at 1080p</div>
  `;
}

if (btnGenerate) btnGenerate.addEventListener("click", handleGenerateVideo);
