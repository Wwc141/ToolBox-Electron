import React from 'react';

const SectionHeader = ({ icon: Icon, title, colorClass }) => (
  <h3 className={`text-lg font-bold mb-4 flex items-center ${colorClass} dark:text-slate-200`}>
    <Icon className="mr-2" /> {title}
  </h3>
);

export default SectionHeader;