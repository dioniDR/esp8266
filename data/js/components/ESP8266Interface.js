const ESP8266Interface = () => {
  const [wifiStatus, setWifiStatus] = React.useState(true);
  const [leds, setLeds] = React.useState([
    { id: 0, name: 'LED 1', status: false },
    { id: 1, name: 'LED 2', status: false },
    { id: 2, name: 'LED 3', status: false },
  ]);
  
  const toggleLED = (id) => {
    setLeds(leds.map(led => 
      led.id === id ? { ...led, status: !led.status } : led
    ));
    // Aquí irá la llamada al ESP8266
    fetch(`/${led.status ? 'off' : 'on'}${id}`).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
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
                <div key={led.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${led.status ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-medium">{led.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
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
                <span className="text-gray-500">Dirección IP:</span>
                <span className="font-mono">192.168.1.100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tiempo activo:</span>
                <span>2h 15m</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};