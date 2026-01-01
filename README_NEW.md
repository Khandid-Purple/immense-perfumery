<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌸 Immense Perfumery

Immense Perfumery is a premium, AI-powered e-commerce platform dedicated to curate and match the world's most exquisite fragrances. Specifically tailored for the Ghanaian climate, it leverages cutting-edge AI to help users discover their signature scent through visual and conversational inspiration.

## ✨ Key Features

- **Flora: Your Signature Scent Consultant**: A streaming AI chatbot that acts as an expert consultant, trained in climate-specific longevity and sillage.
- **Scent Match AI**: A multi-modal AI analyzer that translates images, moods, or masterpieces into olfactory essences and matching product recommendations.
- **Curated Collection**: A hand-picked selection of luxury fragrances, from timeless classics like Chanel No. 5 to modern masterpieces like Baccarat Rouge 540.
- **Ghana-Centric Design**: Optimized for local regions, shipping rates, and preferences, including support for Ghana Post GPS digital addresses.
- **Premium User Experience**: A high-end, responsive design with parallax effects, glassmorphism, and smooth transitions.

## 🚀 Technology Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Vanilla CSS with custom brand tokens and Tailwind CSS utilities.
- **AI Engine**: Google Generative AI (Gemini 2.0 Flash) for chat and image analysis.
- **State Management**: React Context API for Shop, Auth, Theme, and Toast notifications.
- **Persistence**: Mock backend integration using `localStorage` for seamless local testing.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Khandid-Purple/immense-perfumery.git
   cd immense-perfumery
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Create a `.env.local` file in the root directory (or copy from `.env.example`).
   - Add your [Gemini API Key](https://aistudio.google.com/app/apikey):
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to experience Immense Perfumery.

## 🏛️ Architecture Overview

- **`components/`**: Modular UI components (Navbar, Hero, Product Cards, etc.).
- **`context/`**: Global state management for shopping sessions and user authentication.
- **`services/`**: Integration logic for the mock API and Gemini AI services.
- **`data/`**: Initial product catalog and static assets.
- **`types.ts`**: Unified TypeScript interfaces for project-wide type safety.

## 📝 License

This project is private and intended for demonstration purposes. All product images and brand names are trademarks of their respective owners.
