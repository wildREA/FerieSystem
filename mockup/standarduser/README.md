# FerieSystem - Student Portal (Multi-Page Version)

## Overview
The student portal has been converted from a single-page application (SPA) to a traditional multi-page application with separate HTML files for each section.

## Page Structure

### 1. **index.html** - Landing Page
- Entry point for the student portal
- Quick access to all major sections
- Shows logged-in user information

### 2. **dashboard.html** - Main Dashboard
- Overview of vacation balance and statistics
- Recent requests display
- Quick action buttons
- Progress bars showing used/pending hours

### 3. **new-request.html** - Request Submission
- Form for submitting new vacation requests
- Real-time duration calculator
- Balance validation and warnings
- Request preview functionality
- 48-hour advance notice validation

### 4. **requests.html** - Request Management
- View all submitted requests
- Filter by status (pending, approved, denied)
- Detailed request information
- Status badges and timestamps

### 5. **balance.html** - Balance Overview
- Detailed balance breakdown
- Usage history and transactions
- Balance information and policies
- Visual progress indicators

## JavaScript Architecture

### Common Functionality (`js/common.js`)
- Shared data objects (studentData, requestsData, balanceHistory)
- Data management with localStorage simulation
- Common utilities (date formatting, notifications, calculations)
- Navigation setup and user info updates
- Page transition animations

### Page-Specific Scripts
- **`js/dashboard.js`** - Dashboard specific functionality
- **`js/new-request.js`** - Form handling and request submission
- **`js/requests.js`** - Request filtering and display
- **`js/balance.js`** - Balance calculations and history

## Navigation
Each page includes a sidebar navigation that links to other pages:
- Navigation is handled via page redirects (traditional web navigation)
- Active page is indicated by the "active" class on navigation items
- All navigation is responsive and maintains state across pages

## Data Persistence
- Mock data is shared across pages via common.js
- Future implementation can replace with API calls
- LocalStorage simulation maintains data across page reloads

## Key Features Maintained
- Real-time form validation
- Duration calculations for vacation requests
- Balance warnings and notifications
- 48-hour advance notice requirements
- Request status filtering
- Responsive design
- Bootstrap integration
- Smooth animations and transitions

## Migration Notes
**Removed Files:**
- `studentview.html` - Old single-page application
- `js/student-dashboard.js` - Old monolithic JavaScript file

**Benefits of Multi-Page Architecture:**
- Better SEO and accessibility
- Faster page loads (smaller JS bundles per page)
- Easier maintenance and debugging
- Clearer separation of concerns
- Traditional browser navigation (back/forward buttons work)
- Better caching strategies

## Key Features

### Data Persistence
- Uses localStorage to simulate server-side data persistence
- Data survives page refreshes and navigation
- Automatic save/load on page transitions

### Navigation
- Click-based navigation between pages
- Active page indication in sidebar
- Logo click returns to dashboard
- Smooth transitions and hover effects

### Form Validation
- Real-time form validation
- Working hours calculation
- Balance sufficiency checks
- Advance notice warnings

### Responsive Design
- Mobile-friendly layouts
- Flexible grid systems
- Adaptive navigation for smaller screens

## File Organization

```
standarduser/
├── index.html              # Landing page
├── dashboard.html          # Main dashboard
├── new-request.html        # Request form
├── requests.html           # Request management
├── balance.html            # Balance overview
├── studentview.html        # Original SPA (kept for reference)
├── css/
│   ├── styles.css          # Base styles
│   └── student-styles.css  # Student-specific styles
└── js/
    ├── common.js           # Shared functionality
    ├── dashboard.js   # Dashboard specific
    ├── new-request.js # Request form handling
    ├── requests.js    # Request management
    ├── balance.js     # Balance functionality
    └── student-dashboard.js # Original SPA script (kept for reference)
```

## Usage

### Starting Point
- Navigate to `index.html` to access the student portal
- Or directly access any page (`dashboard.html`, `new-request.html`, etc.)

### Navigation
- Use the sidebar navigation to switch between pages
- Click the logo to return to the dashboard
- Use quick action buttons on various pages

### Data Management
- All form submissions are saved to localStorage
- Data persists across page refreshes
- Request counters update automatically

## Development Notes

### Browser Compatibility
- Requires modern browsers with ES6 support
- Uses localStorage for data persistence
- Bootstrap 5.3.6 for UI components

### Customization
- Modify `js/common.js` to change data structures
- Update individual page scripts for specific functionality
- Customize styles in `css/student-styles.css`

### Future Enhancements
- Add server-side integration
- Implement real authentication
- Add more detailed validation rules
- Include email notifications
- Add calendar integration
