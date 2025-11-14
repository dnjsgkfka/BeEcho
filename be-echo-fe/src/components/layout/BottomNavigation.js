import React from 'react';
import { TAB_ITEMS } from '../../constants/navigation';
import { TabIcon } from '../ui';

const BottomNavigation = ({ activeTab, onChangeTab }) => (
  <nav className="bottom-nav" aria-label="하단 내비게이션 바">
    {TAB_ITEMS.map((item) => (
      <button
        key={item.id}
        type="button"
        className={activeTab === item.id ? 'active' : ''}
        onClick={() => onChangeTab(item.id)}
      >
        <TabIcon name={item.icon} active={activeTab === item.id} />
        {item.label}
      </button>
    ))}
  </nav>
);

export default BottomNavigation;

