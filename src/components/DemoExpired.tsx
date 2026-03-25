import React from "react";
import { Button } from "./ui/button";

const DemoExpired = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">

            <div className="text-center p-6 max-w-md border rounded-xl shadow-lg">
                <div className="mb-8 flex justify-center h-70 rounded-md">
                    <img src='https://img.freepik.com/premium-vector/system-update_773186-778.jpg?uid=R175611833&ga=GA1.1.1276842385.1760516584&semt=ais_hybrid&w=740&q=80' className="rounded-md"/>
                </div>
                <h1 className="text-2xl font-bold text-red-600 mb-3">
                    Demo Expired
                </h1>
                <p className="text-muted-foreground mb-4">
                    Your demo period has ended. Please contact support to continue using the system.
                </p>

                {/* <Button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-neon-green to-neon-blue text-white"
                >
                    Refresh
                </Button> */}
            </div>
        </div>
    );
};

export default DemoExpired;