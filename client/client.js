// Connect to the WebSocket server
const socket = io("http://localhost:3003");

// Listen for new orders
socket.on("order-created", (order) => {
  console.log("new order created...", order);
  displayMessage(
    `New order created: ${order.customerName} - Status: ${order.status}`
  );
});

// Listen for status updates
socket.on("status-updated", (order) => {
  console.log("order updated...", order, socket.id);
  displayMessage(
    `Order status updated: ${order.customerName} - New Status: ${order.status}`
  );
});

// Helper function to display messages
function displayMessage(message) {
  const updatesDiv = document.getElementById("updates");
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  updatesDiv.appendChild(messageElement);
}
