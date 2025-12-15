import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(clearCart());
    }, [dispatch]);

    const isSubscription = type === 'subscription';

    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-lg text-center border border-gray-100">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isSubscription ? 'bg-green-100 text-green-600' : 'bg-green-100 text-green-600'}`}>
                    {isSubscription ? <CheckCircle size={48} /> : <CheckCircle size={48} />}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isSubscription ? 'Subscription Started!' : 'Payment Successful!'}
                </h1>

                <p className="text-gray-500 mb-8">
                    {isSubscription
                        ? "Your subscription is active. We'll start delivering your items soon."
                        : "Thank you for your order. We have received your payment and will process your order shortly."}
                </p>

                <div className="bg-gray-50 p-4 rounded-xl mb-8 flex items-center justify-between border border-gray-200">
                    <span className="text-gray-600 font-medium">Order ID:</span>
                    <span className="font-bold text-gray-900">{orderId || 'ORD-12345-XYZ'}</span>
                </div>

                <div className="space-y-4">
                    <Link
                        to={isSubscription ? "/subscriptions" : "/orders"}
                        className="block w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-primary transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {isSubscription ? 'Manage Subscriptions' : 'View Order Details'} <ArrowRight size={20} />
                    </Link>
                    <Link to="/" className="block w-full bg-white text-gray-700 font-bold py-4 rounded-xl border-2 border-gray-200 hover:border-gray-900 transition-all flex items-center justify-center gap-2">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
