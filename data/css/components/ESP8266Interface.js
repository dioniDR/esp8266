const ESP8266Interface = () => {
    const [wifiStatus, setWifiStatus] = React.useState(true);
    const [systemInfo, setSystemInfo] = React.useState({
      ip: "Cargando...",
      uptime: 0
    });
    const [leds, setLeds] = React.useState([
      { id: 0, name: 'LED 1', status: false },
      { id: 1, name: 'LED 2', status: false },
      { id: 2, name: 'LED 3', status: false },
    ]);
    
    const formatUptime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    };
  
    // Obtener datos del sistema periódicamente
    React.useEffect(() => {
      const fetchSystemInfo = async () => {
        try {
          const response = await fetch('/status');
          const data = await response.json();
          setWifiStatus(data.wifi);
          setSystemInfo({
            ip: data.ip,
            uptime: data.uptime
          });
          // Actualizar estado de LEDs
          setLeds(leds.map((led, index) => ({
            ...led,
            status: data.leds[index]
          })));
        } catch (error) {
          console.error('Error fetching system info:', error);
          setWifiStatus(false);
        }
      };
  
      const interval = setInterval(fetchSystemInfo, 5000);
      fetchSystemInfo(); // Primera carga
      return () => clearInterval(interval);
    }, []);
  
    const toggleLED = async (id) => {
      const led = leds.find(l => l.id === id);
      const newStatus = !led.status;
      try {
        await fetch(`/${newStatus ? 'on' : 'off'}${id}`);
        setLeds(leds.map(led => 
          led.id === id ? { ...led, status: newStatus } : led
        ));
      } catch (error) {
        console.error('Error toggling LED:', error);
      }
    };
  
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Sistema de Control LED</h2>
                <div className="flex items-center space-x-2">
                  <span className={wifiStatus ? "text-green-500" : "text-red-500"}>
                    {wifiStatus ? "Conectado" : "Desconectado"}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
  
          {/* LED Controls */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Control de LEDs</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leds.map((led) => (
                  <div key={led.id} className="flex items-center justify-between p-2 bg-gray-900 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${led.status ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className="font-medium">{led.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {led.status ? 'Encendido' : 'Apagado'}
                      </span>
                      <Switch 
                        checked={led.status}
                        onCheckedChange={() => toggleLED(led.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
  
          {/* System Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Información del Sistema</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Dirección IP:</span>
                  <span className="font-mono">{systemInfo.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiempo activo:</span>
                  <span>{formatUptime(systemInfo.uptime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };