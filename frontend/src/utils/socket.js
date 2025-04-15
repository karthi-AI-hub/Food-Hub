import socket from "../../utils/socket";

useEffect(() => {
  socket.on("new_order", (data) => {
    // Fetch updated orders when a new order is placed
    fetchOrders();
  });

  socket.on("order_updated", (data) => {
    // Fetch updated orders when an order is updated
    fetchOrders();
  });

  return () => {
    socket.off("new_order");
    socket.off("order_updated");
  };
}, []);

export default socket;
