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
            <main className="flex-1 flex items-center justify-center pt-16 sm:pt-20 px-4">
                <div className="w-full max-w-6xl">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
};