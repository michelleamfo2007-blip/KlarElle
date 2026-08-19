import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

function StaticPage({ title }) {
  const { formatPrice } = useCurrency();
  const getContent = () => {
    switch (title) {
      case 'About Us':
        return (
          <div style={{ lineHeight: '1.6' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', textTransform: 'uppercase' }}>About Klarelle</h2>
            <p style={{ marginBottom: '24px', fontStyle: 'italic', color: '#555' }}>Designed by women, for women.</p>
            
            <p style={{ marginBottom: '16px' }}>Klarelle was created with one simple belief: women deserve clothing designed with them, for them, and with the beauty of the feminine silhouette at the center.</p>
            <p style={{ marginBottom: '16px' }}>We create thoughtfully designed pieces that celebrate femininity, confidence, and individuality. Every silhouette is considered with the modern woman in mind—from the way a garment fits and moves to the way it makes her feel when she puts it on.</p>
            <p style={{ marginBottom: '24px' }}>At Klarelle, we believe clothing should feel as beautiful as it looks. Our designs blend timeless elegance with modern femininity, creating pieces that allow women to feel confident, sophisticated, and effortlessly beautiful.</p>
            
            <h3 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '18px', textTransform: 'uppercase' }}>Our Approach</h3>
            <p style={{ marginBottom: '24px', fontStyle: 'italic', color: '#555' }}>Designed by women. For women.</p>
            
            <p style={{ marginBottom: '16px' }}>We pay attention to the details that matter: flattering silhouettes, intentional design, quality, comfort, and versatility. We want every Klarelle piece to make you feel like the most elevated version of yourself.</p>
            <p style={{ marginBottom: '16px' }}>Because luxury isn’t about being loud.</p>
            <p style={{ marginBottom: '24px' }}>It’s about how you feel when you wear it.</p>
            
            <h3 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '18px', textTransform: 'uppercase' }}>Our Vision</h3>
            <p style={{ marginBottom: '16px' }}>Klarelle is more than a clothing brand. It is a celebration of the woman who knows her worth, embraces her femininity, and moves through life with confidence.</p>
            <p style={{ marginBottom: '16px' }}>We are building a brand where every woman can find pieces that make her feel seen, confident, and unforgettable.</p>
            <p style={{ marginBottom: '16px' }}>Welcome to Klarelle.</p>
            <p style={{ marginBottom: '16px', fontStyle: 'italic', color: '#555', fontWeight: 'bold' }}>Designed by women. For women.</p>
          </div>
        );
      case 'Influencer Collaboration':
        return (
          <div style={{ lineHeight: '1.6' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', textTransform: 'uppercase' }}>Creator & Influencer Collaborations</h2>
            <p style={{ marginBottom: '24px' }}>Klarelle collaborates with creators who share our vision of modern femininity, thoughtful design, and elevated style.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Gifted Collaborations</h3>
            <p style={{ marginBottom: '24px' }}>For select creators, we offer gifted pieces in exchange for authentic fashion content.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Paid Collaborations</h3>
            <p style={{ marginBottom: '24px' }}>As our brand grows, we will offer paid opportunities for selected creators and campaigns.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Creator Features</h3>
            <p style={{ marginBottom: '24px' }}>Selected creators may be featured on Klarelle’s social platforms and website.</p>

            <a href="mailto:support@klarelle.store?subject=Fashion Blogger Collaboration Application" style={{
              display: 'inline-block',
              padding: '12px 24px', 
              backgroundColor: '#000', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textDecoration: 'none'
            }}>
              APPLY TO COLLABORATE &rarr;
            </a>
          </div>
        );
      case 'Social Responsibility':
        return (
          <div style={{ lineHeight: '1.6' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', textTransform: 'uppercase' }}>Social Responsibility</h2>
            <p style={{ marginBottom: '24px', fontStyle: 'italic', color: '#555' }}>Designed by women. For women.</p>
            
            <p style={{ marginBottom: '24px' }}>At Klarelle, we believe our responsibility extends beyond the clothes we create.</p>
            
            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Our Planet</h3>
            <p style={{ marginBottom: '24px' }}>We are committed to thoughtful design, reducing unnecessary waste, and making more responsible choices in our materials, packaging, and production as we grow.</p>
            
            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Our People</h3>
            <p style={{ marginBottom: '24px' }}>We aim to build strong, respectful relationships with the people and partners behind our collections and continuously improve the transparency of our production.</p>
            
            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Our Community</h3>
            <p style={{ marginBottom: '24px' }}>We believe in using our growth to create opportunities for others. As Klarelle grows, we are committed to supporting organizations and initiatives that empower women and communities in need.</p>
            
            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Our Promise</h3>
            <p style={{ marginBottom: '24px' }}>We don’t believe in claiming perfection. We believe in progress, accountability, and doing better with every collection.</p>
            
            <p style={{ marginBottom: '16px', fontStyle: 'italic', color: '#555', fontWeight: 'bold' }}>Thoughtfully designed. Responsibly growing. Purposefully given.</p>
          </div>
        );
      case 'Shipping Info':
        return (
          <div style={{ lineHeight: '1.6' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', textTransform: 'uppercase' }}>Shipping Policy</h2>
            <p style={{ marginBottom: '24px' }}>At Klarelle, we carefully prepare every order to ensure your pieces arrive safely and beautifully packaged. Please review our shipping policy before placing your order.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Processing Time</h3>
            <p style={{ marginBottom: '16px' }}>All orders are processed within 3–5 business days after your order is placed.</p>
            <p style={{ marginBottom: '16px' }}>Orders placed on weekends or holidays will begin processing on the next business day.</p>
            <p style={{ marginBottom: '24px' }}>Please note that processing time is separate from shipping/transit time.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>U.S. Shipping Rates</h3>
            <p style={{ marginBottom: '16px' }}><strong>Standard Shipping — $8.95</strong><br/>Estimated delivery: 3–7 business days after your order has been processed.</p>
            <p style={{ marginBottom: '16px' }}><strong>Express Shipping — $18.95</strong><br/>Estimated delivery: 1–3 business days after your order has been processed.</p>
            <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>FREE Standard Shipping on U.S. orders of $100 or more.</p>
            <p style={{ marginBottom: '24px' }}>Shipping times are estimates and are not guaranteed. Carrier delays, weather, holidays, and other circumstances outside of Klarelle’s control may affect delivery times.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>International Shipping</h3>
            <p style={{ marginBottom: '16px' }}>We ship internationally!</p>
            <p style={{ marginBottom: '16px' }}>International shipping rates are calculated at checkout based on your destination, package weight, and selected shipping method.</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li><strong>International Standard Shipping:</strong> Calculated at checkout.</li>
              <li><strong>International Express Shipping:</strong> Calculated at checkout.</li>
            </ul>
            <p style={{ marginBottom: '16px' }}>International delivery times vary by destination and carrier.</p>
            <p style={{ marginBottom: '16px' }}>Customers are responsible for any applicable customs fees, duties, taxes, tariffs, brokerage fees, or other import charges associated with international orders.</p>
            <p style={{ marginBottom: '24px' }}>Klarelle is not responsible for customs delays or fees imposed by the destination country.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Tracking Information</h3>
            <p style={{ marginBottom: '16px' }}>Once your order has shipped, you will receive a shipping confirmation email containing your tracking information.</p>
            <p style={{ marginBottom: '24px' }}>Please allow 24–48 hours for tracking information to update after your package has been shipped.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Incorrect Shipping Address</h3>
            <p style={{ marginBottom: '16px' }}>Please carefully review your shipping information before completing your purchase.</p>
            <p style={{ marginBottom: '16px' }}>If an incorrect or incomplete address is provided and the package is returned to Klarelle, the customer may be responsible for the additional shipping cost required to reship the order.</p>
            <p style={{ marginBottom: '24px' }}>If your order has not yet shipped, contact us as soon as possible at <strong>support@klarelle.store</strong>. We will do our best to assist you, but address changes cannot be guaranteed after an order has been placed.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Lost, Stolen, or Delayed Packages</h3>
            <p style={{ marginBottom: '16px' }}>Once an order has been shipped and handed over to the carrier, Klarelle is not responsible for carrier delays, lost packages, or packages marked as delivered but not received.</p>
            <p style={{ marginBottom: '16px' }}>If your tracking information shows that your package was delivered but you cannot locate it, please check with household members, neighbors, and around your delivery location. We also recommend contacting the carrier directly to report the issue.</p>
            <p style={{ marginBottom: '24px' }}>For packages confirmed as lost in transit, please contact <strong>support@klarelle.store</strong> so we can assist you with the next steps.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Order Changes & Cancellations</h3>
            <p style={{ marginBottom: '16px' }}>Because orders may enter processing shortly after purchase, we cannot guarantee that changes or cancellations can be made once an order has been placed.</p>
            <p style={{ marginBottom: '24px' }}>If you need to make a change or request a cancellation, please contact us as soon as possible at <strong>support@klarelle.store</strong>.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Questions About Your Order?</h3>
            <p style={{ marginBottom: '16px' }}>For questions regarding your order or shipping, please contact:<br/><strong>support@klarelle.store</strong></p>
            <p style={{ marginBottom: '16px' }}>We appreciate your support and patience as we work to make every Klarelle order a special experience.</p>
            <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>Thank you for shopping Klarelle.</p>
          </div>
        );
      case 'Returns':
        return (
          <div style={{ lineHeight: '1.6' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Klarelle Return & Exchange Policy</h2>
            <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>Effective Date: September 01 2026</p>
            <p style={{ marginBottom: '16px' }}>At Klarelle, we want you to love every piece you purchase. Because our items are produced in limited quantities, we currently offer exchanges or store credit only. We do not offer refunds to the original form of payment.</p>
            
            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>1. Eligibility for Exchanges or Store Credit</h3>
            <p style={{ marginBottom: '8px' }}>To be eligible, items must:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Be returned within 14 days of delivery.</li>
              <li>Be unworn, unwashed, and unused.</li>
              <li>Have all original tags attached.</li>
              <li>Be free from makeup, deodorant, perfume, stains, odors, pet hair, or any other signs of wear.</li>
              <li>Be returned in the original packaging when applicable.</li>
              <li>Not be altered, damaged, or modified in any way.</li>
            </ul>
            <p style={{ marginBottom: '16px' }}>Items that do not meet these requirements may be refused and returned to the customer.</p>
            
            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>2. Exchanges</h3>
            <p style={{ marginBottom: '16px' }}>Customers may request an exchange for a different size or an available item of equal value.</p>
            <p style={{ marginBottom: '16px' }}>Exchanges are subject to inventory availability. If the requested size or item is unavailable, the customer may choose store credit instead.</p>
            <p style={{ marginBottom: '16px' }}>If the replacement item costs more than the original item, the customer is responsible for paying the price difference.</p>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>3. Store Credit</h3>
            <p style={{ marginBottom: '16px' }}>If a customer chooses store credit, the approved return value will be issued as store credit after the returned item has been received and inspected.</p>
            <p style={{ marginBottom: '8px' }}>Store credit:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Is non-refundable and cannot be redeemed for cash.</li>
              <li>May be used toward future Klarelle purchases.</li>
              <li>May be subject to any applicable promotional or product-specific restrictions.</li>
              <li>Does not include original shipping charges.</li>
            </ul>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>4. Final Sale Items</h3>
            <p style={{ marginBottom: '8px' }}>The following items are final sale and are not eligible for exchange or store credit:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Sale or clearance items</li>
              <li>Items purchased using a final-sale promotion</li>
              <li>Customized or personalized items</li>
              <li>Items specifically identified as final sale on the product page</li>
            </ul>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>5. Damaged or Incorrect Items</h3>
            <p style={{ marginBottom: '16px' }}>If you receive an incorrect, defective, or damaged item, please contact us within 7 days of delivery with your order number and clear photos of the issue.</p>
            <p style={{ marginBottom: '16px' }}>If the issue is verified as a fulfillment or manufacturing error, Klarelle will provide an appropriate replacement or store credit at no additional cost to the customer.</p>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>6. Return Shipping</h3>
            <p style={{ marginBottom: '16px' }}>Customers are responsible for return shipping costs unless the item received was incorrect, defective, or damaged due to an error on our part.</p>
            <p style={{ marginBottom: '16px' }}>We recommend using a trackable shipping service. Klarelle is not responsible for packages lost or damaged while being returned.</p>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>7. How to Request an Exchange or Store Credit</h3>
            <p style={{ marginBottom: '8px' }}>To initiate a return, contact us at <strong>support@klarelle.store</strong> within the applicable return period. Please include:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Order number</li>
              <li>Name used for the order</li>
              <li>Item(s) you wish to return</li>
              <li>Reason for the return</li>
              <li>Requested size/item for an exchange, if applicable</li>
            </ul>
            <p style={{ marginBottom: '16px' }}>Do not ship an item back before receiving return instructions from Klarelle.</p>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>8. Processing Time</h3>
            <p style={{ marginBottom: '16px' }}>Once your return is received, please allow 3–7 business days for inspection and processing. Store credit will be issued after the return has been approved.</p>
            <p style={{ marginBottom: '16px' }}>By placing an order with Klarelle, the customer acknowledges and agrees to this Return & Exchange Policy.</p>
            <p style={{ marginBottom: '16px' }}>Klarelle reserves the right to refuse returns that do not meet the requirements outlined above.</p>
          </div>
        );
      case 'How to Order':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>Ordering from KLARELLE is simple and secure!</p>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Browse our collections and select the item you love.</li>
              <li style={{ marginBottom: '8px' }}>Choose your color and size, then click "ADD TO BAG".</li>
              <li style={{ marginBottom: '8px' }}>Once you're ready, click the Shopping Bag icon at the top right and select "CHECKOUT".</li>
              <li style={{ marginBottom: '8px' }}>Enter your shipping details, apply any coupon codes, and select your payment method.</li>
              <li style={{ marginBottom: '8px' }}>Review your order and click "PLACE ORDER". You're done!</li>
            </ol>
            <p style={{ marginBottom: '16px' }}>You will receive an order confirmation email immediately after placing your order.</p>
          </>
        );
      case 'Contact Us':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>We're here to help! Whether you have a question about sizing, need help with an order, or just want to say hello, we'd love to hear from you.</p>
            <p style={{ marginBottom: '16px' }}><strong>Email:</strong> support@klarelle.store<br/>(We aim to respond to all emails within 24 hours)</p>
            <p style={{ marginBottom: '16px' }}><strong>Phone:</strong> +233 55 123 4567<br/>(Monday to Friday, 9:00 AM - 6:00 PM GMT)</p>
            <p style={{ marginBottom: '16px' }}><strong>Live Chat:</strong> Click the chat bubble in the bottom right corner of your screen during business hours for immediate assistance.</p>
          </>
        );
      case 'Payment Method':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>We offer a variety of secure payment options to make your shopping experience as smooth as possible.</p>
            <p style={{ marginBottom: '16px' }}><strong>Accepted Credit Cards:</strong> Visa, MasterCard, American Express, and Discover.</p>
            <p style={{ marginBottom: '16px' }}><strong>Digital Wallets:</strong> Apple Pay, Google Pay, and PayPal.</p>
            <p style={{ marginBottom: '16px' }}><strong>Mobile Money:</strong> We fully support MTN Mobile Money, Vodafone Cash, and AirtelTigo Money via our secure checkout gateway.</p>
            <p style={{ marginBottom: '16px' }}>All transactions are securely encrypted, ensuring your financial information is always protected.</p>
          </>
        );
      case 'Rewards':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>Welcome to KLARELLE Rewards! Earn points every time you shop and redeem them for exclusive discounts.</p>
            <p style={{ marginBottom: '16px' }}><strong>How to Earn:</strong></p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Create an account: 100 Points</li>
              <li style={{ marginBottom: '8px' }}>Make a purchase: 10 Points for every {formatPrice(100)} spent</li>
              <li style={{ marginBottom: '8px' }}>Leave a photo review: 50 Points</li>
            </ul>
            <p style={{ marginBottom: '16px' }}><strong>How to Redeem:</strong> 100 Points = {formatPrice(10)} off. You can apply your points directly at checkout to save on your next favorite outfit!</p>
          </>
        );
      case 'FAQ':
        return (
          <div style={{ lineHeight: '1.6' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', textTransform: 'uppercase' }}>Frequently Asked Questions</h2>
            
            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Orders</h3>
            <p style={{ fontWeight: 'bold' }}>How will I know my order was received?</p>
            <p style={{ marginBottom: '16px' }}>After completing your purchase, you will receive an order-confirmation email containing your order number and purchase details. Please check your spam or junk folder if you do not see it.</p>
            
            <p style={{ fontWeight: 'bold' }}>Can I change or cancel my order?</p>
            <p style={{ marginBottom: '16px' }}>Please contact us as soon as possible after placing your order. Once an order has entered processing or has been shipped, we may be unable to change or cancel it.</p>
            
            <p style={{ fontWeight: 'bold' }}>Can I combine multiple orders?</p>
            <p style={{ marginBottom: '16px' }}>We cannot guarantee that separately placed orders will be combined. Each order may be processed and shipped individually.</p>
            
            <p style={{ fontWeight: 'bold' }}>What happens if an item in my order becomes unavailable?</p>
            <p style={{ marginBottom: '24px' }}>If an item becomes unavailable after your order is placed, we will notify you and issue a refund for the unavailable item to your original payment method.</p>
            
            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Sizing and Fit</h3>
            <p style={{ fontWeight: 'bold' }}>How do I choose the correct size?</p>
            <p style={{ marginBottom: '16px' }}>Please review the size guide provided on each product page before ordering. Product measurements and fit may vary between styles, so we also recommend reading the fit notes and fabric details.</p>
            
            <p style={{ fontWeight: 'bold' }}>What should I do if I am between sizes?</p>
            <p style={{ marginBottom: '16px' }}>Your best size will depend on the garment’s material and fit. For fitted styles with little or no stretch, we generally recommend sizing up. For stretchy styles, your usual size may provide the best fit.</p>
            
            <p style={{ fontWeight: 'bold' }}>Will the color look exactly like the website pictures?</p>
            <p style={{ marginBottom: '24px' }}>We make every effort to display colors accurately. However, colors may appear slightly different depending on lighting, photography, and your device’s screen settings.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Payments</h3>
            <p style={{ fontWeight: 'bold' }}>Which payment methods do you accept?</p>
            <p style={{ marginBottom: '16px' }}>Klarelle accepts major debit and credit cards and any additional payment options displayed during checkout. Available installment-payment methods may depend on your country and eligibility.</p>
            
            <p style={{ fontWeight: 'bold' }}>Is my payment information secure?</p>
            <p style={{ marginBottom: '16px' }}>Yes. Payments are processed through secure third-party payment providers. Klarelle does not directly store your complete card information.</p>
            
            <p style={{ fontWeight: 'bold' }}>Can I use more than one payment method?</p>
            <p style={{ marginBottom: '24px' }}>Only one payment method can generally be used per order unless otherwise stated during checkout.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Shipping and Delivery</h3>
            <p style={{ fontWeight: 'bold' }}>Where does Klarelle ship?</p>
            <p style={{ marginBottom: '16px' }}>We offer shipping within the United States and to selected international destinations. Available shipping services and costs will be displayed at checkout.</p>
            
            <p style={{ fontWeight: 'bold' }}>How much does shipping cost?</p>
            <p style={{ marginBottom: '16px' }}>Shipping costs depend on your location, package weight, and selected delivery service. Your exact shipping fee will be calculated at checkout before payment.</p>
            
            <p style={{ fontWeight: 'bold' }}>How long will my order take to arrive?</p>
            <p style={{ marginBottom: '16px' }}>Orders require processing before shipment. Estimated delivery times will be shown at checkout, but they do not include unexpected carrier, customs, weather, or holiday delays.</p>
            
            <p style={{ fontWeight: 'bold' }}>How can I track my order?</p>
            <p style={{ marginBottom: '16px' }}>Once your order ships, you will receive a confirmation email containing your tracking number. Please allow time for the carrier’s tracking information to update.</p>

            <p style={{ fontWeight: 'bold' }}>What should I do if my package is delayed?</p>
            <p style={{ marginBottom: '16px' }}>Carrier delays may occur after an order leaves our facility. Please check your tracking information first. If there has been no tracking update for several business days, contact our customer-care team for assistance.</p>
            
            <p style={{ fontWeight: 'bold' }}>What happens if my package is marked delivered but I cannot find it?</p>
            <p style={{ marginBottom: '16px' }}>Please check around your property, mailbox, building reception area, and with household members or neighbors. You should also contact the carrier directly. If you still cannot locate the package, contact us promptly so we can review the situation.</p>
            
            <p style={{ fontWeight: 'bold' }}>Am I responsible for entering the correct address?</p>
            <p style={{ marginBottom: '24px' }}>Yes. Customers are responsible for providing a complete and accurate shipping address. Please contact us immediately if you notice an error. We cannot guarantee changes after processing begins, and additional shipping charges may apply if a package is returned because of an incorrect address.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>International Orders</h3>
            <p style={{ fontWeight: 'bold' }}>Will I have to pay customs duties or taxes?</p>
            <p style={{ marginBottom: '16px' }}>International orders may be subject to customs duties, import taxes, or handling fees imposed by the destination country. Unless otherwise stated at checkout, these charges are the customer’s responsibility and are not included in the product or shipping price.</p>
            
            <p style={{ fontWeight: 'bold' }}>Can international orders experience customs delays?</p>
            <p style={{ marginBottom: '24px' }}>Yes. Customs processing times are controlled by the destination country and may delay delivery. Klarelle cannot guarantee a specific customs-clearance date.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Returns and Exchanges</h3>
            <p style={{ fontWeight: 'bold' }}>What is Klarelle’s return policy?</p>
            <p style={{ marginBottom: '16px' }}>Eligible items may be returned within the period stated in our Return Policy. Approved returns are issued as an exchange or store credit unless the item qualifies for a refund under applicable law or our policy. Please review the complete Return Policy before submitting a request.</p>
            
            <p style={{ fontWeight: 'bold' }}>How do I request a return?</p>
            <p style={{ marginBottom: '16px' }}>Contact our customer-care team with your order number, the item you wish to return, and the reason for the request. Do not mail an item back until you receive return instructions and authorization.</p>

            <p style={{ fontWeight: 'bold' }}>Are original shipping fees refundable?</p>
            <p style={{ marginBottom: '16px' }}>Original shipping fees are generally non-refundable unless Klarelle made an error with your order or applicable law requires otherwise.</p>

            <p style={{ fontWeight: 'bold' }}>Are return-shipping costs refundable?</p>
            <p style={{ marginBottom: '16px' }}>Customers are generally responsible for return-shipping costs unless the item received was incorrect, damaged, or confirmed to be defective.</p>

            <p style={{ fontWeight: 'bold' }}>Which items cannot be returned?</p>
            <p style={{ marginBottom: '16px' }}>Items must be unworn, unwashed, unaltered, free from stains and odors, and returned with all original tags attached. Final-sale items, intimate items, bodysuits, gift cards, and items that do not meet our return conditions may be ineligible.</p>

            <p style={{ fontWeight: 'bold' }}>Can I return a final-sale item?</p>
            <p style={{ marginBottom: '16px' }}>No. Items marked “Final Sale” cannot be returned, exchanged, or credited unless they arrive damaged, defective, or incorrect.</p>

            <p style={{ fontWeight: 'bold' }}>What if I receive a damaged, defective, or incorrect item?</p>
            <p style={{ marginBottom: '16px' }}>Contact us promptly after delivery and include your order number and clear photographs or video of the item, packaging, tags, and shipping label. We will review the claim and provide the appropriate resolution.</p>

            <p style={{ fontWeight: 'bold' }}>How long does it take to process a return?</p>
            <p style={{ marginBottom: '24px' }}>Returns are inspected after delivery to our return location. Once approved, your exchange or store credit will be processed, and you will receive confirmation by email.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Products and Care</h3>
            <p style={{ fontWeight: 'bold' }}>How should I care for my Klarelle item?</p>
            <p style={{ marginBottom: '16px' }}>Always follow the care label attached to the garment. Some delicate, embellished, structured, or specialty-fabric pieces may require hand washing or professional dry cleaning.</p>
            
            <p style={{ fontWeight: 'bold' }}>Will sold-out items be restocked?</p>
            <p style={{ marginBottom: '24px' }}>Some popular styles may be restocked, but restocks are not guaranteed. Join our mailing list and follow Klarelle on social media for availability announcements.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Promotions and Gift Cards</h3>
            <p style={{ fontWeight: 'bold' }}>Can discount codes be combined?</p>
            <p style={{ marginBottom: '16px' }}>Unless otherwise stated, only one promotional code may be used per order. Discount codes cannot usually be applied after an order has been submitted.</p>
            
            <p style={{ fontWeight: 'bold' }}>Do promotions apply to every product?</p>
            <p style={{ marginBottom: '24px' }}>Certain products, collections, gift cards, or final-sale items may be excluded. Any exclusions will be stated in the promotion’s terms.</p>

            <h3 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '18px', textTransform: 'uppercase' }}>Contact Us</h3>
            <p style={{ fontWeight: 'bold' }}>How can I contact Klarelle?</p>
            <p style={{ marginBottom: '16px' }}>Please contact our customer-care team through the Contact Us page or the customer-care email listed on our website. Include your full name and order number for order-related questions. Please allow the stated response time for a reply.</p>
          </div>
        );
      default:
        return <p style={{ marginBottom: '16px' }}>Content for {title} will be available soon.</p>;
    }
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', fontFamily: 'Playfair Display, serif' }}>{title}</h1>
      <div style={{ lineHeight: '1.8', color: '#444', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>
        {getContent()}
        
        <div style={{ marginTop: '40px' }}>
          <Link 
            to="/" 
            style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              backgroundColor: '#000', 
              color: '#fff', 
              textDecoration: 'none', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '13px',
              borderRadius: '8px'
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StaticPage;
