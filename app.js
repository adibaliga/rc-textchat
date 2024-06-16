document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Check if PeerJS is loaded
  if (typeof Peer === "undefined") {
    console.error("PeerJS library is not loaded");
    alert("PeerJS library failed to load.");
    return;
  }

  // Initialize PeerJS
  const peer = new Peer();

  peer.on("open", (id) => {
    console.log("PeerJS initialized successfully, Peer ID:", id);
    document.getElementById(
      "peer-id-display"
    ).textContent = `Your Peer ID: ${id}`;
  });

  peer.on("error", (err) => {
    console.error("PeerJS error:", err);
    alert("An error occurred: " + err.message);
  });

  let conn;

  // Get DOM elements
  const connectBtn = document.getElementById("connect-btn");
  const sendBtn = document.getElementById("send-btn");
  const peerIdInput = document.getElementById("peer-id");
  const messageInput = document.getElementById("message-input");
  const messageContainer = document.getElementById("message-container");
  const chatSection = document.getElementById("chat-section");
  const connectionSection = document.getElementById("connection-section");

  // Connect to peer
  connectBtn.addEventListener("click", () => {
    const peerId = peerIdInput.value.trim();
    console.log("Attempting to connect to peer ID:", peerId);
    if (peerId) {
      conn = peer.connect(peerId);

      conn.on("open", () => {
        console.log("Connected to peer:", peerId);
        connectionSection.style.display = "none";
        chatSection.style.display = "flex";
        setupConnectionHandlers();
      });

      conn.on("error", (err) => {
        console.error("Connection error:", err);
        alert("Failed to connect: " + err.message);
      });
    }
  });

  // Send message when Send button is clicked
  sendBtn.addEventListener("click", () => {
    sendMessage();
  });

  // Send message when Enter key is pressed
  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  // Function to send a message
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      conn.send({ type: "message", data: message });
      displayMessage(message, "me"); // Display sent message
      messageInput.value = "";
    }
  }

  // Display received messages
  peer.on("connection", (connection) => {
    conn = connection;
    connection.on("open", () => {
      console.log("Received connection from peer");
      connectionSection.style.display = "none";
      chatSection.style.display = "flex";
      setupConnectionHandlers();
    });
  });

  function setupConnectionHandlers() {
    conn.on("data", (data) => {
      console.log("Received data:", data);
      if (data.type === "message") {
        displayMessage(data.data, "them"); // Display received message
      } else if (data.type === "typing") {
        if (data.data) {
          displayTypingIndicator();
        } else {
          removeTypingIndicator();
        }
      }
    });

    conn.on("close", () => {
      console.log("Connection closed");
      alert("The connection has been closed.");
      connectionSection.style.display = "flex";
      chatSection.style.display = "none";
      messageContainer.innerHTML = "";
    });
  }

  function displayMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);
    messageDiv.textContent = message;
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // Typing indicator logic
  let typingIndicatorTimeout;

  messageInput.addEventListener("input", () => {
    if (conn) {
      clearTimeout(typingIndicatorTimeout);
      conn.send({ type: "typing", data: true }); // Send typing indicator

      typingIndicatorTimeout = setTimeout(() => {
        conn.send({ type: "typing", data: false }); // Stop typing indicator after delay
      }, 1000); // Adjust delay as needed
    }
  });

  function displayTypingIndicator() {
    // Check if typing indicator already exists
    if (!document.getElementById("typing-indicator")) {
      const typingDiv = document.createElement("div");
      typingDiv.id = "typing-indicator";
      typingDiv.classList.add("message", "them");
      typingDiv.textContent = "...";
      messageContainer.appendChild(typingDiv);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  // Emoji picker function
  function toggleEmojiPicker() {
    const emojiInput = document.getElementById("message-input");
    emojiInput.value += "😀"; // Add emoji to input field
    emojiInput.focus(); // Keep focus on input field
  }
});
