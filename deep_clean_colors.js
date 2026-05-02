const fs = require('fs');
const path = require('path');

const dirs = ['frontend/src/pages', 'frontend/src/components'];

function replaceColors(content) {
  // Replace yellow and off-brand oranges with brand Orange (#F97316) and Cyan (#00D4FF)
  content = content.replace(/#FFD700/g, '#F97316');
  content = content.replace(/#EAB308/g, '#F97316'); // Tailwind yellow-500
  content = content.replace(/yellow-500/g, 'orange-500');
  content = content.replace(/yellow-600/g, 'orange-600');
  content = content.replace(/#E67E22/g, '#00D4FF'); // Secondary cyan
  content = content.replace(/#CF711F/g, '#00A3CC'); // Darker cyan

  // Hardcoded dark background fixes
  // Let's replace any instance of `bg-[#1E293B]` that is preceded by a quote or space (meaning it's a fixed class)
  // We'll replace it with a ternary, but ONLY if we are inside a template literal `` and NOT already inside a ternary expression
  // Actually, a simpler approach is: if it's `bg-[#1E293B]` inside a string literal "...", wrap the whole string in {} and use ternary
  
  // Replace "bg-[#1E293B] ..." with {`... ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}
  content = content.replace(/className="([^"]*)\bbg-\[#1E293B\]\b([^"]*)"/g, "className={`$1 $2 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}");
  content = content.replace(/className='([^']*)\bbg-\[#1E293B\]\b([^']*)'/g, "className={`$1 $2 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}");

  // Replace `bg-[#1E293B]` inside template literals if it is NOT part of a ternary:
  // This is tricky because we don't want to replace `${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`.
  // We can do a string split by backticks, and for every odd index (inside template literal):
  let parts = content.split('`');
  for (let i = 1; i < parts.length; i += 2) {
    let part = parts[i];
    
    // Check if bg-[#1E293B] is in this template literal
    if (part.includes('bg-[#1E293B]')) {
      // If the template literal DOES NOT contain `?` (no ternary at all) or if bg-[#1E293B] is BEFORE any `?` or outside `{}`
      // A quick hack is to replace ` bg-[#1E293B] ` or `bg-[#1E293B] ` or ` bg-[#1E293B]` 
      // where it's not inside quotes (which would be inside a ternary)
      
      // Let's temporarily replace the ones IN ternaries so we don't touch them
      let safePart = part.replace(/'bg-\[#1E293B\]'/g, 'SAFE_BG');
      safePart = safePart.replace(/"bg-\[#1E293B\]"/g, 'SAFE_BG');
      
      // Now any remaining bg-[#1E293B] are hardcoded string classes inside the template literal!
      if (safePart.includes('bg-[#1E293B]')) {
         safePart = safePart.replace(/\bbg-\[#1E293B\]\b/g, "${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}");
         // Put back the safe ones
         safePart = safePart.replace(/SAFE_BG/g, "'bg-[#1E293B]'");
         parts[i] = safePart;
      }
    }
    
    // Do the same for bg-[#0B1120]
    if (parts[i].includes('bg-[#0B1120]')) {
      let safePart = parts[i].replace(/'bg-\[#0B1120\]'/g, 'SAFE_BG_DARK');
      safePart = safePart.replace(/"bg-\[#0B1120\]"/g, 'SAFE_BG_DARK');
      if (safePart.includes('bg-[#0B1120]')) {
         safePart = safePart.replace(/\bbg-\[#0B1120\]\b/g, "${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}");
         safePart = safePart.replace(/SAFE_BG_DARK/g, "'bg-[#0B1120]'");
         parts[i] = safePart;
      }
    }
  }
  content = parts.join('`');

  return content;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const original = fs.readFileSync(fullPath, 'utf8');
      const updated = replaceColors(original);
      if (original !== updated) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach(processDir);
console.log('Done deep cleaning colors.');
