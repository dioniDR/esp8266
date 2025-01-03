const { useState, useEffect } = React;

function LEDControl({ index, isOn, onToggle }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-700">LED {index + 1}</span>
                <button 
                    onClick={() => onToggle(index)}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full
                        ${isOn ? 'bg-blue-600' : 'bg-gray-200'}
                        transition-colors duration-200
                    `}
                >
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${isOn ? 'translate-x-6' : 'translate-x-1'}
                        `}
                    />
                </button>
            </div>
        </div>
    );
}

function ConnectionStatus({ isConnected }) {
    return (
        <div className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        `}>
            <span className={`
                h-2 w-2 mr-2 rounded-full
                ${isConnected ? 'bg-green-500' : 'bg-red-500'}
            `}/>
            {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
    );
}

function App() {
    const [leds, setLeds] = useState(Array(3).fill(false));
    const [connected, setConnected] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    const toggleLED = async (index) => {
        try {
            const action = leds[index] ? 'off' : 'on';
            const response = await fetch(`/${action}${index}`);
            
            if (response.ok) {
                setLeds(prevLeds => {
                    const newLeds = [...prevLeds];
                    newLeds[index] = !newLeds[index];
                    return newLeds;
                });
                setConnected(true);
            }
        } catch (error) {
            console.error('Error:', error);
            setConnected(false);
        }
    };

    const updateStatus = async () => {
        try {
            const response = await fetch('/status');
            const data = await response.json();
            setLeds(data.leds || Array(3).fill(false));
            setConnected(true);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error:', error);
            setConnected(false);
        }
    };

    useEffect(() => {
        updateStatus(); // Primera actualización
        const interval = setInterval(updateStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-md">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Control Panel</h1>
                <ConnectionStatus isConnected={connected} />
            </header>

            <main>
                <div className="space-y-4">
                    {leds.map((isOn, index) => (
                        <LEDControl
                            key={index}
                            index={index}
                            isOn={isOn}
                            onToggle={toggleLED}
                        />
                    ))}
                </div>

                {lastUpdate && (
                    <div className="mt-8 p-4 bg-white rounded-lg shadow-sm text-sm text-gray-600">
                        <p>LEDs Activos: {leds.filter(led => led).length}</p>
                        <p>Última actualización: {lastUpdate.toLocaleTimeString()}</p>
                    </div>
                )}
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);