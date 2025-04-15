import React, { useEffect, useState, useContext } from "react";
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
  FloatingLabel,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaShoppingCart,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FaSmile } from "react-icons/fa";
import API from "../../api/axios";
import LoadingScreen from "../../components/LoadingScreen";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./MenuPage.css"; //

const MenuPage = () => {
  const { cart, addToCart, updateQuantity } = useContext(CartContext);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const [showSmile, setShowSmile] = useState(false);
  const [smilePosition, setSmilePosition] = useState({ x: 0, y: 0 });

  const fetchMenu = async () => {
    try {
      const response = await API.get("/menu");
      setMenuItems(response.data);
      setFilteredItems(response.data);

      // Calculate max price for range filter
      const maxPrice = Math.max(
        ...response.data.map((item) => item.price),
        1000
      );
      setPriceRange([0, maxPrice]);

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      toast.error("Failed to load menu. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Get unique categories
  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  // Filtering and sorting logic
  useEffect(() => {
    let filtered = [...menuItems];

    // Search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Sort
    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, sortOrder, menuItems, priceRange]);

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setShowItemModal(true);
  };

  const handleAddToCart = async (item, qty, event) => {
    // Calculate position if event exists (click from button)
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const newPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top
      };
      await setSmilePosition(newPosition); // Wait for this state update
    }
  
    addToCart({ ...item, quantity: qty });
    toast.success(`${qty} ${item.name} added to cart!`);
  
    // Show smile animation after position is set
    setShowSmile(true);
    setTimeout(() => {
      setShowSmile(false);
    }, 1000);
  
    // If called from modal, close modal
    if (event === undefined) {
      setShowItemModal(false);
    }
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container className="mt-4 menu-page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <span className="text-primary">🍽️ Today's Menu</span>
        </h2>
        <Badge bg="secondary" className="fs-6">
          {filteredItems.length} items
        </Badge>
      </div>

      {/* Enhanced Filters */}
      <Card className="mb-4 shadow-sm filter-card">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={3} className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>

            <Col md={3} className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FaSortAmountDown />
                </InputGroup.Text>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">Sort by</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </Form.Select>
              </InputGroup>
            </Col>

            <Col md={2} className="mb-3">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSortOrder("");
                  setPriceRange([
                    0,
                    Math.max(...menuItems.map((item) => item.price), 1000),
                  ]);
                }}
                className="w-100"
              >
                Clear All
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Label>
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </Form.Label>
              <Form.Range
                min={0}
                max={Math.max(...menuItems.map((item) => item.price), 1000)}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Menu Display */}
      {filteredItems.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredItems.map((item) => (
            <Col key={item.id}>
              <Card
                className="h-100 shadow-sm menu-item-card"
                onClick={() => handleViewItem(item)}
              >
                <div className="image-container">
                  <Card.Img
                    variant="top"
                    src={
                      item.image_url.startsWith('/uploads/')
                        ? `${process.env.REACT_APP_BACKEND_URL}${item.image_url}` // Prepend backend URL for relative paths
                        : item.image_url || 'https://via.placeholder.com/300x200?text=No+Image' // Use absolute URL as is
                    }
                    alt={item.name}
                    className="menu-item-image"
                    onError={(e) => console.error('Image failed to load:', e.target.src)}
                  />
                {!item.available && (
                  <div className="out-of-stock-overlay">
                    <span>Out of Stock</span>
                  </div>
                )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title className="mb-2">{item.name}</Card.Title>
                    <Badge bg="primary" className="fs-6">
                      ₹{item.price}
                    </Badge>
                  </div>

                  <Card.Text className="text-muted small mb-2">
                    {item.category}
                  </Card.Text>

                  <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
  variant={item.available ? "primary" : "secondary"}
  disabled={!item.available}
  onClick={(e) => {
    e.stopPropagation();
    handleAddToCart(item, 1, e); // Pass the event here
  }}
  className="mt-auto"
>
  {item.available ? "Add to Cart" : "Unavailable"}
</Button>
                  </motion.div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info" className="text-center">
          No items match your filters. Try adjusting your search criteria.
        </Alert>
      )}

      {/* Item Detail Modal */}
      <Modal
        show={showItemModal}
        onHide={() => setShowItemModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <img
                src={
                  selectedItem.image_url ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={selectedItem.name}
                className="img-fluid rounded mb-3"
              />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Badge bg="info">{selectedItem.category}</Badge>
                </div>
                <h4 className="text-primary mb-0">₹{selectedItem.price}</h4>
              </div>

              <div className="d-flex align-items-center mb-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <FaMinus />
                </Button>
                <span className="mx-3 fs-5">{quantity}</span>
                <Button
                  variant="outline-secondary"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  <FaPlus />
                </Button>
              </div>

              <div className="d-flex justify-content-between">
                <div className="fw-bold">
                  Total: ₹{(selectedItem.price * quantity).toFixed(2)}
                </div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="primary"
                    disabled={!selectedItem.available}
                    onClick={(e) => handleAddToCart(selectedItem, quantity, e)}
                  >
                    Add to Cart
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Enhanced Floating Cart Button */}
      <motion.div
        animate={{
          scale: cartItemCount > 0 ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="primary"
          className="floating-cart-btn"
          onClick={() => navigate("/cart")}
        >
          <FaShoppingCart size={20} />
          {cartItemCount > 0 && (
            <motion.span
              key={cartItemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="cart-badge"
            >
              {cartItemCount}
            </motion.span>
          )}
        </Button>
      </motion.div>
      {/* Smile Animation */}
      <AnimatePresence>
  {showSmile && (
    <motion.div
      initial={{
        opacity: 1,
        x: smilePosition.x,
        y: smilePosition.y,
        scale: 1,
      }}
      animate={{
        y: smilePosition.y - 100,
        opacity: 0,
        scale: 1.5,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
        fontSize: "2rem",
        color: "#ff6b6b",
        left: `${smilePosition.x}px`,
        top: `${smilePosition.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <FaSmile />
    </motion.div>
  )}
</AnimatePresence>
    </Container>
  );
};

export default MenuPage;
