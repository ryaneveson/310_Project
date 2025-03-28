import { useState, useEffect } from "react";

const useUser = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role) {
      window.location.href = "/";
      return;
    }
    setUserRole(role);
    if(role !== "student"){
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    handleNavigation("/");
  };

  const handleNavigation = (destination) => {
    window.location.href = destination;
  };

  return { userRole, loading, studentId, handleLogout, setLoading, handleNavigation };
};

export default useUser;
