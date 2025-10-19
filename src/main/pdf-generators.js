const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor(settings) {
    this.settings = settings;
  }

  async generateInvoice(order, filePath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(24).text(this.settings.store_name || 'Softwrap POS', { align: 'center' });
        doc.fontSize(10).text(this.settings.store_address || '', { align: 'center' });
        doc.text(`Phone: ${this.settings.store_phone || ''}`, { align: 'center' });
        doc.text(`Tax Number: ${this.settings.tax_number || ''}`, { align: 'center' });
        doc.moveDown();

        // Invoice details
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10);
        doc.text(`Invoice #: ${order.order_number}`, 50, 200);
        doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 50, 215);
        doc.text(`Customer: ${order.customer_name || 'Walk-in Customer'}`, 50, 230);
        doc.text(`Status: ${order.status.toUpperCase()}`, 400, 200);

        // Line
        doc.moveDown();
        doc.moveTo(50, 260).lineTo(550, 260).stroke();

        // Table header
        const tableTop = 280;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Qty', 300, tableTop);
        doc.text('Price', 370, tableTop);
        doc.text('Total', 470, tableTop, { width: 80, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Items
        doc.font('Helvetica');
        let y = tableTop + 25;

        order.items.forEach(item => {
          doc.text(item.product_name, 50, y, { width: 240 });
          doc.text(item.quantity.toString(), 300, y);
          doc.text((item.unit_price).toFixed(2), 370, y);
          doc.text((item.total).toFixed(2), 470, y, { width: 80, align: 'right' });
          y += 25;
        });

        // Totals section
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 15;

        const currency = this.settings.currency_symbol || 'EGP';

        doc.text('Subtotal:', 400, y);
        doc.text(`${order.subtotal.toFixed(2)} ${currency}`, 470, y, { width: 80, align: 'right' });
        y += 20;

        if (order.discount_total > 0) {
          doc.text('Discount:', 400, y);
          doc.text(`-${order.discount_total.toFixed(2)} ${currency}`, 470, y, { width: 80, align: 'right' });
          y += 20;
        }

        if (order.shipping_cost > 0) {
          doc.text('Shipping:', 400, y);
          doc.text(`${order.shipping_cost.toFixed(2)} ${currency}`, 470, y, { width: 80, align: 'right' });
          y += 20;
        }

        doc.text('Tax:', 400, y);
        doc.text(`${order.tax_total.toFixed(2)} ${currency}`, 470, y, { width: 80, align: 'right' });
        y += 20;

        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Total:', 400, y);
        doc.text(`${order.total.toFixed(2)} ${currency}`, 470, y, { width: 80, align: 'right' });

        // Footer
        if (this.settings.receipt_footer) {
          doc.fontSize(10).font('Helvetica');
          doc.text(this.settings.receipt_footer, 50, 700, { align: 'center', width: 500 });
        }

        doc.end();

        stream.on('finish', () => {
          resolve({ success: true, path: filePath });
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateReceipt(order, filePath, thermal = false) {
    return new Promise((resolve, reject) => {
      try {
        const doc = thermal 
          ? new PDFDocument({ size: [226.77, 841.89], margin: 10 }) // 80mm thermal
          : new PDFDocument({ size: 'A4', margin: 50 });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const width = thermal ? 206.77 : 500;
        const startX = thermal ? 10 : 50;

        // Header
        doc.fontSize(thermal ? 12 : 16).font('Helvetica-Bold');
        doc.text(this.settings.store_name || 'Softwrap POS', startX, thermal ? 10 : 50, { width, align: 'center' });
        
        doc.fontSize(thermal ? 8 : 10).font('Helvetica');
        if (this.settings.store_address) {
          doc.text(this.settings.store_address, { width, align: 'center' });
        }
        if (this.settings.store_phone) {
          doc.text(`Tel: ${this.settings.store_phone}`, { width, align: 'center' });
        }
        if (this.settings.tax_number) {
          doc.text(`VAT: ${this.settings.tax_number}`, { width, align: 'center' });
        }

        doc.moveDown();
        doc.text('='.repeat(thermal ? 32 : 50), { align: 'center' });
        doc.moveDown();

        // Receipt info
        doc.text(`Receipt: ${order.order_number}`);
        doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`);
        if (order.customer_name) {
          doc.text(`Customer: ${order.customer_name}`);
        }
        doc.moveDown();

        doc.text('-'.repeat(thermal ? 32 : 50));
        doc.moveDown();

        // Items
        order.items.forEach(item => {
          doc.text(`${item.product_name}`);
          doc.text(`  ${item.quantity} x ${item.unit_price.toFixed(2)} = ${item.total.toFixed(2)}`);
        });

        doc.moveDown();
        doc.text('-'.repeat(thermal ? 32 : 50));

        // Totals
        const currency = this.settings.currency_symbol || 'EGP';
        doc.text(`Subtotal: ${order.subtotal.toFixed(2)} ${currency}`, { align: 'right' });
        
        if (order.discount_total > 0) {
          doc.text(`Discount: -${order.discount_total.toFixed(2)} ${currency}`, { align: 'right' });
        }
        if (order.shipping_cost > 0) {
          doc.text(`Shipping: ${order.shipping_cost.toFixed(2)} ${currency}`, { align: 'right' });
        }
        
        doc.text(`Tax: ${order.tax_total.toFixed(2)} ${currency}`, { align: 'right' });
        doc.moveDown();
        
        doc.fontSize(thermal ? 10 : 12).font('Helvetica-Bold');
        doc.text(`TOTAL: ${order.total.toFixed(2)} ${currency}`, { align: 'right' });
        doc.font('Helvetica');

        doc.moveDown();
        doc.fontSize(thermal ? 8 : 10);
        doc.text('='.repeat(thermal ? 32 : 50), { align: 'center' });
        doc.moveDown();

        // Footer
        if (this.settings.receipt_footer) {
          doc.text(this.settings.receipt_footer, { align: 'center' });
        }

        doc.text('Thank you!', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({ success: true, path: filePath });
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;

