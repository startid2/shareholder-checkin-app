const { useState, useEffect, useRef } = React;

const predefinedShareholders = [
  { id: 1, prenom: 'Alexander', nom: 'Imhoff', email: 'alexander.imhoff@swisstruth.ch', checkedIn: false },
  { id: 2, prenom: 'Alexander', nom: 'Imhoff', email: 'alexander@startid.ch', checkedIn: false },
  { id: 3, prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@example.com', checkedIn: false },
  { id: 4, prenom: 'Marie', nom: 'Martin', email: 'marie.martin@example.com', checkedIn: false },
];

const PASSWORD = "motdepasse123";

const ShareholderCheckinApp = () => {
  const [shareholders, setShareholders] = useState(predefinedShareholders);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [qrContent, setQrContent] = useState(null);
  const [scanningStatus, setScanningStatus] = useState('');
  const videoRef = useRef(null);

  const checkedInCount = shareholders.filter(s => s.checkedIn).length;
  const notCheckedInCount = shareholders.length - checkedInCount;

  const handleManualCheckin = (id) => {
    setShareholders(shareholders.map(s => 
      s.id === id ? { ...s, checkedIn: !s.checkedIn } : s
    ));
    if (qrContent) {
      setQrContent(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredShareholders = shareholders.filter(s => 
    (s.prenom.toLowerCase().includes(searchTerm) || 
    s.nom.toLowerCase().includes(searchTerm) ||
    s.email.toLowerCase().includes(searchTerm)) &&
    (activeTab === "all" || 
    (activeTab === "checkedIn" && s.checkedIn) ||
    (activeTab === "notCheckedIn" && !s.checkedIn))
  );

  const handleScanQR = () => {
    setShowScanner(true);
    setScanning(true);
    setScanningStatus('Initialisation de la caméra...');
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(function(stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.play();
        setScanningStatus('Caméra prête. Présentez le QR code.');
        console.log("Starting QR scan");
        scanQRCode();
      })
      .catch(function(error) {
        console.error("Erreur d'accès à la caméra:", error);
        setScanningStatus('Erreur d\'accès à la caméra. Veuillez vérifier les permissions.');
      });
  };

  const scanQRCode = () => {
    console.log("Scanning...");
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      console.log("Video ready");
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.log("Image data:", imageData.width, imageData.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log("QR code found:", code.data);
        try {
          const parsedData = JSON.parse(code.data);
          setQrContent(parsedData);
          setShowScanner(false);
          setScanning(false);
          if (videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        } catch (error) {
          console.error("Erreur lors du parsing du QR code:", error);
          setScanningStatus('QR code invalide. Veuillez réessayer.');
        }
      } else {
        console.log("No QR code found");
        requestAnimationFrame(scanQRCode);
      }
    } else {
      console.log("Video not ready");
      requestAnimationFrame(scanQRCode);
    }
  };

  const processScannedData = (data) => {
    const matchedShareholder = shareholders.find(s => 
      s.prenom === data.prenom && s.nom === data.nom && s.email === data.email
    );
    if (matchedShareholder) {
      handleManualCheckin(matchedShareholder.id);
      setScanningStatus(`Check-in effectué pour ${data.prenom} ${data.nom}`);
    } else {
      setScanningStatus('Actionnaire non trouvé');
    }
  };

  const handleLogin = () => {
    if (password === PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Mot de passe incorrect");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Connexion</h1>
          <input
            type="password"
            placeholder="Entrez le mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button onClick={handleLogin} className="w-full p-2 bg-blue-500 text-white rounded">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Check-in des Actionnaires</h1>
      
      <div className="mb-4 text-center">
        <span className="text-5xl font-bold">{checkedInCount}</span>
        <p className="text-xl">Actionnaires enregistrés</p>
      </div>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Rechercher un actionnaire..."
          className="flex-grow p-2 border rounded-l"
          onChange={handleSearch}
        />
        <button 
          onClick={handleScanQR}
          className="bg-blue-500 text-white p-2 rounded-r flex items-center"
          disabled={scanning}
        >
          {scanning ? 'Scanning...' : 'Scanner QR'}
        </button>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Scanner QR</h2>
            <p className="mb-2">{scanningStatus}</p>
            <video ref={videoRef} className="w-full mb-2"></video>
            <button 
              onClick={() => {
                setShowScanner(false);
                setScanning(false);
                setScanningStatus('');
                if (videoRef.current && videoRef.current.srcObject) {
                  videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                }
              }}
              className="w-full p-2 bg-red-500 text-white rounded"
            >
              Fermer le scanner
            </button>
          </div>
        </div>
      )}

      {qrContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Résultat du scan</h2>
            <pre className="bg-gray-100 p-2 rounded mb-4 overflow-auto">
              {JSON.stringify(qrContent, null, 2)}
            </pre>
            <button 
              onClick={() => {
                processScannedData(qrContent);
                setQrContent(null);
              }}
              className="w-full p-2 bg-green-500 text-white rounded mb-2"
            >
              Confirmer le check-in
            </button>
            <button 
              onClick={() => setQrContent(null)}
              className="w-full p-2 bg-red-500 text-white rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button 
          onClick={() => setActiveTab("all")} 
          className={`mr-2 p-2 ${activeTab === "all" ? "bg-blue-500 text-white" : "bg-gray-200"} rounded`}
        >
          Tous ({shareholders.length})
        </button>
        <button 
          onClick={() => setActiveTab("checkedIn")} 
          className={`mr-2 p-2 ${activeTab === "checkedIn" ? "bg-blue-500 text-white" : "bg-gray-200"} rounded`}
        >
          Check-in ({checkedInCount})
        </button>
        <button 
          onClick={() => setActiveTab("notCheckedIn")} 
          className={`p-2 ${activeTab === "notCheckedIn" ? "bg-blue-500 text-white" : "bg-gray-200"} rounded`}
        >
          Pas de Check-in ({notCheckedInCount})
        </button>
      </div>

      <ul className="space-y-2">
        {filteredShareholders.map(shareholder => (
          <li key={shareholder.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span>{`${shareholder.prenom} ${shareholder.nom} (${shareholder.email})`}</span>
            <input
              type="checkbox"
              checked={shareholder.checkedIn}
              onChange={() => handleManualCheckin(shareholder.id)}
              className="h-6 w-6"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

ReactDOM.render(<ShareholderCheckinApp />, document.getElementById('root'));
