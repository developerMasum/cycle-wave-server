import QueryBuilder from "../../utils/QueryBuilder";
import initiatePayment from "../payment/payment.utils";
import Product from "../product/product.model";
import orderModel from "./order.model";
import Order from "./order.model";
import { orderSearchableFields } from "./order.utils";

// -- you can tighten up the type here if you like
interface OrderInput {
  name: string;
  email: string;
  contact: string;
  address: string;
  userId: string;
  deliveryCharge: number;
  paymentMethod: "Cash On Delivery" | "ONLINE PAYMENT";
  products: Array<{
    product: string; // ObjectId as string
    quantity: number;
    name?: string; // optional, if you want to save the product name snapshot
  }>;
}

const createOrder = async (orderData: OrderInput) => {
  const {
    name,
    email,
    contact,
    address,
    paymentMethod,
    products,
    deliveryCharge,
    userId,
  } = orderData;

  // 1️⃣ Re-calc totalPrice on the server
  let totalPrice = 0;
  const productDetails = await Promise.all(
    products.map(async (item) => {
      const p = await Product.findById(item.product);
      if (!p) throw new Error(`Product ${item.product} not found`);
      totalPrice += p.price * item.quantity;
      return {
        product: p._id,
        quantity: item.quantity,
        // store name snapshot if you like:
        name: p.name,
      };
    })
  );

  // 2️⃣ Build the order
  const transactionId = `TXN-${Date.now()}`;
  const order = new Order({
    user: {
      name,
      email,
      phone: contact,
      address,
    },
    products: productDetails,
    totalPrice,
    deliveryCharge,
    paymentMethod,
    status: "Pending",
    paymentStatus: "Pending",
    transactionId,
    userId,
  });

  // 3️⃣ Save it
  await order.save();

  // 4️⃣ If COD, we’re done
  if (paymentMethod === "Cash On Delivery") {
    // you might want to send a confirmation email here
    return order;
  }

  // 5️⃣ Otherwise, spin up a payment session
  const paymentSession = await initiatePayment({
    _id: order?._id,
    totalPrice,
    transactionId,
    name,
    email,
    phone: contact,
    address,
  });

  return paymentSession;
};

const getOrderById = async (id: string) => {
  const order = await Order.findById(id).populate("products.product");
  return order;
};

const getMyOrders = async (user: any) => {
  const email = user.id;
  console.log("email", email);
  const orders = await Order.find({ "user.email": email }).sort({
    createdAt: -1,
  });
  return orders;
};

const getAllOrders = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(Order.find(), query)
    .search(orderSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await orderQuery.modelQuery;

  const meta = await orderQuery.countTotal();

  return {
    meta,
    data,
  };
};
const updateOrderStatus = async (id: string, data: any) => {
  const result = await Order.findByIdAndUpdate(
    id,
    { status: data.status, paymentStatus: data.paymentStatus },
    { new: true }
  );
  return result;
};
const deleteOrder = async (id: string) => {
  const result = await Order.findByIdAndDelete(id);
  return result;
};
export const orderService = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
