# MotiQuote - Daily Motivation App

MotiQuote is a modern mobile application built with React Native and Expo that delivers daily motivational quotes to inspire and uplift users. The app features a beautiful UI, daily notifications, and a collection of inspiring quotes from various authors.

## Features

- **Daily Quotes**: Receive a new motivational quote every day
- **Customizable Notifications**: Set your preferred time for daily quote notifications
- **Quote Discovery**: Browse through a collection of motivational quotes
- **Favorites**: Save your favorite quotes for later reference
- **Dark Mode**: Switch between light and dark themes
- **Share Quotes**: Easily share inspiring quotes with friends and family
- **Modern UI**: Clean and intuitive user interface

## Tech Stack

- **Frontend**: React Native, Expo
- **State Management**: React Context API
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rmsoftwaree/MotiQuote-App.git
cd MotiQuote-App
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your device:
- Install the Expo Go app on your mobile device
- Scan the QR code with your device's camera
- The app will open in Expo Go

## Project Structure

```
MotiQuote-App/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── discover.tsx   # Quote discovery screen
│   │   ├── favorites.tsx  # Favorites screen
│   │   ├── index.tsx      # Today's quote screen
│   │   └── settings.tsx   # App settings screen
│   ├── context/           # Context providers
│   │   └── ThemeContext.tsx
│   └── theme/             # Theme configuration
│       └── theme.ts
├── assets/                # Static assets
│   └── images/           # Quote background images
└── README.md             # Project documentation
```

## Key Features Implementation

### Daily Notifications
- Customizable notification time
- Daily quote delivery
- Test notification functionality
- Permission handling

### Quote Management
- Random quote selection
- Favorite quotes storage
- Quote sharing capability
- Background image integration

### Theme Support
- Light/Dark mode toggle
- Dynamic color schemes
- Consistent UI across themes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

