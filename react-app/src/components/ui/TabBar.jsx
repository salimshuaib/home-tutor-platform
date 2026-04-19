export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.value}
          className={`tab-btn ${activeTab === tab.value ? 'active' : ''}`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
