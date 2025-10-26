import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="text-white py-3 text-center">
            <div className="max-w-6xl mx-auto px-4 font-semibold">
                <span>© 
                    <span className="text-red-600 pl-0.5">{new Date().getFullYear()}</span>
                    <span className="pr-0.5 pl-1">Copa Bomba Patch</span>
                    <img src="/images/CPB_Logo.png" alt="Logo" className="inline-block h-16" />
                </span>
            </div>
        </footer>
    );
};

export default Footer;