import './ModeToggle.css';

const ModeToggle = ({ options, activeMode, onChange }) => {
    return (
        <div className="mode-toggle">
            {options.map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    className={`mode-toggle-btn ${activeMode === key ? 'active' : ''}`}
                    onClick={() => onChange(key)}
                >
                    {Icon && <Icon size={18} />}
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
};

export default ModeToggle;
