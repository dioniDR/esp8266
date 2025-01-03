#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ESPAsyncTCP.h>
#include <LittleFS.h>

const char* ssid = "Pixel_9615";
const char* password = "hsx2geazxcwufy5";

AsyncWebServer server(80);

// Configuración de pines
const int ledPins[] = {5, 4, 0};  // D1, D2, D3
const int wifiLedPin = 2;         // LED_BUILTIN en GPIO2
unsigned long startTime = 0;       // Para calcular el tiempo de actividad

void setupLEDs() {
    pinMode(wifiLedPin, OUTPUT);
    digitalWrite(wifiLedPin, LOW);
    
    for (int i = 0; i < 3; i++) {
        pinMode(ledPins[i], OUTPUT);
        digitalWrite(ledPins[i], LOW);
    }
}

void setupFileSystem() {
    if (!LittleFS.begin()) {
        Serial.println("Error montando LittleFS");
        return;
    }
    Serial.println("Sistema de archivos montado correctamente");
}

void connectToWiFi() {
    WiFi.begin(ssid, password);
    Serial.print("Conectando a WiFi");
    
    while (WiFi.status() != WL_CONNECTED) {
        digitalWrite(wifiLedPin, LOW);
        delay(500);
        Serial.print(".");
    }
    
    digitalWrite(wifiLedPin, HIGH);
    Serial.println("\nConectado al WiFi!");
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP());
}

void setupServer() {
    // Servir archivos estáticos
    server.serveStatic("/", LittleFS, "/").setDefaultFile("index.html");

    // API para obtener el estado del sistema
    server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request) {
        String json = "{";
        json += "\"wifi\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") + ",";
        json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
        json += "\"uptime\":" + String((millis() - startTime) / 1000) + ",";
        json += "\"leds\":[";
        for (int i = 0; i < 3; i++) {
            if (i > 0) json += ",";
            json += String(digitalRead(ledPins[i]) == HIGH ? "true" : "false");
        }
        json += "]}";
        request->send(200, "application/json", json);
    });

    // Control de LEDs
    for (int i = 0; i < 3; i++) {
        // Endpoint para encender LED
        server.on(("/on" + String(i)).c_str(), HTTP_GET, [i](AsyncWebServerRequest *request) {
            digitalWrite(ledPins[i], HIGH);
            request->send(200, "text/plain", "LED " + String(i) + " encendido");
        });

        // Endpoint para apagar LED
        server.on(("/off" + String(i)).c_str(), HTTP_GET, [i](AsyncWebServerRequest *request) {
            digitalWrite(ledPins[i], LOW);
            request->send(200, "text/plain", "LED " + String(i) + " apagado");
        });
    }

    // Manejador para archivos no encontrados
    server.onNotFound([](AsyncWebServerRequest *request) {
        request->send(404, "text/plain", "Archivo no encontrado");
    });

    server.begin();
    Serial.println("Servidor HTTP iniciado");
}

void setup() {
    Serial.begin(115200);
    Serial.println("\nIniciando sistema...");
    
    startTime = millis();  // Registrar tiempo de inicio
    setupLEDs();
    setupFileSystem();
    connectToWiFi();
    setupServer();
    
    Serial.println("Sistema iniciado correctamente");
}

void loop() {
    // Verificar conexión WiFi
    if (WiFi.status() != WL_CONNECTED) {
        digitalWrite(wifiLedPin, LOW);
        Serial.println("Conexión WiFi perdida, reconectando...");
        WiFi.reconnect();
        delay(5000);
    } else {
        digitalWrite(wifiLedPin, HIGH);
    }
}