# Next.js Supabase Application

A comprehensive web application built with Next.js and Supabase, featuring TV channels, games, articles, and affiliate marketing sections with responsive design.

## Features

### 🔐 Authentication System
- User registration and login
- Password reset functionality
- Protected routes and user sessions
- Integration with Supabase Auth

### 📺 TV Channels Section
- Browse and search TV channels
- Favorite channels functionality
- Grid and list view modes
- Category filtering
- Channel details with streaming information

### 🎮 Games Center
- Interactive games with scoring system
- User statistics and achievements
- Leaderboard with rankings
- Points accumulation system
- Game categories and difficulty levels

### 📝 Articles Management
- Create, read, update, and delete articles
- Rich text editor for content creation
- Comment system with likes/dislikes
- Article categories and tags
- Image upload functionality
- Draft saving and publishing

### 💰 Affiliate Marketing
- Product catalog with affiliate links
- Click tracking and analytics
- Commission calculations
- Product search and filtering
- Favorite products management
- Detailed product pages with reviews

### 🎨 Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Custom responsive components
- Smooth animations and transitions
- Optimized for all screen sizes

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd final
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── components/           # Reusable React components
│   ├── Layout.js        # Main layout wrapper
│   └── ResponsiveContainer.js # Responsive utility components
├── contexts/            # React context providers
│   └── AuthContext.js   # Authentication context
├── lib/                 # Utility libraries
│   └── supabase.js     # Supabase client configuration
├── pages/              # Next.js pages
│   ├── _app.js         # App wrapper
│   ├── index.js        # Home page
│   ├── auth/           # Authentication pages
│   ├── channels/       # TV channels section
│   ├── games/          # Games section
│   ├── articles/       # Articles section
│   └── affiliate/      # Affiliate marketing section
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS and custom styles
├── tailwind.config.js  # Tailwind CSS configuration
└── next.config.js      # Next.js configuration
```

## Key Components

### Authentication
The app uses Supabase Auth for user management. Users can register, login, and reset passwords. Protected routes automatically redirect unauthenticated users to the login page.

### Responsive Design
Built with a mobile-first approach using Tailwind CSS. Custom responsive utilities provide consistent spacing, typography, and layout across all screen sizes.

### Data Management
Currently uses mock data for demonstration. In production, integrate with Supabase database tables for:
- User profiles
- TV channels
- Games and scores
- Articles and comments
- Affiliate products

## Customization

### Styling
Modify `tailwind.config.js` to customize:
- Color palette
- Typography scales
- Spacing values
- Breakpoints
- Animations

### Components
All components are modular and can be easily customized or extended. The responsive utilities in `ResponsiveContainer.js` provide consistent layouts.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.