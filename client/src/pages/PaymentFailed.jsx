import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';

const PaymentFailed = () => {
    return (
        <div className="min-h-screen pt-32 pb-12 bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-lg text-center border border-gray-100">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={48} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-500 mb-8">Oops! Something went wrong with your transaction. Please verify your payment details and try again.</p>

                <div className="space-y-4">
                    <Link to="/checkout" className="block w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                        <RefreshCw size={20} /> Try Again
                    </Link>
                    <Link to="/cart" className="block w-full bg-white text-gray-700 font-bold py-4 rounded-xl border-2 border-gray-200 hover:border-gray-900 transition-all">
                        Back to Cart
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
