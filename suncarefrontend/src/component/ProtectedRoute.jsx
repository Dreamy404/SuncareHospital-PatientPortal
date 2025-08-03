import React, { useEffect, useState } from "react";
import { useAuth } from '../context';
import { Navigate } from "react-router-dom";


const ProtectedRoute = ({ element, toastMsg }) => {
    const { authState, loading } = useAuth();

    if (loading) {
        return (
            <>
                <h1>Loading</h1>
            </>
        );
    }

    return authState.isLoggedIn ? element : <Navigate to="/login" state={{ toastMsg }} />;
}

export default ProtectedRoute;