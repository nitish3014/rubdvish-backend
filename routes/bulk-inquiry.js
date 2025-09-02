const express = require('express');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const router = express.Router();

// Validation schema for bulk inquiry form
const bulkInquirySchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().min(6).max(20).required(),
  company: Joi.string().trim().min(2).max(100).required(),
  country: Joi.object({
    value: Joi.string().required(),
    label: Joi.string().required(),
    flag: Joi.string().required()
  }).allow(null),
  products: Joi.array().items(Joi.string()).min(1).required(),
  quantity: Joi.string().trim().min(1).max(100).required(),
  timeline: Joi.string().trim().min(1).max(100).required(),
  budget: Joi.string().trim().allow('').max(50),
  additionalRequirements: Joi.string().trim().allow('').max(1000)
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


// POST /api/bulk-inquiry
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = bulkInquirySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      company, 
      country, 
      products, 
      quantity, 
      timeline, 
      budget, 
      additionalRequirements 
    } = value;

    // Create email content
    const emailContent = `
      <h2>New Bulk Inquiry Submission</h2>
      <h3>Company & Contact Details:</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Country:</strong> ${country ? country.label : 'Not specified'}</p>
      
      <h3>Inquiry Details:</h3>
      <p><strong>Products of Interest:</strong></p>
      <ul>
        ${products.map(product => `<li>${product}</li>`).join('')}
      </ul>
      <p><strong>Quantity Required:</strong> ${quantity}</p>
      <p><strong>Timeline:</strong> ${timeline}</p>
      <p><strong>Budget Range:</strong> ${budget || 'Not specified'}</p>
      
      ${additionalRequirements ? `
        <h3>Additional Requirements:</h3>
        <p>${additionalRequirements.replace(/\n/g, '<br>')}</p>
      ` : ''}
      
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
      subject: `New Bulk Inquiry from ${company}`,
      html: emailContent
    };

    // Auto-reply to customer
    const autoReplyOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for your bulk inquiry - Rudvish International',
      html: `
        <h2>Thank you for your bulk inquiry!</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>We have received your bulk inquiry for <strong>${company}</strong> and our team will prepare a detailed quotation for you.</p>
        
        <h3>Your Inquiry Summary:</h3>
        <p><strong>Products:</strong> ${products.join(', ')}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Timeline:</strong> ${timeline}</p>
        
        <p>Our sales team will contact you within 24 hours with:</p>
        <ul>
          <li>Detailed product specifications</li>
          <li>Competitive pricing</li>
          <li>Shipping options and timelines</li>
          <li>Quality certifications</li>
          <li>Sample availability</li>
        </ul>
        
        <p>Best regards,<br>
        Rudvish International Sales Team<br>
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
      message: 'Bulk inquiry submitted successfully! Our team will contact you within 24 hours.'
    });

  } catch (error) {
    console.error('Bulk inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry. Please try again later.'
    });
  }
});

module.exports = router;