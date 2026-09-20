const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffprobe = require('../video-project/node_modules/@ffprobe-installer/ffprobe').path;

const audioDir = path.join(__dirname, '..', 'video-project', 'public', 'audio');
const files = ['scene0_intro.mp3', 'scene1_dashboard_ai.mp3', 'scene2_integrations.mp3', 'scene3_emails.mp3', 'scene4_activity.mp3', 'scene5_closing.mp3'];

let total = 0;
for (const file of files) {
  const p = path.join(audioDir, file);
  const out = execSync(`"${ffprobe}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim();
  const dur = parseFloat(out);
  total += dur;
  console.log(`${file}: ${dur.toFixed(2)}s`);
}
console.log(`TOTAL AUDIO DURATION: ${total.toFixed(2)}s (${Math.floor(total/60)}m ${(total%60).toFixed(1)}s)`);
