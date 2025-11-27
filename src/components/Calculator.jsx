import React, { useState, useEffect } from 'react';
import { Calculator, Delete } from 'lucide-react';
import SectionHeader from './SectionHeader';

const CalculatorTool = () => {
  const [display, setDisplay] = useState('0');
  const [shouldReset, setShouldReset] = useState(false);

  const handleInput = (val) => {
    if (display === '0' || display === 'Error' || shouldReset) {
      setDisplay(val);
      setShouldReset(false);
    } else {
      setDisplay(display + val);
    }
  };

  const handleFunction = (func) => {
    if (display === '0' || display === 'Error' || shouldReset) {
      setDisplay(func + '(');
      setShouldReset(false);
    } else {
      setDisplay(display + func + '(');
    }
  };

  const handleEqual = () => {
    try {
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/\^/g, '**');

      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + expr)();
      setDisplay(String(Math.round(result * 1000000000) / 1000000000));
      setShouldReset(true);
    } catch (e) {
      setDisplay('Error');
      setShouldReset(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setShouldReset(false);
  };

  const handleDelete = () => {
    if (shouldReset || display === 'Error') {
      handleClear();
      return;
    }
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const btnBase = "h-12 sm:h-14 rounded-lg font-bold text-sm sm:text-lg transition-all active:scale-95 flex items-center justify-center shadow-sm select-none";
  const btnNum = `${btnBase} bg-white dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600`;
  const btnOp = `${btnBase} bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800`;
  const btnFunc = `${btnBase} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs sm:text-sm`;
  const btnAction = `${btnBase} bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-100 dark:border-red-800`;
  const btnEqual = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 dark:shadow-none`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (key >= '0' && key <= '9') handleInput(key);
      if (key === '.') handleInput('.');
      if (key === 'Enter' || key === '=') { e.preventDefault(); handleEqual(); }
      if (key === 'Backspace') handleDelete();
      if (key === 'Escape') handleClear();
      if (key === '+') handleInput('+');
      if (key === '-') handleInput('-');
      if (key === '*') handleInput('×');
      if (key === '/') { e.preventDefault(); handleInput('÷'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, shouldReset]);

  return (
    <div className="h-full flex items-center justify-center animate-fade-in py-2">
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md transition-colors">
        <SectionHeader icon={Calculator} title="科学计算器" colorClass="text-indigo-500" />
        
        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl mb-4 text-right border-2 border-transparent focus-within:border-blue-400 transition-colors overflow-hidden">
          <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wider whitespace-nowrap overflow-x-auto custom-scrollbar pb-1">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          <button onClick={handleClear} className={btnAction}>AC</button>
          <button onClick={handleDelete} className={btnAction}><Delete size={18} /></button>
          <button onClick={() => handleInput('(')} className={btnFunc}>(</button>
          <button onClick={() => handleInput(')')} className={btnFunc}>)</button>
          <button onClick={() => handleInput('÷')} className={btnOp}>÷</button>

          <button onClick={() => handleFunction('sin')} className={btnFunc}>sin</button>
          <button onClick={() => handleFunction('cos')} className={btnFunc}>cos</button>
          <button onClick={() => handleFunction('tan')} className={btnFunc}>tan</button>
          <button onClick={() => handleInput('^')} className={btnFunc}>xʸ</button>
          <button onClick={() => handleInput('×')} className={btnOp}>×</button>

          <button onClick={() => handleFunction('ln')} className={btnFunc}>ln</button>
          <button onClick={() => handleFunction('log')} className={btnFunc}>log</button>
          <button onClick={() => handleFunction('√')} className={btnFunc}>√</button>
          <button onClick={() => handleInput('^2')} className={btnFunc}>x²</button>
          <button onClick={() => handleInput('-')} className={btnOp}>-</button>

          <button onClick={() => handleInput('7')} className={btnNum}>7</button>
          <button onClick={() => handleInput('8')} className={btnNum}>8</button>
          <button onClick={() => handleInput('9')} className={btnNum}>9</button>
          <button onClick={() => handleInput('π')} className={btnFunc}>π</button>
          <button onClick={() => handleInput('+')} className={btnOp}>+</button>

          <button onClick={() => handleInput('4')} className={btnNum}>4</button>
          <button onClick={() => handleInput('5')} className={btnNum}>5</button>
          <button onClick={() => handleInput('6')} className={btnNum}>6</button>
          <button onClick={() => handleInput('e')} className={btnFunc}>e</button>
          <button onClick={handleEqual} className={`${btnEqual} row-span-2 h-full text-xl`}>=</button>

          <button onClick={() => handleInput('1')} className={btnNum}>1</button>
          <button onClick={() => handleInput('2')} className={btnNum}>2</button>
          <button onClick={() => handleInput('3')} className={btnNum}>3</button>
          <button onClick={() => handleInput('.')} className={btnNum}>.</button>
          
          <button onClick={() => handleInput('0')} className={`${btnNum} col-span-2`}>0</button>
          <button onClick={() => handleInput('00')} className={btnNum}>00</button>
          <button onClick={() => handleInput('%')} className={btnFunc}>%</button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorTool;