# Rudvish International Backend API

This is the backend API for the Rudvish International website, handling contact forms, bulk inquiries, and email notifications.

## Features

- Contact form processing with email notifications
- Bulk inquiry handling for B2B customers
- Rate limiting and security middleware
- Input validation using Joi
- Automated email responses
- CORS configuration for frontend integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
- SMTP credentials for email sending
- Company email address
- Other environment variables

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Contact Form
- **POST** `/api/contact`
- Accepts contact form submissions
- Sends email to company and auto-reply to customer

### Bulk Inquiry
- **POST** `/api/bulk-inquiry`
- Handles bulk product inquiries
- Processes detailed B2B requirements

### Health Check
- **GET** `/api/health`
- Returns server status and uptime 

## Deployment

This API is designed to be deployed at `api.rudvishinternational.com` with the following structure:
- Contact form: `api.rudvishinternational.com/api/contact`
- Bulk inquiry: `api.rudvishinternational.com/api/bulk-inquiry`

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (5 submissions per hour per IP)
- Input validation and sanitization
- Error handling middleware

## Email Configuration

The API uses Nodemailer with Gmail SMTP. You'll need:
1. A Gmail account or Google Workspace account
2. App-specific password (not your regular password)
3. Configure SMTP settings in environment variables

## Environment Variables

See `.env.example` for all required environment variables.
