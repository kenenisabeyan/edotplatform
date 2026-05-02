const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'frontend/src/pages'),
  path.join(__dirname, 'frontend/src/components')
];

const colorMap = [
  // 1. Dark mode backgrounds
  { regex: /bg-\[#0d0f12\]/g, replacement: 'bg-[#0B1120]' },
  { regex: /bg-\[#11151F\]/g, replacement: 'bg-[#1E293B]' },
  { regex: /bg-\[#13161B\]/g, replacement: 'bg-[#1E293B]' },
  { regex: /bg-slate-900/g, replacement: 'bg-[#0B1120]' },
  { regex: /bg-slate-800/g, replacement: 'bg-[#1E293B]' },
  
  // 2. Light mode backgrounds
  { regex: /bg-\[#f0f4f8\]/g, replacement: 'bg-[#FAFAFA]' },
  
  // 3. Fix hardcoded 'min-h-screen bg-[#0B1120]' to use ternary
  { 
    regex: /className=\{`min-h-screen bg-\[#0B1120\]/g, 
    replacement: "className={`min-h-screen ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}" 
  },
  { 
    regex: /className=\{`w-full md:w-64 bg-\[#0B1120\]/g, 
    replacement: "className={`w-full md:w-64 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}" 
  }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  colorMap.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', path.basename(filePath));
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
});

console.log('Color replacements complete.');
