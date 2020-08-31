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
    const chatbox = document.querySelector(".ali--chatbox");
    const wrapper = document.createElement("div");
    const bubble = document.createElement("div");
    const className = speaker === "user" ? "ali--user-bubble" : "ali--bot-bubble";
    bubble.innerText = msg;
    bubble.className = className;
    wrapper.className = "ali--message-wrapper";
    chatbox.scrollTop = chatbox.scrollHeight;
    wrapper.appendChild(bubble);
    chatbox.insertBefore(wrapper, chatbox.firstChild);
  };

  const showTypingIndicator = () => {
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "ali--typing-indicator";
    for (let i = 0; i < 3; i++) {
        typingIndicator.appendChild(document.createElement("span"));
    };
    chatbox.insertBefore(typingIndicator, chatbox.firstChild);
  }

  const hideTypingIndicator = () => {
      const typingIndicator = document.querySelector(".ali--typing-indicator");
      typingIndicator.parentNode.removeChild(typingIndicator);
  }

  // event functions
  const expandChatbot = () => {
      collapsed = false;
      container.className += " ali--expanded"
      if (!started) {
          startConvo();
          started = true;
      }
  }

  const collapseChatbot = () => {
      collapsed = true;
      container.className = "ali--container";
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
    setTimeout(showTypingIndicator, delay);
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
          const chatbox = document.querySelector(".ali--chatbox");
          const msgs = data.output.output_messages;
          user = data.output.user;
          if (
            data.output.output_messages[0] ===
            "Thanks for providing this information. We’ll do some research into properties that have sold nearby and get right back with you."
          ) {
            complete = true;
          }
          chatbox.scrollTop  = chatbox.scrollHeight;
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
  const container = document.createElement("div");
  const topBar = document.createElement("div");
  const chatIcon = document.createElement("img");
  const chatbox = document.createElement("div");
  const inputBar = document.createElement("form");
  const input = document.createElement("input");
  const submitBtn = document.createElement("button");

  // add attributes
  container.className = "ali--container";
  topBar.className = "ali--top-bar";
  topBar.innerText = "ALI Chatbot";
  chatIcon.setAttribute("src", "https://ali-chat-bot.s3-us-west-2.amazonaws.com/chatbubbles.png");
  chatIcon.className = "ali--chat-icon";
  chatbox.className = "ali--chatbox";
  inputBar.className = "ali--input-bar";
  input.className = "ali--input";
  input.type = "text";
  input.placeholder = "Talk to me!";
  submitBtn.className = "ali--submit-btn";
  submitBtn.type = "submit";
  submitBtn.innerText = "SEND";

  // nest appropriate elements
  container.appendChild(topBar);
  container.appendChild(chatbox);
  container.appendChild(inputBar);
  topBar.insertBefore(chatIcon, topBar.firstChild);
  inputBar.appendChild(input);
  inputBar.appendChild(submitBtn);

  // append to HTML
  document.body.appendChild(container);

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
