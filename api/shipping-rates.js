import { readFileSync } from 'fs';
import { join } from 'path';

const COUNTRY_CODES = {
  "United States": "US",
  "Afghanistan": "AF",
  "Albania": "AL",
  "Algeria": "DZ",
  "Andorra": "AD",
  "Angola": "AO",
  "Antigua and Barbuda": "AG",
  "Argentina": "AR",
  "Armenia": "AM",
  "Australia": "AU",
  "Austria": "AT",
  "Azerbaijan": "AZ",
  "Bahamas": "BS",
  "Bahrain": "BH",
  "Bangladesh": "BD",
  "Barbados": "BB",
  "Belarus": "BY",
  "Belgium": "BE",
  "Belize": "BZ",
  "Benin": "BJ",
  "Bhutan": "BT",
  "Bolivia": "BO",
  "Bosnia and Herzegovina": "BA",
  "Botswana": "BW",
  "Brazil": "BR",
  "Brunei": "BN",
  "Bulgaria": "BG",
  "Burkina Faso": "BF",
  "Burundi": "BI",
  "Cabo Verde": "CV",
  "Cambodia": "KH",
  "Cameroon": "CM",
  "Canada": "CA",
  "Central African Republic": "CF",
  "Chad": "TD",
  "Chile": "CL",
  "China": "CN",
  "Colombia": "CO",
  "Comoros": "KM",
  "Congo (Congo-Brazzaville)": "CG",
  "Costa Rica": "CR",
  "Croatia": "HR",
  "Cuba": "CU",
  "Cyprus": "CY",
  "Czechia (Czech Republic)": "CZ",
  "Democratic Republic of the Congo": "CD",
  "Denmark": "DK",
  "Djibouti": "DJ",
  "Dominica": "DM",
  "Dominican Republic": "DO",
  "Ecuador": "EC",
  "Egypt": "EG",
  "El Salvador": "SV",
  "Equatorial Guinea": "GQ",
  "Eritrea": "ER",
  "Estonia": "EE",
  "Eswatini": "SZ",
  "Ethiopia": "ET",
  "Fiji": "FJ",
  "Finland": "FI",
  "France": "FR",
  "Gabon": "GA",
  "Gambia": "GM",
  "Georgia": "GE",
  "Germany": "DE",
  "Ghana": "GH",
  "Greece": "GR",
  "Grenada": "GD",
  "Guatemala": "GT",
  "Guinea": "GN",
  "Guinea-Bissau": "GW",
  "Guyana": "GY",
  "Haiti": "HT",
  "Honduras": "HN",
  "Hungary": "HU",
  "Iceland": "IS",
  "India": "IN",
  "Indonesia": "ID",
  "Iran": "IR",
  "Iraq": "IQ",
  "Ireland": "IE",
  "Israel": "IL",
  "Italy": "IT",
  "Jamaica": "JM",
  "Japan": "JP",
  "Jordan": "JO",
  "Kazakhstan": "KZ",
  "Kenya": "KE",
  "Kiribati": "KI",
  "Kuwait": "KW",
  "Kyrgyzstan": "KG",
  "Laos": "LA",
  "Latvia": "LV",
  "Lebanon": "LB",
  "Lesotho": "LS",
  "Liberia": "LR",
  "Libya": "LY",
  "Liechtenstein": "LI",
  "Lithuania": "LT",
  "Luxembourg": "LU",
  "Madagascar": "MG",
  "Malawi": "MW",
  "Malaysia": "MY",
  "Maldives": "MV",
  "Mali": "ML",
  "Malta": "MT",
  "Marshall Islands": "MH",
  "Mauritania": "MR",
  "Mauritius": "MU",
  "Mexico": "MX",
  "Micronesia": "FM",
  "Moldova": "MD",
  "Monaco": "MC",
  "Mongolia": "MN",
  "Montenegro": "ME",
  "Morocco": "MA",
  "Mozambique": "MZ",
  "Myanmar (formerly Burma)": "MM",
  "Namibia": "NA",
  "Nauru": "NR",
  "Nepal": "NP",
  "Netherlands": "NL",
  "New Zealand": "NZ",
  "Nicaragua": "NI",
  "Niger": "NE",
  "Nigeria": "NG",
  "North Korea": "KP",
  "North Macedonia": "MK",
  "Norway": "NO",
  "Oman": "OM",
  "Pakistan": "PK",
  "Palau": "PW",
  "Palestine State": "PS",
  "Panama": "PA",
  "Papua New Guinea": "PG",
  "Paraguay": "PY",
  "Peru": "PE",
  "Philippines": "PH",
  "Poland": "PL",
  "Portugal": "PT",
  "Qatar": "QA",
  "Romania": "RO",
  "Russia": "RU",
  "Rwanda": "RW",
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  "Saint Vincent and the Grenadines": "VC",
  "Samoa": "WS",
  "San Marino": "SM",
  "Sao Tome and Principe": "ST",
  "Saudi Arabia": "SA",
  "Senegal": "SN",
  "Serbia": "RS",
  "Seychelles": "SC",
  "Sierra Leone": "SL",
  "Singapore": "SG",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Solomon Islands": "SB",
  "Somalia": "SO",
  "South Africa": "ZA",
  "South Korea": "KR",
  "South Sudan": "SS",
  "Spain": "ES",
  "Sri Lanka": "LK",
  "Sudan": "SD",
  "Suriname": "SR",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Syria": "SY",
  "Tajikistan": "TJ",
  "Tanzania": "TZ",
  "Thailand": "TH",
  "Timor-Leste": "TL",
  "Togo": "TG",
  "Tonga": "TO",
  "Trinidad and Tobago": "TT",
  "Tunisia": "TN",
  "Turkey": "TR",
  "Turkmenistan": "TM",
  "Tuvalu": "TV",
  "Uganda": "UG",
  "Ukraine": "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "Uruguay": "UY",
  "Uzbekistan": "UZ",
  "Vanuatu": "VU",
  "Venezuela": "VE",
  "Vietnam": "VN",
  "Yemen": "YE",
  "Zambia": "ZM",
  "Zimbabwe": "ZW"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destinationZip, country = 'United States', cartItems = [] } = req.body;
  const destCountryCode = COUNTRY_CODES[country] || 'US';

  const AFRICAN_COUNTRIES = [
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
    "Central African Republic", "Chad", "Comoros", "Democratic Republic of the Congo",
    "Congo (Congo-Brazzaville)", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini",
    "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast (Côte d'Ivoire)",
    "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius",
    "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe",
    "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan",
    "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
  ];
  
  const isAfrican = AFRICAN_COUNTRIES.includes(country);

  // Calculate totals for items
  let totalWeight = 0; // kg
  const items = cartItems.map(item => {
    // defaults if product data is missing
    const weight = item.weight ? parseFloat(item.weight) : 0.5;
    totalWeight += weight * item.quantity;
    return {
      description: item.name,
      sku: item.sku || `SKU-${item.id}`,
      actual_weight: weight,
      height: item.height ? parseFloat(item.height) : 5,
      width: item.width ? parseFloat(item.width) : 35,
      length: item.length ? parseFloat(item.length) : 45,
      category: "fashion",
      declared_currency: "USD",
      declared_customs_value: item.price,
      quantity: item.quantity
    };
  });

  if (items.length === 0) {
    items.push({
      description: "Apparel",
      sku: "DEFAULT",
      actual_weight: 0.5,
      height: 5,
      width: 35,
      length: 45,
      category: "fashion",
      declared_currency: "USD",
      declared_customs_value: 50,
      quantity: 1
    });
    totalWeight = 0.5;
  }

  if (isAfrican) {
    let amount = 40.00;
    if (totalWeight > 1.0) {
      amount = 65.00;
    }
    
    return res.status(200).json({
      success: true,
      rates: [{
        provider: 'International Warehouse Fulfillment',
        serviceLevel: 'Door-to-Door Delivery',
        amount: amount,
        currency: 'USD',
        objectId: `african_dropship_${Date.now()}`,
        estimatedDays: '10-14'
      }]
    });
  } else {
    // EASYSHIP LOGIC FOR INTERNATIONAL
    const apiKey = process.env.EASYSHIP_API_KEY;
    if (!apiKey) {
      // Return mock Easyship data if no API key is set yet (for development)
      const mockRates = [
        { provider: 'ePost Global', serviceLevel: 'Economy International', amount: 19.99, objectId: 'easyship_mock_1', estimatedDays: '7-16' },
        { provider: 'DHL Express', serviceLevel: 'Express Worldwide', amount: 45.00, objectId: 'easyship_mock_2', estimatedDays: '3-5' }
      ];
      return res.status(200).json({ success: true, rates: mockRates });
    }

    try {
      const response = await fetch('https://api.easyship.com/2023-01/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          origin_country_alpha2: 'US',
          origin_postal_code: '10001',
          destination_country_alpha2: destCountryCode,
          destination_postal_code: destinationZip,
          taxes_duties_paid_by: 'Receiver',
          is_insured: false,
          items: items
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch Easyship rates');
      }

      let rates = [];
      if (data.rates && data.rates.length > 0) {
        rates = data.rates.map(r => ({
          provider: r.courier_name,
          serviceLevel: r.courier_service_name,
          amount: parseFloat(r.total_charge),
          currency: r.currency,
          objectId: r.easyship_rate_id,
          estimatedDays: `${r.min_delivery_time}-${r.max_delivery_time}`
        }));
      }

      return res.status(200).json({ success: true, rates });
    } catch (error) {
      console.error('Easyship API Error:', error);
      return res.status(500).json({ error: 'Internal server error while fetching international rates' });
    }
  }
}
