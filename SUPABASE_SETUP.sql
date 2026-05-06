-- SQL RPC for Atomic Order Creation
-- Run this in the Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_total_amount DECIMAL,
  p_payment_id TEXT,
  p_status TEXT,
  p_payment_status TEXT,
  p_shipping_details JSONB,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Insert Order
  INSERT INTO orders (
    user_id, 
    total_amount, 
    payment_id, 
    status, 
    payment_status, 
    shipping_details
  ) VALUES (
    p_user_id, 
    p_total_amount, 
    p_payment_id, 
    p_status, 
    p_payment_status, 
    p_shipping_details
  ) RETURNING id INTO v_order_id;

  -- 2. Insert Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      name,
      price,
      quantity,
      is_customized,
      customization_details
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_item->>'name',
      (v_item->>'price')::DECIMAL,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'is_customized')::BOOLEAN,
      (v_item->'customization_details')
    );
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id);
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Order creation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
