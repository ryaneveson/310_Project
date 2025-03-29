import axios from "axios";

// Common method to format payment data
export const formatPayments = (finances, isPayment) => {
  return finances
    .filter((item) => (item.item_name === "payment" && isPayment) || (!(item.item_name ==="payment") && !isPayment))
    .map((item) => ({
      name: item.item_name,
      date: new Date(item.due_date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      amount: item.amount,
    }));
};

// Common method to handle fetch errors
export const handleFetchError = (err) => {
  if (err.response && err.response.data && err.response.data.error) {
    alert(`Error: ${err.response.data.error}`);
  } else {
    alert("Error fetching finances.");
  }
};

// Fetching finances from API
export const fetchFinances = async (studentId) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/student/finances?student_id=${studentId}`
    );
    console.log("the data" + JSON.stringify(response.data.finances));
    return response.data.finances;
  } catch (err) {
    handleFetchError(err);
    return [];
  }
};
