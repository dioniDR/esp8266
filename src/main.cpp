#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "Pixel_9615";
const char* password = "hsx2geazxcwufy5";

ESP8266WebServer server(80);

const int ledPins[] = {2, 5, 4, 0}; // Pines GPIO donde están conectados los LEDs

void handleRoot() {
    String html = "<html><body><h1>Control de LEDs</h1>";
    for (int i = 0; i < 4; i++) {
        html += "<p>LED " + String(i+1) + ": <a href=\"/on" + String(i) + "\">ON</a> <a href=\"/off" + String(i) + "\">OFF</a></p>";
    }
    html += "</body></html>";
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

void setup() {
    Serial.begin(115200);
    for (int i = 0; i < 4; i++) {
        pinMode(ledPins[i], OUTPUT);
        digitalWrite(ledPins[i], LOW);
    }

    WiFi.begin(ssid, password);
    Serial.print("Connecting to ");
    Serial.println(ssid);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    digitalWrite(ledPins[0], HIGH); // Enciende el LED en GPIO2 al conectarse

    server.on("/", handleRoot);
    for (int i = 0; i < 4; i++) {
        server.on("/on" + String(i), [i]() { handleLEDOn(i); });
        server.on("/off" + String(i), [i]() { handleLEDOff(i); });
    }

    server.begin();
    Serial.println("HTTP server started");
}

void loop() {
    server.handleClient();
}