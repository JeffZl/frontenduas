# Cirqulate

Cirqulate is a modern social media application built with Next.js 16, designed to connect users through posts, trends, and real-time messaging.

## Features

- **User Authentication**: Secure login and registration system.
- **Posts & Quotes**: Create, share, and interact with posts (Tweets) and quotes.
- **Explore & Trends**: Discover trending topics and new content.
- **Real-time Messaging**: Chat with other users through conversations and messages.
- **Notifications**: Stay updated with interactions and activities.
- **User Profiles**: Customizable profiles to showcase your identity.
- **Settings**: Manage your account preferences.
- **Responsive Design**: Optimized for various devices.
- **Dark/Light Mode**: Themed interface for better user experience.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Styling**: CSS Modules & Vanilla CSS
- **Authentication**: Custom implementation using `bcrypt`, `jose`, and `jsonwebtoken`
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- MongoDB instance (Local or Atlas)
- Cloudinary Account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontenduas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the necessary variables (example):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   JWT_SECRET=your_jwt_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `(auth)/`: Authentication routes (login, register).
  - `(routes)/`: Main application routes (feed, profile, messages, etc.).
  - `api/`: Backend API endpoints.
- `components/`: Reusable UI components.
- `lib/`: Utility functions and configurations.
- `models/`: Mongoose database models.
- `public/`: Static assets.
