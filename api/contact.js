module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, message } = req.body;
        const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

        if (!accessKey) {
            return res.status(500).json({ success: false, message: 'CRITICAL: WEB3FORMS_ACCESS_KEY is missing from Vercel Environment Variables.' });
        }

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
        headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: accessKey,
                name,
                email,
                message
            })
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            return res.status(502).json({ success: false, message: 'Non-JSON response from Web3Forms: ' + rawText });
        }

        if (response.ok) {
            return res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            return res.status(response.status).json({ success: false, message: data.message || 'Web3Forms error' });
        }
    } catch (error) {
        // Return the literal error message to the client for debugging
        console.error('Server error stack:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};