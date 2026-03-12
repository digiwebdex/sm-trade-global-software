

# S. M. Trade International Software

## Overview
A complete business management web application for generating Bills/Invoices, Quotations, Challans, and Purchase Orders — with full admin panel for managing all data. The app will be self-hosted on your VPS with MySQL (no Supabase/Lovable dependency).

> **Note**: Since Lovable builds React frontends, I'll build the complete UI with all features. For the MySQL backend, the app will use a REST API pattern — you'll need a simple backend (Node.js/Express or PHP) on your VPS to connect to MySQL. I'll structure all API calls cleanly so they're easy to connect.

---

## Pages & Features

### 1. Login Page
- Admin and staff login with username/password
- Role-based access (Admin, Staff)

### 2. Dashboard
- Summary cards: Total Bills, Quotations, Challans, Revenue
- Recent documents list
- Monthly sales chart
- Quick action buttons to create new documents

### 3. Customer Management
- List all customers with search/filter
- Add/Edit/Delete customers
- Fields: Name, Organization, Address, Phone, Email

### 4. Product/Item Management
- Product catalog with search
- Add/Edit/Delete products
- Fields: Name, Description, Unit Price, Unit Type (Pcs, etc.)

### 5. Bill / Invoice Module
- Create new bill matching your exact format (INV-YYYY-NNN)
- Company header: S. M. Trade International branding
- Bill To section, Invoice Date, Invoice Number (auto-generated)
- Line items table: Description, Qty, Unit Price, Total (auto-calculated)
- Total Amount with amount in words (Bengali/English)
- Signature section: Received by, Prepared by, Authorize by
- Footer with company contact info and QR code placeholder
- **PDF Download & Print** support
- List/Search/Edit/Delete existing bills

### 6. Quotation Module
- Create quotation matching your format (QTS-YYYY-NNNN)
- Same header/footer branding
- SL, Description, Qty, Unit Price, Total columns
- Total Amount with amount in words
- Signature section
- PDF Download & Print
- List/Search/Edit/Delete quotations

### 7. Challan (Delivery Note) Module
- Create challan matching your format (CLN-YYYY-NNNN)
- Order No. reference
- SL, Item Name & Details, Size, Delivery Qty, Balance Qty, Unit columns
- Total Quantity row
- Signature section
- PDF Download & Print
- List/Search/Edit/Delete challans

### 8. Purchase Order Module
- Create purchase orders for suppliers
- Similar layout with supplier info, items, totals
- PDF Download & Print
- Full CRUD

### 9. User Management (Admin only)
- Add/Edit/Delete staff users
- Assign roles (Admin, Staff)

### 10. Company Settings
- Edit company name, logo, address, phone, email, website
- These details auto-populate on all documents

---

## Design
- Clean, professional admin panel with sidebar navigation
- Company branding colors: Navy blue (#1B3A5C) and Orange (#E8792B) matching your documents
- Responsive layout
- Document preview matches your exact printed format

## Technical Approach
- React + TypeScript frontend with all UI and business logic
- Local storage for demo/development (easily swappable to REST API)
- PDF generation using browser print/CSS
- Amount-to-words converter for totals
- Auto-incrementing document numbers

