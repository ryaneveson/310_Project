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
    window.location.href = "/";
  };

  return { userRole, loading, studentId, handleLogout, setLoading };
};

export default useUser;
