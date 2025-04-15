import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Tabs,
  Tab,
  Badge,
  Alert,
} from "react-bootstrap";
import API from "../../api/axios";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const response = await API.get(`/orders/status/${status}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleViewDetails = async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      alert("Failed to fetch order details.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Completed":
        return "success";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const generateReceipt = async (order) => {
    const doc = new jsPDF();
    const currentDate = new Date(order[0].created_at).toLocaleString();
    const total = order.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

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
    doc.text(`Order ID: #${order[0].unique_id}`, 20, 45);
    doc.text(`Roll No: ${order[0].roll_no}`, 20, 55);
    doc.text(`Status: ${order[0].status}`, 20, 65);
    doc.text(`Date: ${currentDate}`, 20, 75);

    // Items Table
    doc.setFont("helvetica", "bold");
    doc.text("ITEMS", 20, 90);
    doc.setFont("helvetica", "normal");

    let y = 100;
    order.forEach((item) => {
      doc.text(`${item.name}`, 20, y);
      doc.text(
        `${item.price} x ${item.quantity} = ${item.price * item.quantity}`,
        160,
        y,
        null,
        null,
        "right"
      );
      y += 10;
    });

    // Total
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${total}`, 160, y + 15, null, null, "right");

    // Generate QR Code
    const qrData = JSON.stringify({
      orderId: order[0].unique_id,
      rollNo: order[0].roll_no,
      total,
      date: currentDate,
    });

    const qrCanvas = document.createElement("canvas");
    const QRCode = await import("qrcode");
    await QRCode.toCanvas(qrCanvas, qrData);

    const qrDataUrl = qrCanvas.toDataURL("image/png");
    doc.addImage(qrDataUrl, "PNG", 150, 20, 50, 50);
    doc.text("Scan for order details", 150, 75, null, null, "left");

    // Save PDF
    doc.save(`Order_${order[0].unique_id}.pdf`);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      setIsCancelling(true);
      try {
        await API.put(`/orders/cancel/${orderId}`);
        toast.success("Order cancelled successfully");
        setSelectedOrder(null);
        fetchOrders(activeTab);
      } catch (error) {
        console.error("Error cancelling order:", error);
        toast.error("Failed to cancel order. Please try again.");
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <h3 className="mb-4 d-flex align-items-center">
        <span className="me-2">📦</span> My Orders
      </h3>

      {/* Tabs for filtering orders */}
      <Tabs
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        className="mb-4"
        variant="pills"
      >
        <Tab eventKey="Pending" title="Pending" />
        <Tab eventKey="Completed" title="Completed" />
        <Tab eventKey="Cancelled" title="Cancelled" />
      </Tabs>

      {loading ? (
        <Alert variant="info" className="text-center">
          Loading orders...
        </Alert>
      ) : orders.length === 0 ? (
        <Alert variant="light" className="text-center">
          No {activeTab.toLowerCase()} orders found
        </Alert>
      ) : (
        <Table hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Date</th>
              {/* <th>Total Price</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="fw-semibold">#{order.unique_id}</td>
                <td>
                  <Badge bg={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                </td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Order Details Modal */}
      {selectedOrder && selectedOrder.length > 0 && (
        <Modal show onHide={() => setSelectedOrder(null)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="mb-3">
              <Badge
                bg={getStatusBadge(selectedOrder[0].status)}
                className="fs-6 fw-normal"
              >
                Order ID: #{selectedOrder[0].unique_id}
              </Badge>
            </div>

            {/* QR Code Section */}
            <div className="mb-3">
              <QRCodeCanvas
                value={JSON.stringify({
                  orderId: selectedOrder[0].unique_id,
                  rollNo: selectedOrder[0].roll_no,
                  date: new Date(selectedOrder[0].created_at).toLocaleString(),
                })}
                size={150}
                className="border p-2 mb-2"
              />
              <p className="text-muted small">Scan for order details</p>
            </div>

            <div className="border p-3 mb-3">
              <p className="mb-1">
                <strong>Roll No:</strong> {selectedOrder[0].roll_no}
              </p>
              <p className="mb-1">
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder[0].created_at).toLocaleString()}
              </p>
              <p className="mb-0">
                <strong>Status:</strong>{" "}
                <Badge bg={getStatusBadge(selectedOrder[0].status)}>
                  {selectedOrder[0].status}
                </Badge>
              </p>
            </div>

            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th className="text-end">Price</th>
                  <th>Quantity</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.map((item) => (
                  <tr key={item.item_id}>
                    <td>{item.name}</td>
                    <td className="text-end">₹{item.price}</td>
                    <td>{item.quantity}</td>
                    <td className="text-end">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
                <tr className="table-active">
                  <td colSpan="3" className="text-end fw-bold">
                    Grand Total:
                  </td>
                  <td className="text-end fw-bold">
                    ₹
                    {selectedOrder.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </Button>
            {selectedOrder[0].status === "Pending" && (
              <Button
                variant="danger"
                onClick={() => handleCancelOrder(selectedOrder[0].id)}
                disabled={isCancelling}
                className="me-2"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => generateReceipt(selectedOrder)}
            >
              Download Receipt
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default OrdersPage;
