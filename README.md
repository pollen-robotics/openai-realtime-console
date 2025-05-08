# OpenAI Realtime Console (Fork for Reachy2 Emotions Project)

This repository is a specialized fork of the [OpenAI Realtime Console](https://github.com/openai/openai-realtime-console). It includes the original console features along with custom modifications designed to interact specifically with the Reachy2 emotions project.

## Fork-Specific Modifications (Reachy2 Emotions)

### How It Works

- **Installation**: First, follow the original installation instructions below. Clone this repository. If you're using Reachy2 Docker stack, we recommend installing this outside the container to avoid host<->container sound issues. Then:
- **Running the application**:
  - After installation, launch the console with `npm run dev`
  - Go to the address that appears on the console with your web browser, e.g. `http://127.0.0.1:3000/`
  - Click on **"Start session"**.
  - Ensure the Reachy2 Emotions module is running in **server mode** so the robot reacts appropriately.
  - Start talking into your microphone.
  - The console sends emotion names detected from your speech via a Flask server.

### Test your microphone setup
After clicking on **"Start session"**, talk into your microphone and stop the session.
A small audio player should appear in the bottom right of the screen allowing you to hear what was said.
Use this to check if your microphone setup is working properly.

### Customizing the Main Prompt

- Modify the main prompt by editing the file located at:

```
client/components/ToolPanel.jsx
```

Any changes made to this file will affect the behavior and emotion detection logic.

## Full demo
To get Reachy2 to play the emotions, follow these instructions:
https://github.com/pollen-robotics/reachy2_emotions

---


# Original OpenAI Realtime Console

This is an example application showing how to use the [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) with [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc).

## Installation and usage

Before you begin, you'll need an OpenAI API key - [create one in the dashboard here](https://platform.openai.com/settings/api-keys). Create a `.env` file from the example file and set your API key in there:

```bash
cp .env.example .env
```

Running this application locally requires [Node.js](https://nodejs.org/) to be installed. Install dependencies for the application with:

```bash
npm install
```

Start the application server with:

```bash
npm run dev
```

This should start the console application on [http://localhost:3000](http://localhost:3000).

_Note:_ The `server.js` file uses [@fastify/vite](https://fastify-vite.dev/) to build and serve the React frontend contained in the [`/client`](./client) folder. You can find the configuration in the [`vite.config.js`](./vite.config.js) file.

## Previous WebSockets version

The previous version of this application that used WebSockets on the client (not recommended in client-side browsers) [can be found here](https://github.com/openai/openai-realtime-console/tree/websockets).

## License

MIT
