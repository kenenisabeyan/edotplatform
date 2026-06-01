import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import useThemeMode from '../hooks/useThemeMode';
import { PlusCircle, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import PremiumModal from './PremiumModal';

export default function QuizBuilder({ quiz, setQuiz, title = "Mini-Quiz Questions" }) {
  const isDarkMode = useThemeMode();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempQuestion, setTempQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setTempQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    setTempQuestion({
      question: quiz[index].question,
      options: [...quiz[index].options],
      correctAnswer: quiz[index].correctAnswer
    });
    setIsModalOpen(true);
  };

  const removeQuestion = (index) => {
    const newQuiz = [...quiz];
    newQuiz.splice(index, 1);
    setQuiz(newQuiz);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!tempQuestion.question.trim()) return;
    if (tempQuestion.options.some(opt => !opt.trim())) return;

    if (editingIndex === null) {
      setQuiz([...quiz, tempQuestion]);
    } else {
      const newQuiz = [...quiz];
      newQuiz[editingIndex] = tempQuestion;
      setQuiz(newQuiz);
    }
    setIsModalOpen(false);
  };

  const updateOption = (oIndex, value) => {
    const updatedOptions = [...tempQuestion.options];
    updatedOptions[oIndex] = value;
    setTempQuestion({ ...tempQuestion, options: updatedOptions });
  };

  return (
    <div className={`border !rounded-[32px] p-6 mt-6 shadow-sm ${isDarkMode ? 'bg-[#0B1120]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between mb-5">
        <h4 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <div className="w-2 h-6 bg-[#00D4FF] rounded-full"></div>
          {title}
        </h4>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-[#0B1120]/40 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
          {quiz.length} {quiz.length === 1 ? 'Question' : 'Questions'}
        </span>
      </div>
      
      {quiz.length > 0 ? (
        <div className="space-y-4 mb-5">
          {quiz.map((q, qIndex) => (
            <div key={qIndex} className={`p-5 !rounded-[24px] border relative shadow-sm transition-all group ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-white/10' : 'bg-white border-slate-200/60 hover:border-slate-300'}`}>
              <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  type="button"
                  onClick={() => handleOpenEdit(qIndex)}
                  className={`hover:text-[#2563EB] hover:bg-[#2563EB]/10 p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-300 bg-[#0B1120]/5' : 'text-slate-600 bg-slate-50'}`}
                  title="Edit Question"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className={`hover:text-[#E30A17] hover:bg-[#E30A17]/10 p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-300 bg-[#0B1120]/5' : 'text-slate-600 bg-slate-50'}`}
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="pr-20 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#00D4FF]' : 'text-[#2563EB]'}`}>Question {qIndex + 1}</span>
                <h5 className={`font-bold mt-1 text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{q.question}</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {q.options.map((opt, oIndex) => {
                  const isCorrect = q.correctAnswer === oIndex;
                  return (
                    <div key={oIndex} className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium ${isCorrect ? (isDarkMode ? 'bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#00D4FF]' : 'bg-[#2563EB]/5 border-[#2563EB]/20 text-[#2563EB]') : (isDarkMode ? 'bg-slate-900 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600')}`}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40"></div>}
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-6 border border-dashed rounded-[24px] mb-5 ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500 bg-white/40'}`}>
          <p className="text-sm">No questions added to this quiz yet.</p>
        </div>
      )}

      <button 
        type="button"
        onClick={handleOpenAdd}
        className={`text-sm font-bold border px-6 py-3 rounded-full flex items-center justify-center gap-2 w-full mt-2 transition-all shadow-md ${isDarkMode ? 'bg-[#00D4FF] hover:bg-[#00A3CC] border-[#00D4FF] text-white hover:shadow-[#00D4FF]/20' : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-[#2563EB] text-white hover:shadow-[#2563EB]/20'}`}
      >
        <PlusCircle className="w-4 h-4" /> Add Question
      </button>

      {createPortal(
        <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="max-w-xl">
          <div className="p-6 md:p-8 flex flex-col h-full w-full relative">
            <div className={`flex justify-between items-center mb-6 border-b pb-4 relative z-10 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <h3 className={`font-bold text-xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {editingIndex === null ? <PlusCircle className="w-6 h-6 text-[#00D4FF]" /> : <Edit className="w-6 h-6 text-[#00D4FF]" />}
                {editingIndex === null ? 'Add New Question' : `Edit Question ${editingIndex + 1}`}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className={`hover:text-white text-2xl transition-colors leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5 overflow-y-auto pr-1 flex-1 relative z-10">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Question Text <span className="text-[#E30A17]">*</span></label>
                <input 
                  type="text" 
                  required
                  value={tempQuestion.question}
                  onChange={(e) => setTempQuestion({ ...tempQuestion, question: e.target.value })}
                  className={`w-full px-5 py-3 border !rounded-full focus:ring-1 outline-none transition-all font-semibold ${isDarkMode ? 'bg-[#0B1120] text-white border-white/10 focus:ring-[#00D4FF] focus:border-[#00D4FF]' : 'bg-white text-slate-900 border-slate-200 focus:ring-[#2563EB] focus:border-[#2563EB]'}`}
                  placeholder="e.g., What is the primary purpose of React?"
                />
              </div>
              
              <div className="space-y-3">
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Options & Select Correct Answer <span className="text-[#E30A17]">*</span></label>
                <p className={`text-xs -mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Check the radio button next to the correct option.</p>
                
                {tempQuestion.options.map((opt, oIndex) => {
                  const isCorrect = tempQuestion.correctAnswer === oIndex;
                  return (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct-temp"
                        checked={isCorrect}
                        onChange={() => setTempQuestion({ ...tempQuestion, correctAnswer: oIndex })}
                        className={`w-5 h-5 text-[#00D4FF] focus:ring-[#00D4FF] border-white/20 focus:ring-offset-[#0B1120] ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}
                      />
                      <input 
                        type="text" 
                        required
                        value={opt}
                        onChange={(e) => updateOption(oIndex, e.target.value)}
                        className={`flex-1 px-5 py-2.5 !rounded-full border outline-none font-medium transition-all ${isCorrect ? (isDarkMode ? 'border-[#00D4FF] bg-[#00D4FF]/10' : 'border-[#2563EB] bg-[#2563EB]/5') : (isDarkMode ? 'border-white/10 bg-[#0B1120]' : 'border-slate-200 bg-white')}`}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className={`flex gap-3 pt-6 mt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-3 px-4 font-bold rounded-lg border transition-colors ${isDarkMode ? 'bg-[#0B1120] text-slate-300 border-white/10 hover:bg-white/5 hover:text-white' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`flex-1 py-3 px-4 font-semibold rounded-full border transition-colors shadow-md ${isDarkMode ? 'bg-[#00D4FF] hover:bg-[#00A3CC] border-[#00D4FF] text-white' : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-[#2563EB] text-white'}`}
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </PremiumModal>,
        document.body
      )}
    </div>
  );
}
