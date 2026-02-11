# chat.py

from api.askbot import start_askbot, askbot

stored_data = {
    "age": 52,
    "bmi": 29,
    "systolic_bp": 150,
    "diastolic_bp": 95,
    "sugar": 160,
    "heart_rate": 85,
    "ecg_flag": 1
}

print(start_askbot(stored_data))

while True:
    q = input("\nYou: ")
    if q.lower() in ["exit", "quit"]:
        break
    print("\nBot:", askbot(q))
