import './SearchMethodSelector.css';

const SearchMethodSelector = ({ methods, activeMethod, onChange }) => {
    return (
        <div className="search-methods">
            {methods.map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    className={`search-method-chip ${activeMethod === key ? 'active' : ''}`}
                    onClick={() => onChange(key)}
                >
                    {Icon && <Icon size={16} />}
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
};

export default SearchMethodSelector;
