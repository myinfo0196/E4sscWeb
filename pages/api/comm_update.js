export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers

    if (req.method === 'OPTIONS') {
        // Handle preflight request
        res.status(200).end();
        return;
    }

    // Your existing logic for handling POST requests
    if (req.method === 'POST') {
        // Handle the request
        res.status(200).json({ message: 'Success' });
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
