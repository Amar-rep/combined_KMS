import './FormCard.css';

const FormCard = ({ title, children, onSubmit, submitLabel, icon: Icon }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="form-card">
            {title && (
                <div className="form-card-header">
                    {Icon && <Icon size={18} className="form-card-icon" />}
                    <h3 className="form-card-title">{title}</h3>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-card-body">
                {children}
                <button type="submit" className="form-card-btn">
                    {submitLabel || title}
                </button>
            </form>
        </div>
    );
};

export default FormCard;
