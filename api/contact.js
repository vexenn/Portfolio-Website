export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, message } = req.body;

    // Basic backend validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Forward the request to Web3Forms, injecting the secret key
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: process.env.WEB3FORMS_ACCESS_KEY,
                name: name,
                email: email,
                message: message
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            return res.status(response.status).json({ success: false, message: data.message });
        }
    } catch (error) {
        console.error('Submission error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}