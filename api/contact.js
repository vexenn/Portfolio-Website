module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        let body = req.body;
        if (!body) {
            return res.status(400).json({ success: false, message: 'Request body is empty.' });
        }

        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid JSON format in body.' });
            }
        }

        const { name, email, message } = body;
        const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

        if (!accessKey) {
            return res.status(500).json({ success: false, message: 'Configuration error: WEB3FORMS_ACCESS_KEY is missing.' });
        }

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
        }

        const web3Response = await fetch('https://api.web3forms.com/submit', {
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

        const responseText = await web3Response.text();
        let resultData;
        
        try {
            resultData = JSON.parse(responseText);
        } catch (err) {
            return res.status(502).json({ success: false, message: 'Invalid response received from email service.' });
        }

        if (web3Response.ok) {
            return res.status(200).json({ success: true, message: 'Message sent successfully!' });
        } else {
            return res.status(web3Response.status).json({ success: false, message: resultData.message || 'Submission failed.' });
        }

    } catch (err) {
        console.error('Fatal API route error:', err);
        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};