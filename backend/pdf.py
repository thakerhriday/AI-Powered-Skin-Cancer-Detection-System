import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key="AIzaSyBT4v2DIuDyWv39qmhByiHQ0vI4OderyyQ ")

# Load the model
model = genai.GenerativeModel("gemini-pro")

# Define a prompt
prompt = "What are the symptoms of skin cancer?"

# Generate a response
try:
    response = model.generate_content(prompt)
    print("Gemini API Response:", response.text)
except Exception as e:
    print("Error:", e)
