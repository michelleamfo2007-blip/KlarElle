import React from 'react';
import { Link } from 'react-router-dom';

function StaticPage({ title }) {
  const getContent = () => {
    switch (title) {
      case 'About Us':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>Welcome to KLARELLE, your ultimate destination for premium, fashion-forward apparel. Born from a desire to make high-end aesthetics accessible to everyone, we believe that style is a powerful form of self-expression.</p>
            <p style={{ marginBottom: '16px' }}>Our collections are carefully curated to bring you the latest trends mixed with timeless classics. From elegant maxi dresses that turn heads to comfortable everyday essentials, our mission is to empower you to feel confident and beautiful in everything you wear.</p>
            <p style={{ marginBottom: '16px' }}>At KLARELLE, we pride ourselves on quality craftsmanship, sustainable sourcing where possible, and an unwavering commitment to our customers. Thank you for being a part of our journey.</p>
          </>
        );
      case 'Fashion Blogger':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>Are you passionate about fashion, styling, and creating beautiful content? The KLARELLE Fashion Blogger Program is looking for creative minds to collaborate with!</p>
            <p style={{ marginBottom: '16px' }}>As a KLARELLE ambassador, you will receive exclusive early access to our newest collections, special discount codes for your followers, and the opportunity to be featured on our official social media channels.</p>
            <p style={{ marginBottom: '16px' }}>If you have an engaged following and an eye for style, send an email to <strong>collaborations@klarelle.store</strong> with your media kit and social links. Let's create something beautiful together.</p>
          </>
        );
      case 'Social Responsibility':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>At KLARELLE, we recognize our responsibility to the planet and the people who make our clothes. We are on a continuous journey toward becoming a more sustainable and ethical fashion brand.</p>
            <p style={{ marginBottom: '16px' }}><strong>Ethical Manufacturing:</strong> We partner exclusively with factories that guarantee fair wages, safe working conditions, and reasonable hours for their workers.</p>
            <p style={{ marginBottom: '16px' }}><strong>Sustainable Materials:</strong> We are steadily increasing our use of recycled fabrics, organic cotton, and eco-friendly packaging materials to reduce our carbon footprint.</p>
            <p style={{ marginBottom: '16px' }}>Fashion shouldn't cost the earth. We are committed to transparency and will continue to update our community on our sustainability milestones.</p>
          </>
        );
      case 'Careers':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>Join the KLARELLE team! We are always on the lookout for innovative, passionate, and driven individuals who want to make an impact in the fashion industry.</p>
            <p style={{ marginBottom: '16px' }}>Current Openings:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Senior Fashion Designer (New York, NY)</li>
              <li style={{ marginBottom: '8px' }}>E-Commerce Merchandiser (Remote)</li>
              <li style={{ marginBottom: '8px' }}>Social Media Coordinator (Los Angeles, CA)</li>
              <li style={{ marginBottom: '8px' }}>Customer Experience Specialist (Remote)</li>
            </ul>
            <p style={{ marginBottom: '16px' }}>To apply, please send your resume and a brief cover letter to <strong>careers@klarelle.store</strong> with the position title in the subject line.</p>
          </>
        );
      case 'Shipping Info':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>We are thrilled to offer worldwide shipping! Here is everything you need to know about getting your KLARELLE pieces.</p>
            <p style={{ marginBottom: '16px' }}><strong>Processing Time:</strong> All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
            <p style={{ marginBottom: '16px' }}><strong>Standard Shipping:</strong> 5-8 business days. Free on orders over ₵500.</p>
            <p style={{ marginBottom: '16px' }}><strong>Express Shipping:</strong> 2-3 business days. Flat rate of ₵50.</p>
            <p style={{ marginBottom: '16px' }}>Once your order ships, you will receive a confirmation email containing your tracking number. Please allow 24 hours for the tracking portal to update.</p>
          </>
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
            <p style={{ marginBottom: '8px' }}>To initiate a return, contact us at <strong>supportklarelle@gmail.com</strong> within the applicable return period. Please include:</p>
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
      case 'Bonus Point':
        return (
          <>
            <p style={{ marginBottom: '16px' }}>Welcome to KLARELLE Rewards! Earn points every time you shop and redeem them for exclusive discounts.</p>
            <p style={{ marginBottom: '16px' }}><strong>How to Earn:</strong></p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '8px' }}>Create an account: 100 Points</li>
              <li style={{ marginBottom: '8px' }}>Make a purchase: 1 Point for every ₵1 spent</li>
              <li style={{ marginBottom: '8px' }}>Leave a photo review: 50 Points</li>
              <li style={{ marginBottom: '8px' }}>Celebrate your birthday: 200 Points</li>
            </ul>
            <p style={{ marginBottom: '16px' }}><strong>How to Redeem:</strong> 100 Points = ₵10 off. You can apply your points directly at checkout to save on your next favorite outfit!</p>
          </>
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
