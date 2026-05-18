import React from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function QuizBuilder({ quiz, setQuiz, title = "Mini-Quiz Questions" }) {
  const isDarkMode = useThemeMode();
  
  const addQuestion = () => {
    setQuiz([
      ...quiz, 
      { question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };

  const removeQuestion = (index) => {
    const newQuiz = [...quiz];
    newQuiz.splice(index, 1);
    setQuiz(newQuiz);
  };

  const updateQuestion = (index, field, value) => {
    const newQuiz = [...quiz];
    newQuiz[index][field] = value;
    setQuiz(newQuiz);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuiz = [...quiz];
    newQuiz[qIndex].options[oIndex] = value;
    setQuiz(newQuiz);
  };

  return (
    <div className={`border !rounded-[32px] p-6 mt-6 shadow-inner backdrop-blur-md ${isDarkMode ? 'bg-[#0B1120]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
      <h4 className={`font-bold text-lg mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        <div className="w-2 h-6 bg-[#00D4FF] rounded-full"></div>
        {title}
      </h4>
      
      {quiz.map((q, qIndex) => (
        <div key={qIndex} className={`p-5 !rounded-[32px] border mb-5 relative shadow-sm group hover:border-white/20 transition-all ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
          <button 
            type="button"
            onClick={() => removeQuestion(qIndex)}
            className={`absolute top-4 right-4 hover:text-[#E30A17] hover:bg-[#E30A17]/10 p-1.5 !rounded-full transition-colors opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-slate-300 bg-[#0B1120]/5' : 'text-slate-500 bg-slate-50'}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="mb-5 pr-10">
            <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Question {qIndex + 1}</label>
            <input 
              type="text" 
              required
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              className={`w-full px-4 py-3 border !rounded-full focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/50 outline-none font-semibold placeholder:text-slate-300 transition-all ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              placeholder="e.g., What is the primary purpose of React?"
            />
          </div>
          
          <div className="space-y-3">
            <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Options & Correct Answer</label>
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name={`correct-${qIndex}`}
                  checked={q.correctAnswer === oIndex}
                  onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                  className={`w-4 h-4 text-[#00D4FF] focus:ring-[#008A32] border-white/20 focus:ring-offset-[#0B1120] ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}
                />
                <input 
                  type="text" 
                  required
                  value={opt}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  className={`flex-1 px-4 py-2.5 !rounded-full border outline-none font-medium transition-all ${q.correctAnswer === oIndex ? ' border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_10px_rgba(0,138,50,0.1)]' : 'border-white/10 focus:border-white/30'} ${isDarkMode ? 'text-white text-slate-300 bg-[#0B1120]' : 'text-slate-900 text-slate-500 bg-white'}`}
                  placeholder={`Option ${oIndex + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button 
        type="button"
        onClick={addQuestion}
        className={`text-sm font-semibold border px-4 py-2 rounded-full flex items-center justify-center gap-2 w-full mt-2 transition-colors bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
      >
        <PlusCircle className="w-4 h-4" /> Add Question
      </button>
    </div>
  );
}
