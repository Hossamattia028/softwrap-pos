const escpos = require('escpos');

class ThermalPrinter {
  constructor() {
    this.device = null;
    this.printer = null;
  }

  async findPrinter() {
    try {
      // Try to find USB thermal printer
      escpos.USB = require('escpos-usb');
      const devices = escpos.USB.findPrinter();
      
      if (devices.length > 0) {
        this.device = new escpos.USB(devices[0].deviceDescriptor.idVendor, devices[0].deviceDescriptor.idProduct);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Printer not found:', error);
      return false;
    }
  }

  async printReceipt(order, settings) {
    return new Promise(async (resolve, reject) => {
      try {
        const found = await this.findPrinter();
        
        if (!found) {
          return reject(new Error('No thermal printer found'));
        }

        this.printer = new escpos.Printer(this.device);
        
        this.device.open((err) => {
          if (err) {
            return reject(err);
          }

          const currency = settings.currency_symbol || 'EGP';

          this.printer
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text(settings.store_name || 'Softwrap POS')
            .style('normal')
            .size(0, 0)
            .text(settings.store_address || '')
            .text(`Tel: ${settings.store_phone || ''}`)
            .text(`VAT: ${settings.tax_number || ''}`)
            .text('================================')
            .align('lt')
            .text(`Receipt: ${order.order_number}`)
            .text(`Date: ${new Date(order.created_at).toLocaleString()}`)
            .text(`Customer: ${order.customer_name || 'Walk-in'}`)
            .text('--------------------------------')
            .style('b');

          // Items
          order.items.forEach(item => {
            this.printer
              .text(item.product_name)
              .style('normal')
              .text(`  ${item.quantity} x ${item.unit_price.toFixed(2)} = ${item.total.toFixed(2)}`);
          });

          this.printer
            .text('--------------------------------')
            .align('rt')
            .text(`Subtotal: ${order.subtotal.toFixed(2)} ${currency}`);

          if (order.discount_total > 0) {
            this.printer.text(`Discount: -${order.discount_total.toFixed(2)} ${currency}`);
          }

          if (order.shipping_cost > 0) {
            this.printer.text(`Shipping: ${order.shipping_cost.toFixed(2)} ${currency}`);
          }

          this.printer
            .text(`Tax: ${order.tax_total.toFixed(2)} ${currency}`)
            .style('bu')
            .size(1, 1)
            .text(`TOTAL: ${order.total.toFixed(2)} ${currency}`)
            .size(0, 0)
            .style('normal')
            .align('ct')
            .text('================================')
            .text(settings.receipt_footer || '')
            .text('Thank you!')
            .feed(3)
            .cut()
            .close(() => {
              resolve({ success: true });
            });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = ThermalPrinter;

