import React from "react";
import  Footer from "./Footer"

type LayoutProps = {
    children: React.ReactNode;
};

export const PageLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-black">
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
};