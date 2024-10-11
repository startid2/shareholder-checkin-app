const { useState, useEffect, useRef } = React;

// ... (le reste du code reste inchangé jusqu'à la fonction ShareholderCheckinApp)

const ShareholderCheckinApp = () => {
  // ... (les autres états restent inchangés)
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleScanQR = () => {
    setShowScanner(true);
    setScanning(true);
    startScanner();
  };

  const startScanner = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(function(stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.play();
        requestAnimationFrame(tick);
      });
  };

  const tick = () => {
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      canvasRef.current.height = videoRef.current.videoHeight;
      canvasRef.current.width = videoRef.current.videoWidth;
      const context = canvasRef.current.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        console.log("Found QR code", code.data);
        processScannedData(JSON.parse(code.data));
        setShowScanner(false);
        setScanning(false);
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      } else {
        requestAnimationFrame(tick);
      }
    } else {
      requestAnimationFrame(tick);
    }
  };

  // ... (le reste du code reste inchangé)

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* ... (le reste du JSX reste inchangé) */}
      
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Scanner QR</h2>
            <video ref={videoRef} className="w-full"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <button 
              onClick={() => {
                setShowScanner(false);
                setScanning(false);
                if (videoRef.current && videoRef.current.srcObject) {
                  videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                }
              }}
              className="w-full mt-4 p-2 bg-red-500 text-white rounded custom-button"
            >
              Fermer le scanner
            </button>
          </div>
        </div>
      )}

      {/* ... (le reste du JSX reste inchangé) */}
    </div>
  );
};

ReactDOM.render(<ShareholderCheckinApp />, document.getElementById('root'));
