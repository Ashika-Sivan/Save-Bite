import Stripe from "stripe";
import { AppError } from "../errors/AppError";
const stripeSecretKey=process.env.STRIPE_SECRET_KEY
if(!stripeSecretKey){
    throw new AppError("STRIPE_SECRET_KEY is missing")
}

const stripe:Stripe=new Stripe(stripeSecretKey)
export default stripe