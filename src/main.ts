// Main entry point for PG Waala application
import './modules/performance';
import './modules/cache';
import './modules/filters';
import './modules/virtualScroll';
import { initializeBackend } from '../backend';

// Initialize dark mode toggle
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check for saved user preference, first in localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply the appropriate theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun text-gray-300"></i>';
    } else {
        document.documentElement.classList.remove('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-moon text-gray-600"></i>';
    }
    
    // Add event listener for theme toggle
    darkModeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            darkModeToggle.innerHTML = '<i class="fas fa-moon text-gray-600"></i>';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            darkModeToggle.innerHTML = '<i class="fas fa-sun text-gray-300"></i>';
        }
    });
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    
    // Initialize dark mode
    initializeDarkMode();
    
    // Initialize the backend
    initializeBackend().catch(error => {
        console.error('Failed to initialize application:', error);
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            const errorElement = document.createElement('div');
            errorElement.className = 'bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg mb-2';
            errorElement.textContent = 'Failed to initialize application: ' + error.message;
            errorContainer.appendChild(errorElement);
        }
    });
}); 