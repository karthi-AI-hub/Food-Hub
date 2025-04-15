import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Form,
  Spinner,
  Badge,
  InputGroup,
  Table,
  Alert,
  Modal,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaCheck,
  FaTimes,
  FaEye,
  FaPrint,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../api/axios";
import LoadingScreen from "../../components/LoadingScreen";
import { toast } from "react-toastify";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending");
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await API.get("/canteen/orders");
      setOrders(response.data);
      setFilteredOrders(response.data.filter(order => order.status === activeTab));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Filtering and sorting logic
  useEffect(() => {
    let filtered = orders.filter(order => order.status === activeTab);

    // Search
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortOrder === "asc") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredOrders(filtered);
  }, [searchTerm, sortOrder, orders, activeTab]);

  const handleViewOrder = async (order) => {
    try {
      const response = await API.get(`/orders/${order.id}`); // Fetch full order details
      if (response.data && response.data.length > 0) {
        setSelectedOrder(response.data); // Set the full order details, including items
        setShowOrderModal(true);
      } else {
        toast.error("No details found for this order.");
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to fetch order details. Please try again.");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh orders
      setShowOrderModal(false);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="mt-4 order-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <span className="text-primary">📦 Order Management</span>
        </h2>
        <Badge bg="secondary" className="fs-6">
          {filteredOrders.length} {activeTab.toLowerCase()} orders
        </Badge>
      </div>

      {/* Tab Navigation */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        variant="pills"
      >
        <Tab eventKey="Pending" title="Pending Orders" />
        <Tab eventKey="Completed" title="Completed Orders" />
        <Tab eventKey="Cancelled" title="Cancelled Orders" />
      </Tabs>

      {/* Enhanced Filters */}
      <Card className="mb-4 shadow-sm filter-card">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={4} className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FaSortAmountDown />
                </InputGroup.Text>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">Sort by</option>
                  <option value="asc">Date: Oldest First</option>
                  <option value="desc">Date: Newest First</option>
                </Form.Select>
              </InputGroup>
            </Col>

            <Col md={2} className="mb-3">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setSortOrder("");
                }}
                className="w-100"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Display */}
      {filteredOrders.length > 0 ? (
        <Card className="shadow-sm">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Student Roll No</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.unique_id}</td>
                  <td>{order.roll_no}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="me-2"
                    >
                      <FaEye /> View
                    </Button>
                    {order.status === 'Pending' && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'Completed')}
                          className="me-2"
                        >
                          <FaCheck /> Complete
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                        >
                          <FaTimes /> Cancel
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Alert variant="info" className="text-center">
          No {activeTab.toLowerCase()} orders found
        </Alert>
      )}

      {/* Order Detail Modal */}
      <Modal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details - #{selectedOrder?.[0]?.unique_id || "N/A"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && selectedOrder.length > 0 ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <p className="mb-1"><strong>Student Roll No:</strong> {selectedOrder[0]?.roll_no}</p>
                  <p className="mb-1"><strong>Order Date:</strong> {new Date(selectedOrder[0]?.created_at).toLocaleString()}</p>
                </div>
                <Badge bg={getStatusBadge(selectedOrder[0]?.status)} className="fs-6">
                  {selectedOrder[0]?.status}
                </Badge>
              </div>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.map((item) => (
                    <tr key={item.item_id}>
                      <td>{item.name}</td>
                      <td>₹{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Grand Total:</td>
                    <td className="fw-bold">
                      ₹{selectedOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          ) : (
            <p>No order details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderManagement;