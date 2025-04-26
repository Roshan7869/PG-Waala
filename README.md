# PG Waala

A modern web application for finding and listing Paying Guest (PG) accommodations.

## Features

- Search and filter PGs by location, price, amenities, and type
- Responsive design that works on all devices
- Dark mode support
- Performance optimized with virtual scrolling for large datasets
- Caching system for faster subsequent loads

## Tech Stack

- TypeScript
- Vite
- Tailwind CSS
- Font Awesome

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pg-waala.git
   cd pg-waala
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

   Or use the provided batch file:
   ```
   start-dev.bat
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `src/` - Source code
  - `modules/` - Core modules (performance, cache, filters, virtualScroll)
  - `types/` - TypeScript type definitions
  - `main.ts` - Application entry point
- `backend.ts` - Backend functionality
- `index.html` - Main HTML file
- `pg_data.json` - Sample PG data

## Development

### Building for Production

```
npm run build
```

### Preview Production Build

```
npm run preview
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Font Awesome for icons
- Tailwind CSS for styling 