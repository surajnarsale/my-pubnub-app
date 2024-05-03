import { useState, useEffect } from "react";
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react";

const pubnubConfig = {
  publishKey: "key",
  subscribeKey: "key",
  uuid: "key",
  ssl: true,
};

const ChatComponent = () => {
  const pubnub = usePubNub();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const logListener = {
      message: (event) => {
        console.log("New event:", event);
        setMessages((msgs) => [...msgs, event.message]);
      },
      status: (statusEvent) => {
        console.log("Status event:", statusEvent);
      },
      presence: (presenceEvent) => {
        console.log("Presence event:", presenceEvent);
      },
    };

    pubnub.addListener(logListener);
    console.log("Subscribing to channel 'test-channel'.");
    pubnub.subscribe({ channels: ["test-channel"] });

    return () => {
      console.log("Cleaning up: unsubscribing from all channels.");
      pubnub.removeListener(logListener);
      pubnub.unsubscribeAll();
    };
  }, [pubnub]);

  const sendMessage = () => {
    if (text) {
      console.log("Sending message:", text);
      pubnub.publish({
        channel: "test-channel",
        message: { text },
        callback: (status, response) => {
          console.log("Publish status:", status);
          console.log("Publish response:", response);
        },
      });
      setText("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send Message</button>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg.text}</div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <PubNubProvider client={new PubNub(pubnubConfig)}>
      <ChatComponent />
    </PubNubProvider>
  );
};

export default App;
