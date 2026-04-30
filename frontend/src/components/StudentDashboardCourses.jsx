import React from "react";
import useThemeMode from '../hooks/useThemeMode';

const courses = [
  {
    image: "/images/blue-package.png",
    title: "Blue Package",
    subtitle: "ALPHA SUCCESS JOURNEY",
    description:
      "Success Journey is the package in Level one. It's designed to create an alpha moment and increase awareness to grow to the mind level of consciousness.",
    languages: ["Amharic", "English", "Afan Oromo"],
  },
  {
    image: "/images/yellow-package.png",
    title: "Yellow Package",
    subtitle: "POWERFUL PROCESS",
    description:
      "This training package is designed to enable people to travel inside themselves and get to know their desires. The training lets them balance their social, financial, physical, family, spiritual, and mental life.",
    languages: ["Amharic", "English", "Afan Oromo", "Tigrigna"],
  },
  {
    image: "/images/orange-package.png",
    title: "Orange Package",
    subtitle: "HABIT BUILDING",
    description:
      "This training package allows people to develop a step-by-step system to build the required habit for the purpose, dreams, and goals they designed.",
    languages: ["Amharic", "English"],
  },
];

export default function StudentDashboardCourses() {
  const isDarkMode = useThemeMode();
  return (
    <div className="flex flex-wrap gap-8 justify-center">
      {courses.map((course, idx) => (
        <div
          key={idx}
          className="card p-6 w-96 flex flex-col items-center transition-all"
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--gray-200)',
            boxShadow: '0 4px 16px 0 rgba(16, 30, 54, 0.04)',
            color: 'var(--text-main)',
            transition: 'var(--transition-main)'
          }}
        >
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-48 object-contain mb-4"
          />
          <h3 className="font-bold text-lg" style={{color: 'var(--accent-blue)'}}>{course.title}</h3>
          <div className="font-semibold mb-2" style={{color: 'var(--accent-orange)'}}>
            {course.subtitle}
          </div>
          <p className="mb-4 text-center" style={{color: 'var(--text-secondary)'}}>{course.description}</p>
          <div className="mb-4 w-full">
            <div className="font-semibold mb-1" style={{color: 'var(--text-secondary)'}}>
              Available Languages
            </div>
            <div className="flex flex-wrap gap-2">
              {course.languages.map((lang, i) => (
                <span
                  key={i}
                  style={{background: 'var(--gray-100)', color: 'var(--accent-blue)', borderRadius: '999px', padding: '4px 12px', fontSize: '12px'}}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
          <button className={`bg-green-500 hover:bg-green-600 font-bold py-2 px-6 rounded-full mt-auto ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Enroll Now
          </button>
        </div>
      ))}
    </div>
  );
}
