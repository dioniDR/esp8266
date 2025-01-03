#include <Arduino.h>

const int ledPin = 2; // Pin GPIO2 donde está conectado el LED

void setup() {
    pinMode(ledPin, OUTPUT); // Configura el pin GPIO2 como salida
}

void loop() {
    digitalWrite(ledPin, HIGH); // Enciende el LED
    delay(1000);                // Espera 1 segundo
    digitalWrite(ledPin, LOW);  // Apaga el LED
    delay(1000);                // Espera 1 segundo
}