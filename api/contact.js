module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, message } = req.body;
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

    // 1. Failsafe: Check if the Vercel Environment Variable is actually loaded
    if (!accessKey) {
        console.error('CRITICAL ERROR: WEB3FORMS_ACCESS_KEY is missing from Vercel Environment Variables.');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

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
                access_key: accessKey,
                name: name,
                email: email,
                message: message
            })
        });

        // 2. Failsafe: Read the raw response as text FIRST to prevent the JSON.parse crash
        const rawText = await response.text();

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error('Web3Forms returned an unexpected non-JSON response:', rawText);
            return res.status(502).json({ success: false, message: 'Invalid response from email provider.' });
        }

        if (response.ok) {
            return res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            return res.status(response.status).json({ success: false, message: data.message });
        }
    } catch (error) {
        console.error('Submission error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};