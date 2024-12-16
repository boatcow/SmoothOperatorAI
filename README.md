# Smooth Operator - AI Negotiator

![Screenshot 2024-12-15 at 9 11 19 PM](https://github.com/user-attachments/assets/0b3b1d28-b84a-49bf-b6bd-df9bc6beda2f)

## Introduction

Welcome to the Smooth Operator AI! This project uses LangChain to negotiate the price of a product or service offerings from an external vendor/contractor, currently focusing on moving services.

This service is deployed at [https://smooth-operator.web.app/](https://smooth-operator.web.app/) if you want to try it out. 

If running locally, it would require adding all auth tokens such as OpenAI, LangChain, Twilio, and Firebase.

## Frontend Setup Instructions

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

### Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

#### Step 1: Start the Metro Server

To start Metro, run the following command from the root of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

#### Step 2: Start your Application

Let Metro Bundler run in its own terminal. Open a new terminal from the root of your React Native project. Run the following command to start your Android or iOS app:

**For Android**

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

**For iOS**

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

#### Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Windows and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Backend Setup Instructions

This guide will help you set up the backend server for the voice assistant application.

### Prerequisites

- Ensure you have Python 3.8+ installed on your machine.
- You need an account with Twilio and a verified phone number. You can verify your number in the [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/verified).
- **Firebase Setup**: Create a Firebase project and download the `firebase_Adminsdk.json` file.

### Setup Steps

1. **Run ngrok**

   To expose your local server to the internet, you'll need to run ngrok. Open a terminal and execute the following command:

   ```bash
   ngrok http 8000
   ```

   Copy the `Forwarding` URL provided by ngrok. It will look something like `https://[your-ngrok-subdomain].ngrok.app`.

2. **Update the .env File**

   Update a `.env` file in the root of your project directory with credentials, use the above ngrok URL for the server.

3. **Install Dependencies**

   In the terminal, navigate to your project directory and run:

   ```bash
   pip install -r requirements.txt
   ```

4. **Setup Firebase**

   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project or select an existing one.
   - Navigate to Project Settings > Service accounts.
   - Generate a new private key and download the `firebase_adminsdk.json` file.
   - Place the `firebase_adminsdk.json` file in the `backend` directory of your project.

5. **Run the Server**

   Start the server by executing:

   ```bash
   python app.py
   ```

### Notes

- Ensure the phone number you are calling is verified in the Twilio Console if you are in trial mode.
- If you encounter any issues, check the logs for error messages and verify your environment variables are set correctly.

## Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how to set up your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
