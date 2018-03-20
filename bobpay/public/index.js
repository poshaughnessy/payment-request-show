/**
 * Utilities for registering/unregistering the Payment App service worker...
 */

const SERVICE_WORKER_URL = '/payment-request-show/bobpay/public/pay/sw-bobpay.js'

// Adds the BobPay default instrument.
function addInstruments(registration) {
  registration.paymentManager.userHint = "test@bobpay.xyz";
  return Promise.all([registration.paymentManager.instruments.set(
    "dc2de27a-ca5e-4fbd-883e-b6ded6c69d4f",
    {
      name: "My Bob Pay Account",
      icons: [{
        src:"/payment-request-show/bobpay/public/pay/bobpay.png",
        sizes:"32x32",
        type:"image/png"}
      ],
      enabledMethods: ["https://emerald-eon.appspot.com/bobpay"]
    })]);
};

// Shows/hides the webpage controls for installing/removing the service
// worker.
function showBobPayStatus(enabled) {
    showBobPayError("");
    var buttonText = enabled ?
            'Web App Installed &#9989;' : 'Install Web App';
    document.getElementById("installbutton").innerHTML = buttonText;

    document.getElementById("installed").classList.toggle(
            'invisible', !enabled);
    document.getElementById("notinstalled").classList.toggle(
            'invisible', enabled);
}

// Shows/clears an error related to the service worker installation.
function showBobPayError(errorMessage) {
    document.getElementById('bobpayerror').innerHTML = errorMessage;
}

// Registers the payment app service worker by installing the default
// instruments.
function registerPaymentAppServiceWorker() {
  navigator.serviceWorker.register(SERVICE_WORKER_URL).then(function(registration) {
    if(!registration.paymentManager) {
      // Payment app capability not available, unregister right away.
      registration.unregister().then((success) => {});
      showBobPayError('Payment app capability not present. Enable flags?');
      return;
    }

    addInstruments(registration).then(function() {
        showBobPayStatus(/*enabled=*/true);
    });
  }).catch((error) => {
    showBobPayError(error);
  });
}

// Registers the payment app service worker by installing the default
// instruments.
function unregisterPaymentAppServiceWorker() {
  navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL).then(function(registration) {
    registration.unregister().then((success) => {
        showBobPayStatus(!success);
    });
});
}

// When page is loaded, checks for the existence of the service worker.
navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL).then(function(registration) {
    if (registration) {
        // BobPay service worker is installed.
        if (registration.paymentManager) {
            // Always update the installed service worker.
            registration.update();
        } else {
            // Not supposed to have a BobPay service worker if there is no
            // paymentManager available (feature is now off?). Remove the
            // service worker.
            unregisterPaymentAppServiceWorker();
        }
    }
    showBobPayStatus(!!registration);
});