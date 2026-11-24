// Example Arduino Nano sketch shown on the Technology page.
export const ARDUINO_SKETCH = `// AREA OPTIMISER — Arduino Nano (example sketch)
// A potentiometer sets the length L of a rectangle with fixed perimeter P.
// The Nano computes B, A and A'(L) and gives LED + buzzer feedback.
// Adjust the pin numbers to match your own circuit.

const float P = 40.0;          // fixed perimeter (m)
const int POT_PIN   = A0;      // potentiometer -> length L
const int RED_LED   = 4;       // far from maximum
const int AMBER_LED = 5;       // close to maximum
const int GREEN_LED = 6;       // maximum reached
const int BUZZER    = 8;       // piezo buzzer

void setup() {
  pinMode(RED_LED, OUTPUT);
  pinMode(AMBER_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int raw = analogRead(POT_PIN);                 // 0 ... 1023
  float L = (raw / 1023.0) * (P / 2.0);           // 0 < L < P/2
  float B = P / 2.0 - L;                          // from 2(L + B) = P
  float A = L * B;                                // A(L) = L(P/2 - L)
  float dA = P / 2.0 - 2.0 * L;                   // A'(L) = P/2 - 2L
  float Amax = (P * P) / 16.0;                    // at L = P/4 (A'' = -2 < 0)
  float percent = 100.0 * A / Amax;

  bool atMax = abs(dA) < 0.2;                     // A'(L) is (almost) zero
  digitalWrite(GREEN_LED, atMax);
  digitalWrite(AMBER_LED, !atMax && percent >= 97.0);
  digitalWrite(RED_LED,   !atMax && percent < 97.0);
  if (atMax) tone(BUZZER, 1760, 120); else noTone(BUZZER);

  Serial.print("L="); Serial.print(L);
  Serial.print(" B="); Serial.print(B);
  Serial.print(" A="); Serial.print(A);
  Serial.print(" dA/dL="); Serial.println(dA);
  delay(150);
}
`;
