import { useEffect, useRef, useState } from "react";
import logo from "/assets/openai-logomark.svg";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const mediaRecorderRef = useRef(null);

  async function startSession() {
    // Get an ephemeral key from the Fastify server
    const tokenResponse = await fetch("/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
    pc.addTrack(ms.getTracks()[0]);

    // Set up MediaRecorder to capture the mic audio
    const recorder = new MediaRecorder(ms);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  // Stop current session, clean up peer connection, data channel, and stop recording
  function stopSession() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  // When the recorder stops, combine the chunks and create an audio URL
  useEffect(() => {
    if (!isSessionActive && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedAudioURL(url);
      console.log("Recorded audio URL:", url);
      // Optionally, you could create a download link or audio player in your UI here.
    }
  }, [isSessionActive, recordedChunks]);

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      message.event_id = message.event_id || crypto.randomUUID();
      try {
        dataChannel.send(JSON.stringify(message));
      } catch (err) {
        console.error("Error sending message:", err, message);
      }
      // Limit stored events to a maximum of 100 to prevent state overload.
      setEvents((prev) => {
        const newEvents = [message, ...prev];
        return newEvents.length > 100 ? newEvents.slice(0, 100) : newEvents;
      });
    } else {
      console.error("Failed to send message - no data channel available", message);
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener("message", (e) => {
        try {
          const parsed = JSON.parse(e.data);
          setEvents((prev) => {
            const newEvents = [parsed, ...prev];
            return newEvents.length > 100 ? newEvents.slice(0, 100) : newEvents;
          });
        } catch (err) {
          console.error("Error parsing data channel message:", err, e.data);
        }
      });
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
      dataChannel.addEventListener("error", (err) => {
        console.error("Data channel error:", err);
      });
    }
  }, [dataChannel]);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center">
        <div className="flex items-center gap-4 w-full m-4 pb-2 border-0 border-b border-solid border-gray-200">
          <img style={{ width: "24px" }} src={logo} alt="Logo" />
          <h1>realtime console</h1>
        </div>
      </nav>
      <main className="absolute top-16 left-0 right-0 bottom-0">
        <section className="absolute top-0 left-0 right-[380px] bottom-0 flex">
          <section className="absolute top-0 left-0 right-0 bottom-32 px-4 overflow-y-auto">
            <EventLog events={events} />
          </section>
          <section className="absolute h-32 left-0 right-0 bottom-0 p-4">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              events={events}
              isSessionActive={isSessionActive}
            />
          </section>
        </section>
        <section className="absolute top-0 w-[380px] right-0 bottom-0 p-4 pt-0 overflow-y-auto">
          <ToolPanel
            sendClientEvent={sendClientEvent}
            sendTextMessage={sendTextMessage}
            events={events}
            isSessionActive={isSessionActive}
          />
          {recordedAudioURL && (
            <div>
              <h2>Recorded Audio</h2>
              <audio controls src={recordedAudioURL}></audio>
              <a href={recordedAudioURL} download="recording.webm">
                Download Recording
              </a>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
