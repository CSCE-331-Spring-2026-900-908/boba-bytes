import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
    const loc = useLocation();
    const role = loc.state.role;
    return (
        <>
            <p> {role}</p>
        </>
    );
}
