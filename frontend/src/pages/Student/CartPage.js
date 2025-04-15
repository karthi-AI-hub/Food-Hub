import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import axios from "axios";
import { Button, Container, Table, Alert, Modal, Badge } from "react-bootstrap";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
const CartPage = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const rollNo = localStorage.getItem("roll_no");
  const [orderDetails, setOrderDetails] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/orders", {
        rollNo,
        items: cart,
      });
      setOrderDetails(response.data);
    } catch (err) {
      alert("Failed to place order. Try again.");
      console.error(err);
    }
  };

  const handleCloseDialog = () => {
    setOrderDetails(null);
    clearCart();
  };

  const generateReceipt = async (order, items) => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(" Excel KIOSK", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.text("ORDER RECEIPT", 105, 30, null, null, "center");
    
    // Order Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: #${order.uniqueId}`, 20, 45);
    doc.text(`Roll No: ${rollNo}`, 20, 55);
    doc.text(`Status: ${order.status || "Pending"}`, 20, 65);
    doc.text(`Date: ${currentDate}`, 20, 75);
    
    // Items Table
    doc.setFont("helvetica", "bold");
    doc.text("ITEMS", 20, 90);
    doc.setFont("helvetica", "normal");
    
    let y = 100;
    items.forEach((item) => {
      doc.text(`${item.name}`, 20, y);
      doc.text(`${item.price} x ${item.quantity} = ${item.price * item.quantity}`, 160, y, null, null, "right");
      y += 10;
    });
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${total}`, 160, y + 15, null, null, "right");

    // Generate QR Code
    const qrData = JSON.stringify({
      orderId: order.uniqueId,
      rollNo,
      total,
      date: currentDate
    });

    const qrCanvas = document.createElement('canvas');
    const QRCode = await import('qrcode');
    await QRCode.toCanvas(qrCanvas, qrData);
  
    const qrDataUrl = qrCanvas.toDataURL('image/png');
    doc.addImage(qrDataUrl, 'PNG', 150, 20, 50, 50);
    doc.text("Scan for order details", 150, 75, null, null, "left");
    
    // Save PDF
    doc.save(`Order_${order.uniqueId}.pdf`);
  };

  if (cart.length === 0 && !orderDetails) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="light" className="shadow-sm">
          <h4>🛒 Your cart is empty</h4>
          <p>Add items from the menu to get started!</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h3 className="mb-4">
        <span className="me-2">🛒</span> Your Cart
        {cart.length > 0 && (
          <Badge bg="secondary" className="ms-2">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </Badge>
        )}
      </h3>
      
      <Table hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>Item</th>
            <th className="text-end">Price</th>
            <th>Quantity</th>
            <th className="text-end">Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="fw-semibold">{item.name}</td>
              <td className="text-end">₹{item.price}</td>
              <td>
                <div className="d-flex align-items-center">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </td>
              <td className="text-end fw-semibold">₹{item.price * item.quantity}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item"
                >
                  ✕
                </Button>
              </td>
            </tr>
          ))}
          <tr className="table-active">
            <td colSpan="3" className="text-end fw-bold">
              Grand Total:
            </td>
            <td colSpan="2" className="text-end fw-bold fs-5">
              ₹{total}
            </td>
          </tr>
        </tbody>
      </Table>

      <div className="d-flex justify-content-end gap-3">
        <Button 
          variant="outline-danger" 
          onClick={clearCart}
          disabled={cart.length === 0}
        >
          Clear Cart
        </Button>
        <Button 
          variant="success" 
          onClick={handlePlaceOrder}
          disabled={cart.length === 0}
        >
          Place Order
        </Button>
      </div>

      <Modal show={!!orderDetails} onHide={handleCloseDialog} centered>
  <Modal.Header closeButton className="border-0 pb-0">
    <Modal.Title>Order Confirmed!</Modal.Title>
  </Modal.Header>
  <Modal.Body className="text-center">
    <div className="mb-3">
      <Badge bg="success" className="fs-6 fw-normal">
        Order ID: #{orderDetails?.uniqueId}
      </Badge>
    </div>
    
    {/* QR Code Section */}
    <div className="mb-3">
      <QRCodeCanvas 
        value={JSON.stringify({
          orderId: orderDetails?.uniqueId,
          rollNo,
          total,
          date: new Date().toLocaleString()
        })}
        size={150}
        className="border p-2"
      />
      <p className="text-muted small mt-2">Scan QR for order details</p>
    </div>
    
    <div className="border p-3 mb-3">
      <p className="mb-0"><strong>Date:</strong> {new Date().toLocaleString()}</p>
      <p className="mb-1"><strong>Roll No:</strong> {rollNo}</p>
      <p className="mb-1"><strong>Total:</strong> ₹{total}</p>
    </div>
    
    <p className="text-muted mt-3">
      Your order has been placed successfully.
    </p>
  </Modal.Body>
  <Modal.Footer className="border-0 pt-0">
    <Button variant="outline-secondary" onClick={handleCloseDialog}>
      Close
    </Button>
    <Button 
      variant="primary" 
      onClick={() => generateReceipt(orderDetails, cart)}
    >
      Download Receipt
    </Button>
  </Modal.Footer>
</Modal>
    </Container>
  );
};

export default CartPage;