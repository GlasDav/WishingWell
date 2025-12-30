// Configuration - Update with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SjzG0D6A6ICTwOT7Dk7udv9fSamuBJiMGck0w19QE4S8Bp8wXoR962qJy32cLSiQEQYNQtfWZLkpPHrBniNwdSY00pjTlxRnQ';

// Initialize Stripe
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
const elements = stripe.elements();

// Create card element
const cardElement = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#2d1b2e',
            fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            '::placeholder': {
                color: '#9d8ba3',
            },
        },
        invalid: {
            color: '#721c24',
            iconColor: '#721c24',
        },
    },
});

cardElement.mount('#card-element');

// Handle card element errors
cardElement.on('change', (event) => {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Get form elements
const form = document.getElementById('payment-form');
const amountInput = document.getElementById('amount');
const coverFeesCheckbox = document.getElementById('cover-fees');
const submitButton = document.getElementById('submit-button');
const buttonText = document.getElementById('button-text');
const spinner = document.getElementById('spinner');

// Amount display elements
const giftAmountDisplay = document.getElementById('gift-amount-display');
const feeAmountDisplay = document.getElementById('fee-amount-display');
const totalAmountDisplay = document.getElementById('total-amount-display');
const feeRow = document.getElementById('fee-row');

// Calculate and update amount display
function updateAmountDisplay() {
    const amount = parseFloat(amountInput.value) || 0;
    const coverFees = coverFeesCheckbox.checked;

    giftAmountDisplay.textContent = `$${amount.toFixed(2)}`;

    if (coverFees && amount > 0) {
        // Calculate fee: Stripe charges 1.75% + $0.30
        // To get the total amount that results in 'amount' after fees:
        // amount = total - (total * 0.0175 + 0.30)
        // total = (amount + 0.30) / 0.9825
        const totalWithFees = (amount + 0.30) / 0.9825;
        const fee = totalWithFees - amount;

        feeAmountDisplay.textContent = `$${fee.toFixed(2)}`;
        totalAmountDisplay.textContent = `$${totalWithFees.toFixed(2)}`;
        feeRow.style.display = 'flex';
    } else {
        feeAmountDisplay.textContent = '$0.00';
        totalAmountDisplay.textContent = `$${amount.toFixed(2)}`;
        feeRow.style.display = 'none';
    }
}

// Add event listeners for amount updates
amountInput.addEventListener('input', updateAmountDisplay);
coverFeesCheckbox.addEventListener('change', updateAmountDisplay);

// Handle form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const amount = parseFloat(amountInput.value);
    if (!amount || amount < 1) {
        alert('Please enter a valid gift amount');
        return;
    }

    // Disable button and show spinner
    submitButton.disabled = true;
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
        // Get form data
        const guestName = document.getElementById('guest-name').value;
        const guestMessage = document.getElementById('guest-message').value;
        const coverFees = coverFeesCheckbox.checked;

        // Create payment intent on the server
        const response = await fetch('https://wishingwell.onrender.com/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount,
                guestName,
                guestMessage,
                coverFees,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();

        // Confirm the payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: guestName,
                },
            },
        });

        if (error) {
            // Show error to customer
            document.getElementById('card-errors').textContent = error.message;
            submitButton.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        } else if (paymentIntent.status === 'succeeded') {
            // Payment succeeded - show success message
            form.classList.add('hidden');
            document.getElementById('payment-result').classList.remove('hidden');

            // Reset form after a delay
            setTimeout(() => {
                form.reset();
                cardElement.clear();
                updateAmountDisplay();
            }, 1000);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('card-errors').textContent = 'An error occurred. Please try again.';
        submitButton.disabled = false;
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
});

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    navigator.clipboard.writeText(text).then(() => {
        // Find the copy button for this element
        const button = element.nextElementSibling;
        const originalText = button.textContent;

        // Show feedback
        button.textContent = '✓ Copied!';
        button.style.background = '#4CAF50';
        button.style.color = 'white';

        // Reset after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy. Please select and copy manually.');
    });
}

// Load payment details from environment (this would normally come from the server)
// For now, we'll use placeholder values
async function loadPaymentDetails() {
    // In production, fetch these from your server endpoint
    // UPDATE THESE WITH YOUR REAL DETAILS (should match your .env file)
    const paymentDetails = {
        payid: '', // Leave empty if you don't have a PayID
        bsb: '182-182',
        account: '020189007',
        accountName: 'David Glasser & Danielle Beth Herman'
    };

    // Only show PayID section if it exists
    const payidItem = document.getElementById('payid-value').closest('.detail-item');
    const divider = document.querySelector('.divider');

    if (paymentDetails.payid && paymentDetails.payid.trim() !== '') {
        document.getElementById('payid-value').textContent = paymentDetails.payid;
        payidItem.style.display = 'grid';
        if (divider) divider.style.display = 'block';
    } else {
        // Hide PayID section if not configured
        payidItem.style.display = 'none';
        if (divider) divider.style.display = 'none';
    }

    document.getElementById('bsb-value').textContent = paymentDetails.bsb;
    document.getElementById('account-value').textContent = paymentDetails.account;
    document.getElementById('account-name-value').textContent = paymentDetails.accountName;
}

// Initialize on page load
window.addEventListener('load', () => {
    updateAmountDisplay();
    loadPaymentDetails();
});
