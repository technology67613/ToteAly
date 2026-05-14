import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject is too short"),
  message: z.string().min(10, "Message is too short"),
  quantity: z.union([z.string(), z.number()]).optional().nullable(),
  bagType: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const NewsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ShippingDetailsSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export const OrderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  title: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  isCustomized: z.boolean().default(false),
  customizationDetails: z.record(z.any()).optional(),
});

export const OrderCreateSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "Cart cannot be empty"),
  totalAmount: z.number().nonnegative(),
  paymentId: z.string(),
  razorpayOrderId: z.string().optional().nullable(),
  razorpaySignature: z.string().optional().nullable(),
  shippingDetails: ShippingDetailsSchema,
});
