const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Fix InstructorCourseBuilder container
  content = content.replace(
    /className=\{\`bg-\[#1E293B\] border rounded-2xl overflow-hidden/g,
    "className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}"
  );

  // 2. Fix sidebar in Builder
  content = content.replace(
    /className="hidden lg:block w-72 shrink-0 bg-\[#1E293B\] border-r border-white\/5 relative z-10 overflow-y-auto custom-scrollbar"/g,
    "className={`hidden lg:block w-72 shrink-0 border-r relative z-10 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-200'}`}"
  );

  // 3. Fix active step icons in Builder
  content = content.replace(
    /isActive \? 'bg-\[#1E293B\] text-\[#FFD700\] border-2 border-\[#FFD700\]'/g,
    "isActive ? `${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'} text-[#F97316] border-2 border-[#F97316]`"
  );
  content = content.replace(
    /isCompleted \? 'bg-\[#E67E22\] text-white border-2 border-\[#E67E22\]' : 'bg-\[#1E293B\] text-slate-400 border border-white\/20'/g,
    "isCompleted ? 'bg-[#F97316] text-white border-2 border-[#F97316]' : `${isDarkMode ? 'bg-[#1E293B] border-white/20' : 'bg-slate-50 border-slate-200'} text-slate-400`"
  );
  
  // 4. Fix image thumbnail container
  content = content.replace(
    /className="w-full md:w-64 h-48 md:h-auto shrink-0 relative bg-\[#1E293B\]"/g,
    "className={`w-full md:w-64 h-48 md:h-auto shrink-0 relative ${isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-100'}`}"
  );

  // 5. Fix form drop areas
  content = content.replace(
    /className="flex-1 p-8 bg-\[#1E293B\] flex flex-col items-center justify-center border-2 border-dashed border-white\/10 rounded-xl relative group"/g,
    "className={`flex-1 p-8 flex flex-col items-center justify-center border-2 border-dashed rounded-xl relative group ${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-slate-50 border-slate-200'}`}"
  );

  // 6. Fix yellow to orange and dark text to white everywhere (brand consistency)
  content = content.replace(/#FFD700/g, '#F97316'); // Yellow to Brand Orange
  content = content.replace(/#E67E22/g, '#F97316'); // Other orange to Brand Orange
  content = content.replace(/text-\[#0B0E14\]/g, 'text-white'); // Fix buttons that were text-dark

  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('frontend/src/pages/InstructorCourseBuilder.jsx');
fixFile('frontend/src/pages/InstructorDashboard.jsx');
console.log('Fixed builder and instructor dashboard.');
