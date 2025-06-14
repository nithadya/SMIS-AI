import React, { useState } from 'react';

const PaymentGateway = ({ paymentData, onSuccess, onError, onCancel }) => {
  const [processing, setProcessing] = useState(false);

  // PayHere configuration
  const PAYHERE_CONFIG = {
    sandbox: true, // Set to false for production
    merchant_id: "1221149", // Replace with your PayHere merchant ID
    return_url: window.location.origin + "/payment-success",
    cancel_url: window.location.origin + "/payment-cancel",
    notify_url: window.location.origin + "/payment-notify"
  };

  const processPayment = async () => {
    setProcessing(true);

    try {
      // PayHere payment object
      const payment = {
        sandbox: PAYHERE_CONFIG.sandbox,
        merchant_id: PAYHERE_CONFIG.merchant_id,
        return_url: PAYHERE_CONFIG.return_url,
        cancel_url: PAYHERE_CONFIG.cancel_url,
        notify_url: PAYHERE_CONFIG.notify_url,
        order_id: paymentData.orderId,
        items: paymentData.description,
        amount: paymentData.amount,
        currency: "LKR",
        hash: generateHash(paymentData),
        first_name: paymentData.firstName,
        last_name: paymentData.lastName,
        email: paymentData.email,
        phone: paymentData.phone || "0771234567",
        address: paymentData.address || "ICBT Campus",
        city: paymentData.city || "Colombo",
        country: "Sri Lanka"
      };

      // Check if PayHere is loaded and try to use it
      if (typeof window.payhere !== 'undefined') {
        try {
          window.payhere.startPayment(payment);
        } catch (payhereError) {
          console.log('PayHere CORS error, falling back to demo mode:', payhereError);
          // Fall back to demo mode if PayHere fails due to CORS
          simulatePayment();
        }
      } else {
        console.log('PayHere not loaded, using demo mode');
        simulatePayment();
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      onError({ error_message: error.message });
      setProcessing(false);
    }
  };

  const simulatePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      if (success) {
        onSuccess({
          payment_id: `PAY_${Date.now()}`,
          status_code: 2,
          md5sig: 'demo_signature',
          order_id: paymentData.orderId,
          payhere_amount: paymentData.amount,
          payhere_currency: 'LKR',
          status_message: 'Successfully completed (Demo Mode)'
        });
      } else {
        onError({
          error_message: 'Payment failed - Demo mode simulation',
          order_id: paymentData.orderId
        });
      }
      setProcessing(false);
    }, 3000);
  };

  const generateHash = (data) => {
    // In production, this should be generated on your backend
    // This is a simplified version for demo purposes
    const hashString = `${PAYHERE_CONFIG.merchant_id}${data.orderId}${data.amount}LKR`;
    return btoa(hashString); // Base64 encode for demo
  };

  // PayHere event handlers
  React.useEffect(() => {
    if (typeof window.payhere !== 'undefined') {
      // Store original handlers to avoid conflicts
      const originalCompleted = window.payhere.onCompleted;
      const originalDismissed = window.payhere.onDismissed;
      const originalError = window.payhere.onError;

      window.payhere.onCompleted = function onPaymentCompleted(orderId) {
        console.log("Payment completed. OrderID:" + orderId);
        onSuccess({
          payment_id: `PAY_${Date.now()}`,
          status_code: 2,
          order_id: orderId,
          payhere_amount: paymentData.amount,
          payhere_currency: 'LKR',
          status_message: 'Successfully completed'
        });
        setProcessing(false);
      };

      window.payhere.onDismissed = function onPaymentDismissed() {
        console.log("Payment dismissed");
        onCancel();
        setProcessing(false);
      };

      window.payhere.onError = function onPaymentError(error) {
        console.log("PayHere Error:", error);
        // Don't call onError here to avoid infinite loop
        // Instead, fall back to demo mode
        console.log("Falling back to demo mode due to PayHere error");
        simulatePayment();
      };

      // Cleanup function to restore original handlers
      return () => {
        if (originalCompleted) window.payhere.onCompleted = originalCompleted;
        if (originalDismissed) window.payhere.onDismissed = originalDismissed;
        if (originalError) window.payhere.onError = originalError;
      };
    }
  }, [paymentData, onSuccess, onError, onCancel]);

  return (
    <div className="payment-gateway">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-600">Student:</span>
            <span className="font-medium">{paymentData.firstName} {paymentData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Order ID:</span>
            <span className="font-medium">{paymentData.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Description:</span>
            <span className="font-medium">{paymentData.description}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Amount:</span>
            <span>LKR {parseFloat(paymentData.amount).toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://www.payhere.lk/downloads/images/payhere_logo_dark.png" 
              alt="PayHere" 
              className="h-8"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Demo Mode Notice */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Demo Mode:</strong> This is a simulated payment for development purposes. 
              No real money will be charged.
            </p>
          </div>
          
          <button
            onClick={processPayment}
            disabled={processing}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              processing
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              'Pay Now (Demo)'
            )}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Secure payment powered by PayHere (Demo Mode)
            </p>
            <div className="flex justify-center items-center mt-2 space-x-2">
              <span className="text-xs text-slate-400">Accepted:</span>
              <div className="flex space-x-1">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">Visa</span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">MasterCard</span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway; 