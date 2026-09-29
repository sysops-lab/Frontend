import {
    Link
} from "react-router-dom";


export default function Dashboard() {

    return (

        <div className="application">

            <header className="topbar">

                <h1>
                    Church Song Display
                </h1>

            </header>


            <main className="dashboard">

                <Link to="/songs">

                    <h2>
                        Song Library
                    </h2>

                    <p>
                        Manage songs and lyrics.
                    </p>

                </Link>


                <Link to="/service">

                    <h2>
                        Service
                    </h2>

                    <p>
                        Prepare today's service.
                    </p>

                </Link>

            </main>

        </div>

    );

}
