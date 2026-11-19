import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
        <div className="application">

            {/* Header */}
            <header className="topbar">
                <h1>Church Song Display</h1>

                <span className="header-tagline">
                    Worship • Praise • Fellowship
                </span>
            </header>

            {/* Dashboard */}
            <main className="dashboard">

                {/* Welcome Section */}
                <section className="welcome-section">
                    <p className="welcome-label">
                        WELCOME
                    </p>

                    <h2>
                        Let everything that has breath
                        praise the Lord.
                    </h2>

                    <p className="welcome-description">
                        Manage your worship songs and prepare
                        for your church services.
                    </p>
                </section>

                {/* Dashboard Navigation Cards */}
                <section className="dashboard-cards">

                    {/* Song Library */}
                    <Link
                        to="/songs"
                        className="dashboard-card"
                    >
                        <div className="card-icon">
                            ♪
                        </div>

                        <h2>Song Library</h2>

                        <p>
                            Manage songs, lyrics, and worship
                            music for your congregation.
                        </p>

                        <span className="card-action">
                            Open Song Library →
                        </span>
                    </Link>

                    {/* Service */}
                    <Link
                        to="/service"
                        className="dashboard-card"
                    >
                        <div className="card-icon">
                            ♫
                        </div>

                        <h2>Service</h2>

                        <p>
                            Prepare today's service and organize
                            songs for worship.
                        </p>

                        <span className="card-action">
                            Prepare Service →
                        </span>
                    </Link>

                </section>

                {/* Footer */}
                <footer className="dashboard-footer">
                    <p>
                        Church Song Display · Worship Together
                    </p>
                </footer>

            </main>

        </div>
    );
}