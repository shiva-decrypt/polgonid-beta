import { useEffect, useState } from 'react';
import axios from 'axios';

import QRCode from "react-qr-code";
import './App.css';

function App() {
  const [qrcodeLink, setqrcodeLink] = useState()
  const [sessionId, setsessionId] = useState()
  const [isPolling, setIsPolling] = useState(false);
  const [currentState, setcurrentState] = useState(0) // 0 for form Input || // 1 for Qr // 2 for successfull
  const [id, setid] = useState()
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    document: {
      documentType: '',
      documentNumber: '',
      validUpto: '',
    },
    userWalletAddress: ''
  });

  useEffect(() => {
    if (isPolling) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `https://issuer-admin.polygonid.me/v1/credentials/links/${id}/qrcode?sessionID=${sessionId}`,
            {
              headers: {
                'accept': 'application/json',
                'authorization': 'Basic dXNlci1hcGk6cGFzc3dvcmQtYXBp',
              }
            }
          );

          if (response?.data?.status === "done") {
            setcurrentState(2);
            setIsPolling(false);
          }
        } catch (error) {
          console.error('Polling Error:', error);
        }
      }, 4000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [isPolling, sessionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('document')) {
      setFormData({
        ...formData,
        document: {
          ...formData.document,
          [name.split('.')[1]]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.country || !formData.document.documentType || !formData.document.documentNumber || !formData.document.validUpto || !formData.userWalletAddress) {
      alert('All fields are required.');
      return;
    }

    try {
      const response = await axios.post(
        'https://issuer-admin.polygonid.me/v1/credentials/links',
        {
          "credentialExpiration": null,
          "credentialSubject": {
            "fullName": formData.fullName,
            "country": formData.country,
            "userWalletAdress": formData.userWalletAddress,
            "document": {
              "documentType": formData.document.documentType,
              "documentNumber": formData.document.documentNumber,
              "ValidUpto": formData.document.validUpto
            }
          },
          "expiration": null,
          "limitedClaims": null,
          "mtProof": false,
          "refreshService": null,
          "schemaID": "227d206b-6480-43eb-adba-24705adc8ec0",
          "signatureProof": true
        },
        {
          headers: {
            'accept': 'application/json',
            'authorization': 'Basic dXNlci1hcGk6cGFzc3dvcmQtYXBp',
            'content-type': 'application/json',
          }
        }
      );


      setid(response.data.id)
      const qrdata = await axios.post(
        `https://issuer-admin.polygonid.me/v1/credentials/links/${response.data.id}/qrcode`,
        {
          headers: {
            'accept': 'application/json',
            'authorization': 'Basic dXNlci1hcGk6cGFzc3dvcmQtYXBp',
            'content-type': 'application/json',
          }
        }
      );
      setsessionId(qrdata.data.sessionID)
      setqrcodeLink(qrdata.data.qrCodeRaw)
      setIsPolling(true)
      setcurrentState(1);
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className=" flex items-center justify-center text-white">
      {currentState === 0 && <div className="bg-black p-12 rounded-lg shadow-xl max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mt-4">User KYC Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="shadow-lg appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:shadow-outline"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="country">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="shadow-lg appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Country of Origin"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2">
              Document Details
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-lg mb-2" htmlFor="documentType">
                  Document Type
                </label>
                <input
                  type="text"
                  id="documentType"
                  name="document.documentType"
                  value={formData.document.documentType}
                  onChange={handleChange}
                  className="shadow-lg appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Passport, ID Card"
                />
              </div>
              <div>
                <label className="block text-lg mb-2" htmlFor="documentNumber">
                  Document Number
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  name="document.documentNumber"
                  value={formData.document.documentNumber}
                  onChange={handleChange}
                  className="shadow-lg appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Document Number"
                />
              </div>
              <div>
                <label className="block text-lg mb-2" htmlFor="validUpto">
                  Valid Upto
                </label>
                <input
                  type="date"
                  id="validUpto"
                  name="document.validUpto"
                  value={formData.document.validUpto}
                  onChange={handleChange}
                  className="shadow-lg appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2" htmlFor="userWalletAddress">
              Wallet Address
            </label>
            <input
              type="text"
              id="userWalletAddress"
              name="userWalletAddress"
              value={formData.userWalletAddress}
              onChange={handleChange}
              className="shadow-lg appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:shadow-outline"
              placeholder="User Wallet Address"
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </div>
        </form>
      </div>}
      {currentState === 1 && <div className=' max-w-[420px] min-h-screen h-full w-full flex flex-col justify-center items-center bg-white'>
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={qrcodeLink}
          viewBox={`0 0 256 256`}
        />
        <h1 className='text-black mt-20 text-3xl'>Scan to get your vc</h1>
      </div>}
      {currentState === 2 && <div style={{ height: "auto", width: "100%" }} className=' max-w-[420px] mb-auto bg-white'>

        <h1 className='text-green-500 text-3xl font-bold mt-20'>Credential sent Succesfully</h1>
      </div>}

    </div>
  );
}

export default App;
