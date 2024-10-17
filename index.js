const ShareholderCheckinApp = () => {
  // ... autres états ...
  const [scanningStatus, setScanningStatus] = useState('');

  // ... autres fonctions ...

  const startScanner = () => {
    setScanningStatus('Initialisation de la caméra...');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(function(stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.play();
        setScanningStatus('Scanning... Présentez le QR code devant la caméra.');
        requestAnimationFrame(tick);
      })
      .catch(function(error) {
        console.error("Erreur d'accès à la caméra:", error);
        setScanningStatus('Erreur d'accès à la caméra. Veuillez vérifier les permissions.');
      });
  };

  // ... reste du code ...

  return (
    // ... autre JSX ...
    {showScanner && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Scanner QR</h2>
          <p className="mb-2">{scanningStatus}</p>
          <video ref={videoRef} className="w-full"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <button 
            onClick={() => {
              setShowScanner(false);
              setScanning(false);
              setScanningStatus('');
              if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
              }
            }}
            className="w-full mt-4 p-2 bg-red-500 text-white rounded"
          >
            Fermer le scanner
          </button>
        </div>
      </div>
    )}
    // ... autre JSX ...
  );
};
