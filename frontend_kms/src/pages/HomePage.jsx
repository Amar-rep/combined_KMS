function HomePage({ setPage }) {
    return (
        <div className="page-container">
            <div className="home-hero">
                <div className="home-eyebrow">Key Management System</div>
                <h1 className="home-title">KMS Portal</h1>
                <div className="home-divider" />
                <p className="home-subtitle">
                    Manage hospital and user registrations across the network.
                </p>

                <div className="home-cards">
                    <button className="home-card" onClick={() => setPage('hospital')}>
                        <div className="home-card-label">Hospital</div>
                        <div className="home-card-title">Register Hospital</div>
                        <div className="home-card-link">Get started</div>
                    </button>

                    <button className="home-card" onClick={() => setPage('user')}>
                        <div className="home-card-label">User</div>
                        <div className="home-card-title">Register User</div>
                        <div className="home-card-link">Get started</div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HomePage
