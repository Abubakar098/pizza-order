import styles from "../styles/Cart.module.css";
import Image from "next/image";
import {useDispatch, useSelector} from "react-redux"
import axios from "axios";
import { useRouter } from "next/router";
import {reset} from "../redux/cartSlice"

{/* paypal libraries */}
import { useEffect, useState } from "react";
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import OrderDetail from "../components/OrderDetail";

{/*/////////////// */}





const Cart = () => {

  const cart = useSelector((state) =>state.cart );
  const [open,setOpen] = useState(false)
  const [cash,setCash] = useState(false)

  
  {/* Paypall configration  below this line*/}
  // This values are the props in the UI
  const amount = cart.total;
  const currency = "USD";
  const style = {"layout":"vertical"};
  const dispatch = useDispatch();
  const router = useRouter();


const createOrder = async (data)=>{
  try {
    const res = await axios.post("http://localhost:3000/api/orders", data);
    if (res.status === 201) {
      dispatch(reset());
      router.push('/orders/' + res.data._id);
    }
  } catch (err) {
    console.log(err + "   ====   cart js   ===  ");
  }
};

// Custom component to wrap the PayPalButtons and handle currency changes
const ButtonWrapper = ({ currency, showSpinner }) => {
    // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: currency,
            },
        });
    }, [currency, showSpinner]);


    return (<>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[amount, currency, style]}
                fundingSource={undefined}
                createOrder={(data, actions) => {
                    return actions.order
                        .create({
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: currency,
                                        value: amount,
                                    },
                                },
                            ],
                        })
                        .then((orderId) => {
                            // Your code here after create the order
                            return orderId;
                        });
                }}
                onApprove={function (data, actions) {
                  return actions.order.capture().then(function (details) {
                    const shipping = details.purchase_units[0].shipping;
                    createOrder({
                      customer: shipping.name.full_name,
                      address: shipping.address.address_line_1,
                      total: cart.total,
                      method: 1,
                    });
                    });
                }}
            />
        </>
    );
}
{/* Paypall configration  above this line*/}

  

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <table className={styles.table}>
          <tbody>
          <tr className={styles.trTitle}>
            <th>Product</th>
            <th>Name</th>
            <th>Extras</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
          </tbody>
          {cart.products.map((product)=>(
            <tbody>

            <tr className={styles.tr} > {/*key={product._id} */}
            <td>
              <div className={styles.imgContainer}>
                <Image
                  src={product.img}
                  layout="fill"
                  objectFit="cover"
                  alt=""
                  />
              </div>
            </td>
            <td>
              <span className={styles.name}>{product.title}</span>
            </td>
            <td>
              <span className={styles.extras}>
                {product.extras.map((extra)=>(
                  <span>{extra.text}, </span> /*key={extra._id}*/
                  ))}
                
              </span>
            </td>
            <td>
              <span className={styles.price}>${product.price}</span>
            </td>
            <td>
              <span className={styles.quantity}>{product.quantity}</span>
            </td>
            <td>
              <span className={styles.total}>${product.price * product.quantity}</span>
            </td>
          </tr>
            </tbody>
            ))}
          {/* <tr className={styles.tr}>
          <td>
              <div className={styles.imgContainer}>
                <Image
                  src="/images/pizza.png"
                  layout="fill"
                  objectFit="cover"
                  alt=""
                />
              </div>
            </td>
            <td>
              <span className={styles.name}>CORALZO</span>
            </td>
            <td>
              <span className={styles.extras}>
                Double ingredient, spicy sauce
              </span>
            </td>
            <td>
              <span className={styles.price}>$19.90</span>
            </td>
            <td>
              <span className={styles.quantity}>2</span>
            </td>
            <td>
              <span className={styles.total}>$39.80</span>
            </td>
          </tr> */}
        </table>
      </div>
      <div className={styles.right}>
          <div className={styles.wrapper}>
            <h2 className={styles.title}>CART TOTAL</h2>
            <div className={styles.totalText}>
              <b className={styles.totalTextTitle}>Subtotal:</b>${cart.total}
            </div>
            <div className={styles.totalText}>
              <b className={styles.totalTextTitle}>Discount:</b>$0.00
            </div>
            <div className={styles.totalText}>
              <b className={styles.totalTextTitle}>Total:</b>${cart.total}
            </div>
            { open ? (
              <div className={styles.paymentMethods} > 
              <button 
              className={styles.payButton}
               onClick={()=>setCash(true)} 
               >
                CASH ONDELIVERY
                </button>
              <PayPalScriptProvider
                  options={{
                      "client-id": "AVZQ9lb35iFqIkSHsADe9zArcEES9KlAdqvDCZd6JJ1Yy6CySNETDAPGNseSco4-bNno8E4Wv11rvKmC",
                      components: "buttons",
                      currency: "USD",
                      "disable-funding":"credit,card,p24,venmo",
                  }}
              >
                <ButtonWrapper
                      currency={currency}
                      showSpinner={false}
                  />
              </PayPalScriptProvider>
                </div>
            ) :(
              <button onClick={ ()=> setOpen(true)} className={styles.button}>
                CHECKOUT NOW!
              </button>

            ) }
          </div>
      </div>
      {cash &&(
        <OrderDetail total={cart.total} createOrder={createOrder} />
      ) }
    </div>
  );
};

export default Cart;