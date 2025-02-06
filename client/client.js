const server = "http://localhost:3003";

const loggedInDiv = document.getElementById("loggedIn");
const loggedOutDiv = document.getElementById("loggedOut");
const logInForm = document.getElementById("logIn-form");
const logInFormError = document.getElementById("logIn-form-error");
const signUpForm = document.getElementById("signUp-form");
const signUpRoleSelect = document.getElementById("signUpRole");
const signUpFormError = document.getElementById("signUp-form-error");
const logOutBtn = document.getElementById("logOut");
const newOrderBtn = document.getElementById("newOrder");
const role = document.getElementById("role");
const adminAllOrders = document.getElementById("seeAllOrders");

const computeSignupRoles = () => {
  const userRoles = ["admin", "shipper", "carrier"];
  userRoles.map((status) => {
    const statusSelectOption = document.createElement("option");
    statusSelectOption.textContent = status;
    signUpRoleSelect.appendChild(statusSelectOption);
  });
};

const isLoggedIn = async () => {
  logInFormError.textContent = "";
  signUpFormError.textContent = "";
  const token = localStorage.getItem("authToken");
  if (!token) {
    loggedOutDiv.hidden = false;
    loggedInDiv.hidden = true;
    computeSignupRoles();
    return null;
  } else {
    const decodedToken = jwt_decode(token);
    if (Date.now() > decodedToken.exp * 1000) {
      localStorage.removeItem("authToken");
      isLoggedIn();
      return;
    }
    role.textContent = decodedToken.role;
    if (decodedToken.role !== "admin") {
      adminAllOrders.hidden = true;
      await displayOrders();
    } else {
      adminAllOrders.hidden = false;
      await displayOrders(true);
    }
    loggedOutDiv.hidden = true;
    loggedInDiv.hidden = false;
    return decodedToken;
  }
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

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.elements.email.value;
  const password = e.target.elements.password.value;
  const role = e.target.elements.role.value;
  const name = e.target.elements.name.value;

  try {
    const res = await (
      await fetch(`${server}/auth/register`, {
        method: "post",
        body: JSON.stringify({ email, password, role, name }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    signUpFormError.textContent = res.message;
    if (res.token) {
      localStorage.setItem("authToken", res.token);
      isLoggedIn();
    }
  } catch (err) {
    console.log("error occured...", err);
  }
});

logInForm.addEventListener("submit", async (e) => {
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

    logInFormError.textContent = res.message;
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
socket.on("order-created", async (order) => {
  const { id: userId, role } = (await isLoggedIn()) || {};
  if (role !== "admin" && userId !== order.customerId) return;
  console.log("new order created...", order);
  displayMessage(
    `New order created: ${order.customerName} - Status: ${order.status}`
  );
});

// Listen for status updates
socket.on("status-updated", async (order) => {
  const { id: userId, role } = (await isLoggedIn()) || {};
  if (role !== "admin" && userId !== order.customerId) return;
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
