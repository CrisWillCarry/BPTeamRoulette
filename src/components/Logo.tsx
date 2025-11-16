import React from "react";

const Logo: React.FC = () => {
    return (
        <div className="flex items-center">
            <img src="/images/CPB_Logo.png" alt="Logo" className="h-max sm:h-28 md:h-max" />
        </div>
    );
}

export default Logo;