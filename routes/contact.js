const express = require('express');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const router = express.Router();

// Validation schema for contact form
const contactSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  country: Joi.object({
    value: Joi.string().required(),
    label: Joi.string().required(),
    flag: Joi.string().required()
  }).allow(null),
  phone: Joi.string().trim().min(6).max(20).required(),
  subject: Joi.string().trim().min(5).max(100).required(),
  message: Joi.string().trim().min(10).max(1000).required()
});

// Configure nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};


// POST /api/contact
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { firstName, lastName, email, country, phone, subject, message } = value;

    // Create email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <h3>Contact Details:</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Country:</strong> ${country ? country.label : 'Not specified'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
      
      <hr>
      <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
      <p><small>IP Address: ${req.ip}</small></p>
    `;

    // Create transporter
    const transporter = createTransporter();

    // Email to company
    const companyMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.COMPANY_EMAIL || 'contact@techiexporter.com',
      subject: `New Contact: ${subject}`,
      html: emailContent
    };

    // Auto-reply to customer
    const autoReplyOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting Rudvish International',
      html: `
        <h2>Thank you for your inquiry!</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>We have received your message and will get back to you within 24 hours.</p>
        
        <h3>Your Message Details:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        
        <p>Best regards,<br>
        Rudvish International Team<br>
        Email: contact@techiexporter.com<br>
        Phone: +91 8956862772</p>
      `
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(companyMailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;