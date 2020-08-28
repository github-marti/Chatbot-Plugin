window.onload = function () {
  // module-level variables
  const BRAIN_URL = "https://webuyyourproblem.com/brain/";
  const delay = 1000;
  let user,
    msg,
    started = false,
    complete = false,
    collapsed = true;

  // helper functions
  const addStylesheet = file => {
      const head = document.getElementsByTagName('head')[0];
      const style = document.createElement("link");
      style.href = file;
      style.type = "text/css";
      style.rel = "stylesheet";
      head.append(style);
  }

  const addMessage = (speaker, msg) => {
    const wrapper = document.createElement("div");
    const bubble = document.createElement("div");
    const className = speaker === "user" ? "user-bubble" : "bot-bubble";
    bubble.innerText = msg;
    bubble.className = className;
    wrapper.className = "message-wrapper";
    wrapper.appendChild(bubble);
    chatbox.insertBefore(wrapper, chatbox.firstChild);
  };

  const showTypingIndicator = () => {
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    for (let i = 0; i < 3; i++) {
        typingIndicator.appendChild(document.createElement("span"));
    };
    chatbox.insertBefore(typingIndicator, chatbox.firstChild);
  }

  const hideTypingIndicator = () => {
      const typingIndicator = document.querySelector(".typing-indicator");
      typingIndicator.parentNode.removeChild(typingIndicator);
  }

  // event functions
  const expandChatbot = () => {
      collapsed = false;
      container.className += " expanded"
      if (!started) {
          startConvo();
          started = true;
      }
  }

  const collapseChatbot = () => {
      collapsed = true;
      container.className = "container";
  }

  const startConvo = async () => {
    try {
      await fetch(BRAIN_URL + "/brain/intro/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const msgs = data.output.output_messages;
          user = data.output.user;
          msgs.forEach((m, i) => {
            setTimeout(function () {
              addMessage("bot", m);
            }, (i * delay) + delay);
          });
        });
    } catch (e) {
      console.log(e);
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    msg = value;
  };

  const submit = async (e) => {
    e.preventDefault();
    input.value = "";
    if (!msg || complete) {
      return;
    }
    addMessage("user", msg);
    setTimeout(showTypingIndicator, 300);
    try {
      await fetch(BRAIN_URL + "/brain/test/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msg,
          user_id: user,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const msgs = data.output.output_messages;
          user = data.output.user;
          if (
            data.output.output_messages[0] ===
            "Thanks for providing this information. We’ll do some research into properties that have sold nearby and get right back with you."
          ) {
            complete = true;
          }
          setTimeout(hideTypingIndicator, delay);
          msgs.forEach((m, i) => {
            setTimeout(function () {
              addMessage("bot", m);
            }, (i * delay) + delay);
          });
        });
    } catch (e) {
      console.log(e);
    }
    msg = "";
  };

  // DOM element variables
  const canvas = document.createElement("div");
  const relativeWrapper = document.createElement("div");
  const container = document.createElement("div");
  const topBar = document.createElement("div");
  const chatIcon = document.createElement("img");
  const chatbox = document.createElement("div");
  const inputBar = document.createElement("form");
  const input = document.createElement("input");
  const submitBtn = document.createElement("button");

  // add attributes
  canvas.className = "canvas";
  relativeWrapper.className = "relative-wrapper";
  container.className = "container";
  topBar.className = "top-bar";
  topBar.innerText = "ALI Chatbot";
  chatIcon.setAttribute("src", "chatbubbles.png");
  chatIcon.className = "chat-icon";
  chatbox.className = "chatbox";
  inputBar.className = "input-bar";
  input.className = "input";
  input.type = "text";
  input.placeholder = "Talk to me!";
  submitBtn.className = "submit-btn";
  submitBtn.type = "submit";
  submitBtn.innerText = "SEND";

  // nest appropriate elements
  canvas.appendChild(relativeWrapper);
  relativeWrapper.appendChild(container);
  container.appendChild(topBar);
  container.appendChild(chatbox);
  container.appendChild(inputBar);
  topBar.insertBefore(chatIcon, topBar.firstChild);
  inputBar.appendChild(input);
  inputBar.appendChild(submitBtn);

  // append to HTML
  document.body.appendChild(canvas);

  // add event listeners
  topBar.addEventListener("click", function() {
      if (collapsed) {
          expandChatbot();
      } else {
          collapseChatbot();
      }
  });
  submitBtn.addEventListener("click", submit);
  input.addEventListener("input", handleInput);

  // include CSS file
  addStylesheet("styles.css");
};
