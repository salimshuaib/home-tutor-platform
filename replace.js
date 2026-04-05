const fs = require('fs');

let html = fs.readFileSync('delhi-private-tutors.html', 'utf-8');

const mapping = {
  '🎓': 'graduation-cap',
  '📋': 'clipboard-list',
  '📚': 'book-open',
  '👨‍🎓': 'graduation-cap',
  '👩‍🏫': 'presentation',
  '📝': 'file-edit',
  '📞': 'phone',
  '🏠': 'home',
  '🔍': 'search',
  '💰': 'banknote',
  '➕': 'calculator',
  '🔬': 'microscope',
  '⚗️': 'flask-conical',
  '🧬': 'dna',
  '📖': 'book-open',
  '🇮🇳': 'flag',
  '📊': 'bar-chart-2',
  '💻': 'laptop',
  '📈': 'trending-up',
  '🗺️': 'map',
  '🎨': 'palette',
  '🏆': 'trophy',
  '👩': 'user',
  '✅': 'check-circle',
  '📍': 'map-pin',
  '⚡': 'zap',
  '🔒': 'lock',
  '✉️': 'mail'
};

for (const [emoji, icon] of Object.entries(mapping)) {
  html = html.split(emoji).join(`<i data-lucide="${icon}"></i>`);
}

const styleToAdd = `
    /* ─── ICONS ─── */
    [data-lucide] {
      width: 1em;
      height: 1em;
      vertical-align: middle;
      display: inline-block;
      stroke-width: 2;
    }
`;
html = html.replace('</style>', styleToAdd + '  </style>');

const scriptToAdd = `
  <!-- ── LUCIDE ICONS ── -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>lucide.createIcons();</script>
</body>
`;
html = html.replace('</body>', scriptToAdd);

// Also add lucide.createIcons() after submitForm modifications
html = html.replace('</div>\\n    `;\\n  }', '</div>\\n    `;\\n    lucide.createIcons();\\n  }');

fs.writeFileSync('delhi-private-tutors-updated.html', html);
console.log('Replacement complete.');
