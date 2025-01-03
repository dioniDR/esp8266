#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "Pixel_9615";          // Cambia por el SSID de tu hotspot
const char* password = "hsx2geazxcwufy5"; // Cambia por la contraseña de tu hotspot

ESP8266WebServer server(80);

const int ledPins[] = {5, 4, 0}; // Pines GPIO donde están conectados los LEDs adicionales
const int wifiLedPin = 2;        // Pin GPIO2 para el indicador de conexión WiFi

unsigned long lastReconnectAttempt = 0; // Último intento de reconexión

void handleRoot() {
    String html = F("<html><body><h1>Control de LEDs</h1>");
    String wifiStatus = (WiFi.status() == WL_CONNECTED) ? "Conectado" : "Reconectando...";
    html += "<p>Estado del WiFi: <strong>" + wifiStatus + "</strong></p>";
    for (int i = 0; i < 3; i++) {
        html += "<p>LED " + String(i + 1) + ": <a href=\"/on" + String(i) + "\">ON</a> <a href=\"/off" + String(i) + "\">OFF</a></p>";
    }
    html += F("</body></html>");
    server.send(200, "text/html", html);
}

void handleLEDOn(int ledIndex) {
    digitalWrite(ledPins[ledIndex], HIGH);
    handleRoot();
}

void handleLEDOff(int ledIndex) {
    digitalWrite(ledPins[ledIndex], LOW);
    handleRoot();
}

void connectToWiFi() {
    WiFi.begin(ssid, password);
    Serial.print("Connecting to ");
    Serial.println(ssid);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        digitalWrite(wifiLedPin, LOW); // Apaga el LED mientras intenta conectarse
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP()); // Imprime la IP en el monitor serial
    digitalWrite(wifiLedPin, HIGH); // Enciende el LED al conectarse
}

void setup() {
    Serial.begin(115200);
    pinMode(wifiLedPin, OUTPUT);
    digitalWrite(wifiLedPin, LOW); // Asegura que el LED esté apagado al inicio

    for (int i = 0; i < 3; i++) {
        pinMode(ledPins[i], OUTPUT);
        digitalWrite(ledPins[i], LOW);
    }

    connectToWiFi();

    server.on("/", handleRoot);
    for (int i = 0; i < 3; i++) {
        server.on("/on" + String(i), [i]() { handleLEDOn(i); });
        server.on("/off" + String(i), [i]() { handleLEDOff(i); });
    }

    server.begin();
    Serial.println("HTTP server started");
}

void loop() {
    // Verifica el estado del WiFi
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long currentMillis = millis();
        if (currentMillis - lastReconnectAttempt > 5000) { // Intenta reconectar cada 5 segundos
            lastReconnectAttempt = currentMillis;
            Serial.println("Reconectando al WiFi...");
            digitalWrite(wifiLedPin, LOW); // Apaga el LED si se pierde la conexión
            connectToWiFi();
        }
    } else {
        digitalWrite(wifiLedPin, HIGH); // Enciende el LED si está conectado
        Serial.print("Dirección IP (desde loop): ");
        Serial.println(WiFi.localIP()); // Imprime la IP continuamente en el monitor serial
    }

    // Manejo de solicitudes HTTP
    server.handleClient();
}
