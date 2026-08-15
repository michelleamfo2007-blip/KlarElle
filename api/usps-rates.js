export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destinationZip, weightPounds = 0, weightOunces = 10 } = req.body;
  const userId = process.env.USPS_USER_ID;

  if (!userId) {
    return res.status(500).json({ error: 'USPS_USER_ID is not configured in environment variables' });
  }

  // USPS RateV4 API requires XML payload
  const xmlPayload = `
    <RateV4Request USERID="${userId}">
      <Revision>2</Revision>
      <Package ID="1">
        <Service>PRIORITY</Service>
        <ZipOrigination>10001</ZipOrigination> <!-- Klarelle HQ Zip -->
        <ZipDestination>${destinationZip}</ZipDestination>
        <Pounds>${weightPounds}</Pounds>
        <Ounces>${weightOunces}</Ounces>
        <Container>VARIABLE</Container>
        <Machinable>True</Machinable>
      </Package>
    </RateV4Request>
  `.trim();

  try {
    const uspsUrl = `https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=${encodeURIComponent(xmlPayload)}`;
    
    const response = await fetch(uspsUrl);
    const xmlText = await response.text();
    
    // In a real production app, use an XML parser like fast-xml-parser
    // For this prototype, we will do a basic regex match for the postage price
    const rateMatch = xmlText.match(/<Rate>(.*?)<\/Rate>/);
    const errorMatch = xmlText.match(/<Description>(.*?)<\/Description>/);

    if (errorMatch) {
      return res.status(400).json({ error: errorMatch[1] });
    }

    if (rateMatch && rateMatch[1]) {
      const rate = parseFloat(rateMatch[1]);
      return res.status(200).json({ 
        success: true, 
        provider: 'USPS Priority Mail',
        rate: rate 
      });
    } else {
      return res.status(400).json({ error: 'Failed to retrieve rates from USPS' });
    }

  } catch (error) {
    console.error('USPS API Error:', error);
    return res.status(500).json({ error: 'Internal server error while fetching shipping rates' });
  }
}
