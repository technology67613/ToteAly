const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

export async function getShiprocketToken() {
  try {
    const res = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    const data = await res.json();
    return data.token;
  } catch (error) {
    console.error('Shiprocket Auth Error:', error);
    return null;
  }
}

export async function createShiprocketOrder(order: any) {
  try {
    const token = await getShiprocketToken();
    if (!token) throw new Error('Could not authenticate with Shiprocket');

    const shiprocketOrderData = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().slice(0, 16).replace('T', ' '),
      pickup_location: "Primary", // This must match the pickup location name in Shiprocket dashboard
      billing_customer_name: order.shippingDetails.name.split(' ')[0],
      billing_last_name: order.shippingDetails.name.split(' ').slice(1).join(' ') || '.',
      billing_address: order.shippingDetails.address,
      billing_city: order.shippingDetails.city,
      billing_pincode: order.shippingDetails.pincode,
      billing_state: order.shippingDetails.state,
      billing_country: "India",
      billing_email: order.shippingDetails.email,
      billing_phone: order.shippingDetails.phone,
      shipping_is_billing: true,
      order_items: order.products.map((p: any) => ({
        name: p.name,
        sku: p.isCustomized ? 'CUSTOM-TOTE' : 'STANDARD-TOTE',
        units: p.quantity,
        selling_price: p.price,
      })),
      payment_method: "Prepaid",
      sub_total: order.totalAmount - 50,
      shipping_charges: 50,
      length: 10, // Standard box dimensions, adjust as needed
      breadth: 10,
      height: 5,
      weight: 0.5 // Average weight of a tote bag in kg
    };

    const res = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shiprocketOrderData),
    });

    const data = await res.json();
    console.log('Shiprocket Order Response:', data);
    return data;
  } catch (error) {
    console.error('Shiprocket Order Creation Error:', error);
    return null;
  }
}
