import QRCode from 'qrcode.react';
import { useLocation } from 'react-router-dom';

function QRCodePage() {
    const { state } = useLocation();
    const qrData = state?.qrData || 'No data available';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-12 rounded-lg shadow-xl max-w-lg w-full text-center">
                <h1 className="text-3xl font-bold mb-4">Your QR Code</h1>
                <QRCode value={qrData} size={256} level="H" />
                <p className="mt-4 text-lg">Scan this QR code to access the data.</p>
            </div>
        </div>
    );
}

export default QRCodePage;
