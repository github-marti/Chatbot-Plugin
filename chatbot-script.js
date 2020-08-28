window.onload = function () {
  // module-level variables
  const BRAIN_URL = "https://webuyyourproblem.com/brain/";
  let user,
    msg,
    complete = false;
  const theme = {
    primary: "#ff3d00",
    primaryDark: "#d63200",
    secondary: "#989898",
  };

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

  // event functions
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
            }, i * 1000);
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
    input.value = "";
    e.preventDefault();
    if (!msg || complete) {
      return;
    }
    addMessage("user", msg);
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
          if (
            data.output.output_messages[0] ===
            "Thanks for providing this information. We’ll do some research into properties that have sold nearby and get right back with you."
          ) {
            complete = true;
          }
          user = data.output.user;
          msgs.forEach((m, i) => {
            setTimeout(function () {
              addMessage("bot", m);
            }, i * 1000);
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
  const chatbox = document.createElement("div");
  const inputBar = document.createElement("form");
  const input = document.createElement("input");
  const submitBtn = document.createElement("button");

  // add attributes
  container.className = "container";
  topBar.className = "top-bar";
  topBar.innerText = "ALI Real Estate Chatbox";
  chatbox.className = "chatbox";
  inputBar.className = "input-bar";
  input.className = "input";
  input.type = "text";
  input.placeholder = "Talk to me!";
  submitBtn.className = "submit-btn";
  submitBtn.type = "submit";
  submitBtn.innerText = "SEND";

  // nest appropriate elements
  container.appendChild(topBar);
  container.appendChild(chatbox);
  container.appendChild(inputBar);
  inputBar.appendChild(input);
  inputBar.appendChild(submitBtn);

  // append to HTML
  document.body.appendChild(container);

  // add event listeners
  submitBtn.addEventListener("click", submit);
  input.addEventListener("input", handleInput);

  // include CSS file
  addStylesheet("styles.css");

  // start the conversation
  startConvo();
};
