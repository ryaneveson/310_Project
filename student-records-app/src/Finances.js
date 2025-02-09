import React, { useEffect, useState } from "react";
import "./finances.css";

function Finances() {
  const [billingMethods, setBillingMethods] = useState([]);
  const [itemsDue, setItemsDue] = useState([]);

  useEffect(() => {
    // sample billing methods array
    setBillingMethods([
      { "Card Type": "Visa", "Card Number": "**** **** **** 1234", "Cardholder Name": "John Doe", "Billing Address": "123 Main St, City, Country" },
      { "Card Type": "MasterCard", "Card Number": "**** **** **** 5678", "Cardholder Name": "Jane Smith", "Billing Address": "456 Elm St, City, Country" }
    ]);

    // sample items due array
    setItemsDue([
      ["course1", "500", "Jan 1"],
      ["course2", "500", "Jan 1"],
      ["fees", "250", "Sept 1"]
    ]);
  }, []);

  return (
    <div className="container" id="finances">
      <h1>Financial Dashboard</h1>
      <div className="box-container">
        <p role="region">Current Account Balance: {/* replace with real data */}</p>
        <p role="region">Amount due in next 30 days: {/* replace with real data */}</p>
        <p role="region">Total future amount due: {/* replace with real data */}</p>
        <a role="region" href="/makePayment">Pay Tuition</a>
        <a role="region" href="/finances">Change financial information</a>

        <div role="region" className="info-table">
          <div id="billing-tables">
            <h3>Billing Methods:</h3>
            {/* render billing methods tables */}
            {billingMethods.map((method, index) => (
              <div key={index}>
                <h4>{`Billing Method ${index + 1}`}</h4>
                <table>
                  {Object.entries(method).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{value}</td>
                    </tr>
                    ))}
                </table>
              </div>
            ))}
          </div>
        </div>

        <div role="region" className="info-table">
          <h3>Future Items Due</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody id="items-due">
              {/* render items due table */}
              {itemsDue.map((item, index) => (
                <tr key={index}>
                  {item.map((detail, i) => (
                    <td key={i}>{detail}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Finances;
