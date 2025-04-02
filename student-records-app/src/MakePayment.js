import React, { useState, useEffect } from "react";
import axios from "axios";
import "./frontend/makePayment.css";
import useUser from "./utils/useUser";
import PageBackground from './components/PageBackground';

const formatCardNumber = (cardNumber) => `**** **** **** ${cardNumber.slice(-4)}`;

const FinancialSummary = ({ financialInfo, paymentAmount, setPaymentAmount, handleBlur }) => (
  <div className="amount">
    <p>Total Tuition: ${financialInfo.totalFees.toFixed(2)}</p>
    <p>Amount Paid: ${financialInfo.amountPaid.toFixed(2)}</p>
    <p>Remaining Balance: ${financialInfo.remainingBalance.toFixed(2)}</p>

    <label htmlFor="payment-amount">Payment amount:</label>
    <div className="input-container">
      <input
        type="text"
        id="payment-amount"
        className="currency-input"
        placeholder="$0.00"
        value={paymentAmount}
        onChange={(e) => {
          let value = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
          setPaymentAmount(value);
        }}
        onBlur={handleBlur}
        max={financialInfo.remainingBalance}
      />
    </div>
  </div>
);

const CardVerification = ({ method, setNumVer, setCvvVer, setExpVer }) => {
  const [cardNum, setCardNum] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    setNumVer(cardNum === method.cardNumber);
  }, [cardNum, method.cardNumber, setNumVer]);

  useEffect(() => {
    setCvvVer(cvv === method.cvv);
  }, [cvv, method.cvv, setCvvVer]);

  useEffect(() => {
    if (expiry) {
      const [year, month] = expiry.split("-");
      setExpVer(`${month}/${year.slice(-2)}` === method.expiryDate);
    }
  }, [expiry, method.expiryDate, setExpVer]);

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, ""); // Remove non-numeric characters
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ").trim(); // Add spaces every 4 digits
  };
  
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNum(formatted); // Store formatted value
  };

  return (
    <div id="card-verification">
      <label>
        Enter full card number:
        <input
          type="text"
          placeholder="XXXX XXXX XXXX XXXX"
          value={cardNum}
          onChange={handleCardNumberChange}
          maxLength="19"
          required
        />
      </label><br></br>
      <label>
        Enter CVV:
        <input
          type="text"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          maxLength="4"
          required
        />
      </label><br></br>
      <label>
        Enter Expiry:
        <input
          type="month"
          placeholder="MM/YY"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          required
        />
      </label>
    </div>
  );
};

const PaymentMethod = ({ billingMethods, selectedMethod, setSelectedMethod, selectedCardNumber, setSelectedCardNumber, setNumVer, setCvvVer, setExpVer }) => (
  <div className="box-container">
    {billingMethods.length === 0 ? (
      <p>No Billing Methods. Please Add a New One.</p>
    ) : (
      billingMethods.map((method, index) => (
        <label key={index} data-testid="MakePayment-option" className="billing-box radio-option">
          <input
            type="radio"
            name="billingMethod"
            value={method.cardType}
            onChange={() => {
              setSelectedMethod(method.cardType);
              setSelectedCardNumber(method.cardNumber);
              setNumVer(false);
              setCvvVer(false);
              setExpVer(false);
            }}
          />
          <div>
            <h3>{method.cardType}</h3>
            <p>{formatCardNumber(method.cardNumber)}</p>
          </div>
          {selectedMethod && selectedCardNumber === method.cardNumber && (
            <CardVerification
              method={method}
              setNumVer={setNumVer}
              setCvvVer={setCvvVer}
              setExpVer={setExpVer}
            />
          )}
        </label>
      ))
    )}

    <div className="billing-box add-payment">
      <a href="/addPaymentMethod">Add New Payment Method</a>
    </div>
  </div>
);

function MakePayment() {
  const { userRole, studentId, handleNavigation, loading, setLoading, handleLogout } = useUser();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [billingMethods, setBillingMethods] = useState([]);
  const [financialInfo, setFinancialInfo] = useState({ totalFees: 0, amountPaid: 0, remainingBalance: 0 });
  const [numVer, setNumVer] = useState(false);
  const [cvvVer, setCvvVer] = useState(false);
  const [expVer, setExpVer] = useState(false);

  useEffect(() => {
    if (!userRole === "student") return;

    const fetchData = async () => {
      try {
        await axios.post(`http://localhost:5000/api/update-student-fees?student_id=${studentId}`);

        const { data: financeData } = await axios.get(
          `http://localhost:5000/api/student/finances?student_id=${studentId}`
        );
        const totalFees = financeData.finances.filter(item => item.item_name !== "payment").reduce((sum, item) => sum + item.amount, 0);
        const totalPaid = financeData.finances.filter(item => item.item_name === "payment").reduce((sum, item) => sum + item.amount, 0);
        const remainingBalance = totalFees - totalPaid;

        setFinancialInfo({ totalFees, amountPaid: totalPaid, remainingBalance });

        const { data: methodsData } = await axios.get(
          `http://localhost:5000/api/student/payment_methods?student_id=${studentId}`
        );
        setBillingMethods(
          methodsData.payment_methods.map(method => ({
            cardType: method.card_type,
            cardNumber: method.card_number,
            cardholderName: method.card_name,
            billingAddress: method.card_address,
            expiryDate: method.expiry_date,
            cvv: method.cvv
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error loading payment information.");
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole, studentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userRole !== "student") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only accessible to students.</p>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const studentId = localStorage.getItem("student_id");

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount greater than $0.");
      return;
    }

    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
  }
  console.log(numVer +" "+cvvVer+" "+expVer);
  
  if (!numVer || !cvvVer || !expVer) {
      const tempInputDiv = document.getElementById("card-verification");
      if (tempInputDiv && !tempInputDiv.querySelector(".error-message")) {
          tempInputDiv.innerHTML += "<p class='error-message' style='color: red;'>Invalid card details. Please check your input.</p>";
      }
      return;
  }

    try {
      console.log("Submitting payment:", {
        student_id: studentId,
        amount: parseFloat(paymentAmount),
        payment_method: selectedMethod
    });
      await axios.post("http://localhost:5000/api/make-payment", {
        student_id: studentId,
        amount: parseFloat(paymentAmount),
        payment_method: selectedMethod
      });

      alert(`Payment of $${paymentAmount} confirmed using ${selectedMethod} (${selectedCardNumber})`);
      window.location.href = "/Finances";
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error processing payment. Please try again.");
    }
  };

  return (
    <PageBackground>
    <div className="container2" id="makePayment">
      <h2>Make a Payment</h2>
      <FinancialSummary financialInfo={financialInfo} paymentAmount={paymentAmount} setPaymentAmount={setPaymentAmount} handleBlur={() => setPaymentAmount(parseFloat(paymentAmount).toFixed(2))} />
      <h2>Choose a payment method:</h2>
      <form onSubmit={handleSubmit}>
        <PaymentMethod billingMethods={billingMethods} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} selectedCardNumber={selectedCardNumber} setSelectedCardNumber={setSelectedCardNumber} setNumVer={setNumVer} setCvvVer={setCvvVer} setExpVer={setExpVer} />
        <button type="submit" className="confirm-button" disabled={financialInfo.remainingBalance <= 0}>Confirm Payment</button>
      </form>
    </div>
    </PageBackground>
  );
}

export default MakePayment;
