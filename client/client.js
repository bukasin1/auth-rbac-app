const server = "http://localhost:3003";

const loggedInDiv = document.getElementById("loggedIn");
const logInDiv = document.getElementById("logIn");
const logInFOrm = document.getElementById("logIn-form");
const logOutBtn = document.getElementById("logOut");
const newOrderBtn = document.getElementById("newOrder");
const role = document.getElementById("role");
const adminAllOrders = document.getElementById("seeAllOrders");

const isLoggedIn = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    logInDiv.hidden = false;
    loggedInDiv.hidden = true;
  } else {
    const decodedToken = jwt_decode(token);
    role.textContent = decodedToken.role;
    if (decodedToken.role !== "admin") {
      adminAllOrders.hidden = true;
    } else {
      adminAllOrders.hidden = false;
    }
    await displayOrders();
    logInDiv.hidden = true;
    loggedInDiv.hidden = false;
  }
  return token;
};

isLoggedIn();

// Helper function to display user orders
async function displayOrders(all) {
  const token = localStorage.getItem("authToken");
  try {
    const res = await (
      await fetch(`${server}/api/orders${all ? "/all" : ""}`, {
        method: "get",
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
    ).json();

    const allOrdersDiv = document.getElementById("allOrders");
    let ordersDiv = document.getElementById("orders");
    ordersDiv.remove();
    ordersDiv = document.createElement("div");
    ordersDiv.setAttribute("id", "orders");
    (res || []).forEach((order) => {
      const orderElement = document.createElement("p");
      orderElement.textContent = `Customer name: ${order.customerName}, Order Status: ${order.status} `;

      // attach update status button if logged in role is admin
      const decodedToken = jwt_decode(token);
      if (decodedToken.role === "admin") {
        const editOrderStatus = document.createElement("button");
        editOrderStatus.textContent = "Update Status";
        orderElement.appendChild(editOrderStatus);
        editOrderStatus.addEventListener("click", (e) => {
          editOrderStatus.remove();
          orderElement.appendChild(updateOrderStatusForm(order));
        });
      }

      ordersDiv.appendChild(orderElement);
    });

    allOrdersDiv.appendChild(ordersDiv);
  } catch (err) {
    console.log("error occured...", err);
  }
}

const updateOrderStatusForm = (order) => {
  const form = document.createElement("form");
  const statusSelect = document.createElement("select");
  statusSelect.setAttribute("name", "status");
  const orderStatuses = ["Pending", "Dispatched", "In Transit", "Delivered"];
  orderStatuses.map((status) => {
    const statusSelectOption = document.createElement("option");
    statusSelectOption.textContent = status;
    statusSelect.appendChild(statusSelectOption);
  });
  statusSelect.value = order.status;
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Update";
  form.append(statusSelect, submitBtn);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = e.target.elements.status.value;

    try {
      const token = localStorage.getItem("authToken");
      const res = await (
        await fetch(`${server}/api/orders/${order._id}`, {
          method: "put",
          body: JSON.stringify({ status }),
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        })
      ).json();
    } catch (err) {
      console.log("error occured...", err);
    }
  });
  return form;
};

logInFOrm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.elements.email.value;
  const password = e.target.elements.password.value;

  try {
    const res = await (
      await fetch(`${server}/auth/login`, {
        method: "post",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (res.token) {
      localStorage.setItem("authToken", res.token);
      isLoggedIn();
    }
  } catch (err) {
    console.log("error occured...", err);
  }
});

logOutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("authToken");
  isLoggedIn();
});

newOrderBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("authToken");
    const res = await (
      await fetch(`${server}/api/orders`, {
        method: "post",
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      })
    ).json();
  } catch (err) {
    console.log("error occured...", err);
  }
});

adminAllOrders.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    if (adminAllOrders.textContent.includes("all")) {
      await displayOrders(true);
      adminAllOrders.textContent = "See my orders";
    } else {
      await displayOrders();
      adminAllOrders.textContent = "See all orders";
    }
  } catch (err) {
    console.log("error occured...", err);
  }
});

// Connect to the WebSocket server
const socket = io(server);

// Listen for new orders
socket.on("order-created", (order) => {
  if (!isLoggedIn()) return;
  console.log("new order created...", order);
  displayMessage(
    `New order created: ${order.customerName} - Status: ${order.status}`
  );
});

// Listen for status updates
socket.on("status-updated", (order) => {
  if (!isLoggedIn()) return;
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

  // Remove the message after 3 seconds
  setTimeout(() => {
    updatesDiv.innerHTML = "";
  }, 3000); // 3000ms = 3 seconds
}
