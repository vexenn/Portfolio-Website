module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        // Ensure body is parsed correctly even if sent as a raw string stream
        let body = req.body;
        if (!body) {
            return res.status(400).json({ success: false, message: 'Request body is empty' });
        }
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid JSON body payload' });
            }
        }

        const { name, email, message } = body;
        const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

        if (!accessKey) {
            return res.status(500).json({ success: false, message: 'Server configuration error: Missing API key.' });
        }

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields: name, email, or message.' });
        }

        const externalResponse = await fetch('https://api.web3forms.com/submit', {
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

        const rawText = await externalResponse.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            return res.status(502).json({ success: false, message: 'Web3Forms returned non-JSON response: ' + rawText });
        }

        if (externalResponse.ok) {
            return res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            return res.status(externalResponse.status).json({ success: false, message: data.message || 'Error from email provider' });
        }

    } catch (error) {
        console.error('Critical serverless execution error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};