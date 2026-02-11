import React from 'react';
import './MaintenancePage.css';

const MaintenancePage: React.FC = () => {
    return (
        <div className="MAIN">
            <div className="MAIN-container">
                {/* Left Section */}
                <div className="MAIN-left">
                    <h1>Oops!</h1>
                    <h2>Under Maintenance</h2>
                    <p>
                        We are currently upgrading our gym facilities to serve you better!
                        New equipment, updated workout zones, and enhanced training programs
                        are on the way. Stay tuned and get ready to crush your fitness goals
                        with a stronger, safer, and more motivating environment.
                    </p>
                    <button className="MAIN-btn">More Info</button>
                </div>

                {/* Right Section */}
                <div className="MAIN-right">
                    <img
                        src="https://img.freepik.com/premium-photo/athlete-muscular-bodybuilder-man-posing-with-dumbbells-gym_136403-4814.jpg?uid=R175611833&ga=GA1.1.1276842385.1760516584&semt=ais_hybrid&w=740&q=80"
                        alt="Maintenance Illustration"
                    />
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
