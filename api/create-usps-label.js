export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, destinationZip, weightPounds = 0, weightOunces = 10, name, address } = req.body;
  const userId = process.env.USPS_USER_ID;

  if (!userId) {
    return res.status(500).json({ error: 'USPS_USER_ID is not configured in environment variables' });
  }

  // USPS eVs (Electronic Verification System) API requires XML payload to generate labels
  const xmlPayload = `
    <eVSRequest USERID="${userId}">
      <Option></Option>
      <Revision>1</Revision>
      <FromName>Klarelle Shipping Dept</FromName>
      <FromFirm>Klarelle Store</FromFirm>
      <FromAddress1></FromAddress1>
      <FromAddress2>123 Fashion Ave</FromAddress2>
      <FromCity>New York</FromCity>
      <FromState>NY</FromState>
      <FromZip5>10001</FromZip5>
      <FromZip4></FromZip4>
      
      <ToName>${name || 'Customer'}</ToName>
      <ToFirm></ToFirm>
      <ToAddress1></ToAddress1>
      <ToAddress2>${address || '123 Main St'}</ToAddress2>
      <ToCity>Anytown</ToCity>
      <ToState>NY</ToState>
      <ToZip5>${destinationZip || '10001'}</ToZip5>
      <ToZip4></ToZip4>
      
      <WeightInOunces>${(weightPounds * 16) + weightOunces}</WeightInOunces>
      <ServiceType>PRIORITY</ServiceType>
      <Container>VARIABLE</Container>
      <Machinable>True</Machinable>
      <ImageType>PDF</ImageType>
    </eVSRequest>
  `.trim();

  try {
    const uspsUrl = `https://secure.shippingapis.com/ShippingAPI.dll?API=eVS&XML=${encodeURIComponent(xmlPayload)}`;
    
    const response = await fetch(uspsUrl);
    const xmlText = await response.text();
    
    const errorMatch = xmlText.match(/<Description>(.*?)<\/Description>/);
    if (errorMatch) {
      return res.status(400).json({ error: errorMatch[1] });
    }

    const trackingMatch = xmlText.match(/<BarcodeNumber>(.*?)<\/BarcodeNumber>/);
    const labelMatch = xmlText.match(/<LabelImage>(.*?)<\/LabelImage>/);

    if (trackingMatch && trackingMatch[1] && labelMatch && labelMatch[1]) {
      return res.status(200).json({ 
        success: true, 
        trackingNumber: trackingMatch[1],
        labelPdfBase64: labelMatch[1] 
      });
    } else {
      // For development, if USPS credentials aren't verified for eVs, mock the success
      if (userId === 'placeholder_id' || userId === 'your_usps_user_id') {
        return res.status(200).json({
          success: true,
          trackingNumber: '94055036993000' + Math.floor(Math.random() * 1000000),
          labelPdfBase64: 'mock_base64_pdf_data',
          mocked: true
        });
      }
      return res.status(400).json({ error: 'Failed to generate label from USPS' });
    }

  } catch (error) {
    console.error('USPS Label API Error:', error);
    return res.status(500).json({ error: 'Internal server error while generating label' });
  }
}
