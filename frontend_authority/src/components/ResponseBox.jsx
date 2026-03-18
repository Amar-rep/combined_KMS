import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import './ResponseBox.css';

const ResponseBox = ({ response, onClose }) => {
    if (response === null || response === undefined) return null;

    const content = typeof response === 'object'
        ? JSON.stringify(response, null, 2)
        : String(response);

    const isError = typeof response === 'string' && response.startsWith('Error');

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="response-overlay" onClick={onClose}>
            <div className="response-modal" onClick={(e) => e.stopPropagation()}>
                <div className={`response-modal-header ${isError ? 'error' : 'success'}`}>
                    <div className="response-modal-status">
                        {isError
                            ? <><AlertCircle size={20} /> <span>Error</span></>
                            : <><CheckCircle size={20} /> <span>Response</span></>
                        }
                    </div>
                    <button className="response-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="response-modal-body">
                    <pre className="response-output">{content}</pre>
                </div>
            </div>
        </div>
    );
};

export default ResponseBox;
