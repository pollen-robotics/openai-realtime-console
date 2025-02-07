// ToolPanel.js
import { useEffect, useState } from "react";

// A simple component to display the output of the play_emotion function call.
function EmotionOutput({ output }) {
  const { emotion_name, intensity } = JSON.parse(output.arguments);
  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h2 className="text-xl font-bold">Emotion Detected</h2>
      <p>
        <strong>Emotion:</strong> {emotion_name}
      </p>
      <p>
        <strong>Intensity:</strong> {intensity} / 100
      </p>
      <pre className="text-xs mt-2 p-2 bg-white border rounded">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}

export default function ToolPanel({ isSessionActive, sendClientEvent, events }) {
  const [toolAdded, setToolAdded] = useState(false);
  const [emotionOutput, setEmotionOutput] = useState(null);

  useEffect(() => {
    if (!events || events.length === 0) return;

    // When the session is created, send the session update with our tool.
    const firstEvent = events[events.length - 1];
    if (!toolAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setToolAdded(true);
    }

    // Look for the most recent event that is a function call response from the assistant.
    // We expect a function call with name "play_emotion".
    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output) => {
        if (
          output.type === "function_call" &&
          output.name === "play_emotion"
        ) {
          setEmotionOutput(output);
        }
      });
    }
  }, [events, toolAdded, sendClientEvent]);

  useEffect(() => {
    if (!isSessionActive) {
      setToolAdded(false);
      setEmotionOutput(null);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">Emotion Panel</h2>
        {isSessionActive ? (
          emotionOutput ? (
            <EmotionOutput output={emotionOutput} />
          ) : (
            <p>Speak to the assistant to express your emotions...</p>
          )
        ) : (
          <p>Start the session to use the emotion panel...</p>
        )}
      </div>
    </section>
  );
}

// Session update payload for tool registration.
const sessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "play_emotion",
        description:
          "Call this function when the assistant detects a change in emotion. Provide the emotion name and its intensity (0-100).",
        parameters: {
          type: "object",
          strict: true,
          properties: {
            emotion_name: {
              type: "string",
              description: "The name of the emotion (e.g., happy, sad, excited, etc.).",
            },
            intensity: {
              type: "number",
              description: "The intensity of the emotion (from 0 to 100).",
            },
          },
          required: ["emotion_name", "intensity"],
        },
      },
    ],
    tool_choice: "auto",
  },
};