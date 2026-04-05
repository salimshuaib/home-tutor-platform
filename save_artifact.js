const fs = require('fs');
const html = fs.readFileSync('delhi-private-tutors-updated.html', 'utf-8');
const md = 'Here is the complete updated HTML file:\n\n```html\n' + html + '\n```';
const artifactPath = 'C:/Users/Shuai/.gemini/antigravity/brain/b44a4c36-4672-47b1-a769-2241dbf52ea7/artifacts/delhi_tutors_updated.md';
fs.writeFileSync(artifactPath, md);

const metaFile = artifactPath + '.meta.json';
const meta = {
  ArtifactType: 'other',
  Summary: 'Updated Delhi Tutors HTML with Lucide Icons'
};
fs.writeFileSync(metaFile, JSON.stringify(meta));
