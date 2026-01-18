# 🎌 Paisen

> **Self-hosted MyAnimeList Manager**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-13-black.svg)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green.svg)](https://www.mongodb.com/)

**Paisen** is a powerful, self-hosted anime management application that integrates with MyAnimeList to provide a comprehensive anime tracking experience. With its lightning-fast local database, Paisen transforms how you discover, track, and manage your anime collection.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🚀 Quick Start](#-quick-start)
- [📋 Prerequisites](#-prerequisites)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [ API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🎯 Core Functionality
- **🔐 MyAnimeList Integration** - Full OAuth2 authentication with secure token management
- **📚 Anime List Management** - View, update, and organize your complete collection
- **🔍 Universal Search** - Lightning-fast search across multiple databases
- **📊 Rich Analytics** - Comprehensive statistics and watching pattern insights
- **👥 Multi-user Support** - Isolated accounts with personal data protection

### 🗄️ Database & Performance
- **🚀 Lightning Speed** - 90% faster than direct API calls
- **🔍 Full-text Search** - Advanced indexing across all metadata
- **📱 Offline Support** - Complete functionality without internet
- **🆔 Universal IDs** - Cross-platform mapping (MAL, AniDB)
- **📊 Analytics Engine** - Detailed statistics and performance metrics
- **🔄 Smart Caching** - Intelligent data synchronization and updates

### 🗺️ Anime Mapping System
- **🔗 Offline Database** - Uses [manami-project/anime-offline-database](https://github.com/manami-project/anime-offline-database) for cross-platform mappings
- **🤖 Auto-Mapping** - Automatic MAL to AniDB ID mapping suggestions
- **✅ User Confirmation** - Review and confirm suggested mappings
- **✏️ Manual Override** - Enter custom AniDB IDs when auto-mapping fails
- **📊 Mapping Statistics** - Track confirmed vs suggested mappings
- **🔄 Periodic Updates** - Regular offline database updates for latest mappings

---

## 📸 Screenshots

### 🏠 Dashboard & Authentication

<div align="center">

| Home Dashboard | User Registration |
|:---:|:---:|
| ![Home](screens/home.jpg) | ![Register](screens/register.jpg) |
| *Main dashboard with activity overview and quick access* | *Secure user registration with validation* |

| User Login | OAuth Authorization |
|:---:|:---:|
| ![Login](screens/login.jpg) | ![Authorize](screens/authorise.jpg) |
| *Clean login interface with authentication* | *MyAnimeList OAuth integration* |

</div>

### 📚 Anime Management

<div align="center">

| Original Anime List |
|:---:|
| ![Anime List](screens/anime-list.jpg) |
| *Original list view with status tracking* |

</div>

### 📊 Analytics & Statistics

<div align="center">

| Statistics Overview | Score Distribution |
|:---:|:---:|
| ![Statistics](screens/statistics-list.jpg) | ![Score Distribution](screens/statistics-score-distribution.jpg) |
| *Detailed analytics and watching patterns* | *Score distribution and rating insights* |

</div>

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ninjashari/paisen.git
cd paisen

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000) to view Paisen**

---

## 📋 Prerequisites

Before installing Paisen, ensure you have the following:

### Required Software
- **Node.js** 18.0+ ([Download](https://nodejs.org/))
- **MongoDB** 6.0+ ([Installation Guide](https://www.mongodb.com/docs/manual/installation/))
- **Git** ([Download](https://git-scm.com/))

### Required Accounts
- **MyAnimeList Account** ([Create Account](https://myanimelist.net/register.php))
- **MyAnimeList API Application** ([Create App](https://myanimelist.net/blog.php?eid=835707))

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/ninjashari/paisen.git
cd paisen
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create your environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# MyAnimeList API Configuration
MAL_CLIENT_ID=your_mal_client_id_here

# Security Keys (Generate secure random strings)
SECRET=your_32_character_secret_key_here
SYNC_KEY=your_secure_sync_key_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/paisen

# Application URL
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup

Start MongoDB service:

```bash
# On macOS (with Homebrew)
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Start Development Server

```bash
npm run dev
```

🎉 **Your Paisen instance is now running at [http://localhost:3000](http://localhost:3000)**

### 6. Production Build

For production deployment:

```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB
```

### 5. Build and Start

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

---

## 🔧 Configuration

### MyAnimeList API Setup

1. **Visit [MyAnimeList API](https://myanimelist.net/blog.php?eid=835707)**
2. **Click "Create ID"** to create a new application
3. **Fill in application details:**
   - **App Type:** `Web`
   - **App Name:** `Paisen` (or your preferred name)
   - **App Description:** `Self-hosted anime management`
   - **App Redirect URL:** `http://localhost:3000/oauth`
   - **Homepage URL:** `http://localhost:3000/`
   - **Commercial/Non-Commercial:** `Non-Commercial`
4. **Copy the Client ID** to your `.env.local` file

### Security Configuration

Generate secure keys for your installation:

```bash
# Generate SECRET (32 characters)
openssl rand -hex 16

# Generate SYNC_KEY (any secure string)
openssl rand -base64 32
```

---

##  API Documentation

Paisen provides a comprehensive REST API for integration with other applications.

**API documentation coming soon.**

## 🧪 Testing

Run the full test suite:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

## 🔧 Troubleshooting

**"Error: Could not connect to MongoDB"**
- Ensure your MongoDB server is running.
- Verify that `MONGODB_URI` in `.env.local` is correct.

### Common Issues and Solutions

#### MyAnimeList Issues

**❌ Authentication Failed**
```
Error: Invalid client credentials
```
**✅ Solution:**
1. Verify `MAL_CLIENT_ID` in `.env.local`
2. Check redirect URL in MAL app settings: `http://localhost:3000/oauth`
3. Ensure app is approved and active

**❌ Token Expired**
```
Error: Access token has expired
```
**✅ Solution:**
1. Navigate to OAuth page in Paisen
2. Re-authorize your MyAnimeList account
3. Check token expiry in user settings

#### Database Issues

**❌ Connection Error**
```
Error: MongoNetworkError: connect ECONNREFUSED
```
**✅ Solution:**
1. Start MongoDB service: `sudo systemctl start mongod`
2. Check connection string in `.env.local`
3. Verify MongoDB is listening on correct port
4. Check disk space and permissions

**❌ Performance Issues**
```
Warning: Slow database queries
```
**✅ Solution:**
1. Check available disk space
2. Monitor MongoDB performance
3. Consider adding database indexes
4. Review query patterns in logs

#### General Issues

**❌ Application Won't Start**
```
Error: Cannot find module 'next'
```
**✅ Solution:**
1. Run `npm install` to install dependencies
2. Check Node.js version (requires 18+)
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
4. Check for conflicting global packages

**❌ Build Errors**
```
Error: Build failed with errors
```
**✅ Solution:**
1. Check syntax errors in code
2. Verify all environment variables are set
3. Run `npm run build` to see detailed errors
4. Check for missing dependencies

### Getting Help

#### 1. Built-in Diagnostics

- **Browser Console** → Check for client-side errors
- **Network Tab** → Monitor API requests and responses

#### 2. Log Analysis

```bash
# Check application logs
npm run dev  # Development logs in console

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Check system logs
sudo journalctl -u mongod -f
```

#### 3. Debug Mode

Enable debug logging in `.env.local`:

```env
NODE_ENV=development
DEBUG=paisen:*
```

#### 4. Community Support

- **GitHub Issues:** [Report bugs and request features](https://github.com/ninjashari/paisen/issues)
- **Discussions:** [Ask questions and share ideas](https://github.com/ninjashari/paisen/discussions)
- **Wiki:** [Detailed documentation and guides](https://github.com/ninjashari/paisen/wiki)

When reporting issues, please include:
- Operating system and version
- Node.js and npm versions
- Error messages and logs
- Steps to reproduce the issue
- Screenshots if applicable

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or helping with testing, your contributions make Paisen better for everyone.

### 🚀 Quick Start for Contributors

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/paisen.git
cd paisen

# Add upstream remote
git remote add upstream https://github.com/ninjashari/paisen.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to your fork and create a pull request
git push origin feature/your-feature-name
```

### 📋 Contribution Guidelines

#### Code Style
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Include JSDoc comments for functions
- Run `npm run lint` before committing

#### Testing
- Write tests for new features
- Ensure all existing tests pass
- Aim for high test coverage
- Include both unit and integration tests

#### Documentation
- Update README.md for new features
- Add inline code comments
- Update API documentation
- Include screenshots for UI changes

#### Pull Request Process
1. **Create an issue** first to discuss major changes
2. **Keep PRs focused** on a single feature or bug fix
3. **Write clear commit messages** following conventional commits
4. **Include tests** for new functionality
5. **Update documentation** as needed
6. **Request review** from maintainers

### 🎯 Areas for Contribution

#### 🐛 Bug Fixes
- Fix reported issues
- Improve error handling
- Enhance stability
- Performance optimizations

#### ✨ New Features
- Additional anime data sources
- Enhanced search capabilities
- Mobile app development
- Advanced analytics features

#### 📚 Documentation
- Improve setup guides
- Add troubleshooting sections
- Create video tutorials
- Translate documentation

#### 🧪 Testing
- Increase test coverage
- Add integration tests
- Performance benchmarking
- Cross-platform testing

#### 🎨 UI/UX Improvements
- Design enhancements
- Accessibility improvements
- Mobile responsiveness
- User experience optimization

### 🏷️ Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new search functionality
fix: resolve authentication token expiry issue
docs: update installation guide
test: add integration tests for MyAnimeList sync
refactor: improve database query performance
style: fix code formatting issues
```

### 📝 Issue Templates

When creating issues, please use our templates:

- **🐛 Bug Report:** For reporting bugs
- **✨ Feature Request:** For suggesting new features
- **📚 Documentation:** For documentation improvements
- **❓ Question:** For asking questions

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Commercial use** - You can use this software commercially
- ✅ **Modification** - You can modify the source code
- ✅ **Distribution** - You can distribute the software
- ✅ **Private use** - You can use this software privately
- ❌ **Liability** - The authors are not liable for any damages
- ❌ **Warranty** - No warranty is provided with this software

---

## 🙏 Acknowledgments

### 🌟 Core Technologies
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[MongoDB](https://www.mongodb.com/)** - Document database for data storage
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[Bootstrap](https://getbootstrap.com/)** - CSS framework for responsive design

### 🔌 External Services
- **[MyAnimeList](https://myanimelist.net/)** - Primary anime database and user lists

### 👥 Community
- **Contributors** - Everyone who has contributed code, documentation, or feedback
- **Beta Testers** - Users who helped test and improve the application
- **Community Members** - Active participants in discussions and support

### 🎨 Design Resources
- **[Bootstrap Icons](https://icons.getbootstrap.com/)** - Icon library
- **[Unsplash](https://unsplash.com/)** - Stock photos for documentation
- **Community Screenshots** - User-contributed interface examples

---

<div align="center">

### 🎌 Made with ❤️ for the Anime Community

**[⭐ Star this project](https://github.com/ninjashari/paisen)** • **[🐛 Report Issues](https://github.com/ninjashari/paisen/issues)** • **[💬 Join Discussions](https://github.com/ninjashari/paisen/discussions)**

</div> 