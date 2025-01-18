# Task!t - Elegant Task Management App 📝

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)
[![Stars](https://img.shields.io/github/stars/Owusu1946/Taskit.svg)](https://github.com/Owusu1946/Taskit/stargazers)
[![Forks](https://img.shields.io/github/forks/Owusu1946/Taskit.svg)](https://github.com/Owusu1946/Taskit/network/members)
[![Issues](https://img.shields.io/github/issues/Owusu1946/Taskit.svg)](https://github.com/Owusu1946/Taskit/issues)

</div>

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Tech Stack](#-tech-stack)
- [Customization](#-customization)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## Overview

Task!t is a modern, feature-rich task management application built with React Native and Expo. It combines beautiful animations, intuitive design, and powerful features to help users stay organized and productive.

## ✨ Features

| Category | Features |
|----------|----------|
| **Task Management** | • Create, edit, and delete tasks<br>• Set priorities (High, Medium, Low)<br>• Custom categories<br>• Due dates and notes<br>• Task completion tracking<br>• Bulk actions |
| **Smart Organization** | • List/Grid views<br>• Multiple sorting options<br>• Category filtering<br>• Search functionality<br>• Calendar integration |
| **Statistics & Insights** | • Task analytics<br>• Progress tracking<br>• Category distribution<br>• Priority analysis<br>• Completion rates |
| **User Experience** | • Smooth animations<br>• Haptic feedback<br>• Gesture controls<br>• Dark/Light modes<br>• Onboarding tutorial |
| **Data Management** | • Local storage<br>• Backup/Restore<br>• Import/Export<br>• Data reset options |

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | v14 or higher |
| npm/yarn | Latest stable |
| Expo CLI | Latest stable |
| iOS Simulator / Android Emulator | Optional |

### Installation

1. **Fork the Repository**
   - Click the 'Fork' button at the top right of this page
   - Select your GitHub account as the destination
   - Wait for the forking process to complete
   - Clone your forked repository:
     ```bash
     git clone https://github.com/Owusu1946/Taskit.git
     ```

2. **Set Up the Project**
   ```bash
   # Navigate to project
   cd Taskit

   # Install dependencies
   npm install

   # Start the app
   npx expo start
   ```

### Running the App

| Platform | Command | Description |
|----------|---------|-------------|
| iOS | Press `i` | Launches iOS simulator |
| Android | Press `a` | Launches Android emulator |
| Physical Device | Scan QR | Use Expo Go app |

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native |
| Build Tool | Expo |
| Navigation | Expo Router |
| Styling | NativeWind |
| Animations | React Native Reanimated |
| Icons | Expo Vector Icons |
| Storage | AsyncStorage |
| Haptics | Expo Haptics |


## 🎨 Customization

### Themes
The app uses a customizable theme system. Modify `constants/theme.ts` to change:
- Colors
- Typography
- Spacing
- Categories
- Priorities

### Styling
All styles are managed through NativeWind (Tailwind CSS). Modify the styles by:
1. Editing component className props
2. Updating tailwind.config.js
3. Creating custom utility classes

### Styling Options/Instance

1. **Component Styles**
   ```tsx
   <View className="bg-blue-500 p-4 rounded-lg">
   ```

2. **Custom Utilities**
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         // Custom configurations
       }
     }
   }
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. **Fork the Repository**
 - Create your feature branch (`git checkout -b feature/AmazingFeature`)
 - Commit your changes (`git commit -m 'Add some AmazingFeature'`)
 - Push to the branch (`git push origin feature/AmazingFeature`)
 - Open a Pull Request

 2. **Development Guidelines**
   - Follow the coding style
   - Add tests for new features
   - Update documentation
   - Ensure CI/CD passes

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🙏 Acknowledgments

- Design inspiration from modern task management apps
- Expo team for the amazing development platform
- Expo Ghana community for the robust ecosystem
- Samuel Agbenyo 

## 📞 Contact

O'Kenneth - [@Okenneth2255](https://twitter.com/Okenneth2255)

Project Link: [Taskit](https://github.com/Owusu1946/Taskit)


---

<div align="center">
Made with ❤️ by O'Kenneth

⭐️ Star this project if you find it helpful!
</div>
