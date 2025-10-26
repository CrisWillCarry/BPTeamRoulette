import React from "react";
import  Footer from "./Footer"
import Header from "./Header";

type LayoutProps = {
    children: React.ReactNode;
};

export const PageLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Header />
            <main className="flex-1 flex items-center justify-center">{children}</main>
            <Footer />
        </div>
    );
};