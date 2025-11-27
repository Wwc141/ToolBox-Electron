import React, { useState, useEffect } from 'react';
import { Grid, ArrowRight } from 'lucide-react';
import SectionHeader from './SectionHeader';

const UnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  
  const cats = {
    length: { name: '长度', units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, inch: 0.0254, mile: 1609.34 } },
    weight: { name: '重量', units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 } },
    storage: { name: '存储', units: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 } }
  };

  const res = (value * cats[category].units[from] / cats[category].units[to]);
  useEffect(() => { const k = Object.keys(cats[category].units); setFrom(k[0]); setTo(k[1]); }, [category]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in transition-colors">
      <SectionHeader icon={Grid} title="单位换算器" colorClass="text-orange-500" />
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {Object.keys(cats).map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${category === c ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{cats[c].name}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
          <label className="block text-xs text-slate-500 mb-1">输入</label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-full text-2xl font-bold bg-transparent outline-none text-slate-800 dark:text-white mb-2" />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full text-sm bg-white dark:bg-slate-600 rounded p-1 dark:text-slate-200">{Object.keys(cats[category].units).map(u => <option key={u} value={u}>{u}</option>)}</select>
        </div>
        <div className="flex justify-center text-slate-400"><ArrowRight /></div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50">
           <label className="block text-xs text-orange-600 dark:text-orange-400 mb-1">结果</label>
           <div className="w-full text-2xl font-bold text-orange-700 dark:text-orange-400 mb-2 truncate">{Number.isInteger(res) ? res : res.toFixed(4)}</div>
           <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full text-sm bg-white dark:bg-slate-600 rounded p-1 dark:text-slate-200">{Object.keys(cats[category].units).map(u => <option key={u} value={u}>{u}</option>)}</select>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;