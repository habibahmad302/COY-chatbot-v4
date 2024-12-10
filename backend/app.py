from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from groq import Groq

# Load the configuration
with open("config.json") as config_file:
    config = json.load(config_file)

GROQ_API_KEY = config["GROQ_API_KEY"]
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

# Initialize Groq client
client = Groq()

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Extract the user input
        user_message = request.json.get('message')
        traits = request.json.get('traits', [])
        trait_values = request.json.get('trait_values', {})

        # Log the received traits and trait values
        print(f"Received traits: {traits}")
        print(f"Received trait values: {trait_values}")


        # Validate input
        if not user_message:
            return jsonify({'error': 'Message is required.'}), 400

        # Prepare the traits context for the system prompt
       # Prepare the traits context for the system prompt
        if trait_values:
            traits_context = "The assistant should exhibit the following traits: "
            for trait, value in trait_values.items():
                traits_context += f"{trait} ({value}), "
            traits_context = traits_context.rstrip(", ")  # Remove trailing comma
        else:
            traits_context = "The assistant does not have specific traits for this response."

        # Define the system prompt with traits
        system_prompt = (
            f"{traits_context}\n\n"
            
            "Imagine you are a highly engaging and versatile conversational partner. "
            "You adapt your tone, creativity, and style based on the user's traits. "
            "Be friendly, intuitive, and dynamic in your responses, always tailoring them to fit the scenario provided by the user. "
            "Maintain a conversational flow, adding contextually relevant follow-up questions, ideas, or suggestions.\n\n"
            "Examples:\n"
            "- If traits include 'Creative' and 'Adventurous': 'How about a unique outdoor experience? Let’s explore options!'\n"
            "- If traits include 'Empathetic': 'I’m here to listen. How can I help?'\n\n"
            "Answer must be concise and limited to only 5 lines. Avoid adding unnecessary details"
            "Always end with some suggestions to continue the conversation, clearly listed under 'Suggestions:'."
        )

        # Prepare messages for the AI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        # Log the updated system prompt for verification
        print(f"System prompt being sent to the model: {system_prompt}")

        # Log the messages being sent to the model
        print(f"Messages sent to the model: {messages}")

        # Call Groq API for response generation
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        # Extract the response
        bot_message = response.choices[0].message.content.strip()

        # Parse response and suggestions
        if "Suggestions:" in bot_message:
            response_parts = bot_message.split("Suggestions:")
            ai_response = response_parts[0].strip()
            suggestions = [
                suggestion.strip("- ").strip() for suggestion in response_parts[1].split("\n") if suggestion.strip()
            ]
        else:
            ai_response = bot_message
            suggestions = []  # Default to empty if no suggestions provided

        # Send the JSON response
        return jsonify({'response': ai_response, 'suggestions': suggestions})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'An error occurred while processing the request.'}), 500


@app.route('/api/feedback', methods=['OPTIONS', 'POST'])
def feedback():
    if request.method == 'OPTIONS':
        # Handle CORS preflight
        return '', 200

    if request.method == 'POST':
        try:
            # Extract and validate feedback data
            feedback_data = request.json.get('feedback')
            if feedback_data:
                # Process the feedback (e.g., save to a database or log it)
                print(f"Feedback received: {feedback_data}")
                return jsonify({'message': 'Feedback received successfully!'}), 200
            else:
                return jsonify({'error': 'No feedback data provided.'}), 400
        except Exception as e:
            print(f"Error: {str(e)}")
            return jsonify({'error': 'An error occurred while processing feedback.'}), 500


if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from groq import Groq

# Load the configuration
with open("config.json") as config_file:
    config = json.load(config_file)

GROQ_API_KEY = config["GROQ_API_KEY"]
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

# Initialize Groq client
client = Groq()

app = Flask(__name__)
CORS(app)

# Define a function to handle errors
def handle_error(error, status_code):
    print(f"Error: {str(error)}")
    return jsonify({'error': 'An error occurred while processing the request.'}), status_code

# Define a function to validate input
def validate_input(data, required_fields):
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required.'}), 400
    return None

# Define a function to prepare traits context
def prepare_traits_context(trait_values):
    if trait_values:
        traits_context = "The assistant should exhibit the following traits: "
        for trait, value in trait_values.items():
            traits_context += f"{trait} ({value}), "
        traits_context = traits_context.rstrip(", ")  # Remove trailing comma
    else:
        traits_context = "The assistant does not have specific traits for this response."
    return traits_context

# Define a function to prepare system prompt
def prepare_system_prompt(traits_context):
    system_prompt = (
        f"{traits_context}\n\n"
        "Imagine you are a highly engaging and versatile conversational partner. "
        "You adapt your tone, creativity, and style based on the user's traits. "
        "Be friendly, intuitive, and dynamic in your responses, always tailoring them to fit the scenario provided by the user. "
        "Maintain a conversational flow, adding contextually relevant follow-up questions, ideas, or suggestions.\n\n"
        "Examples:\n"
        "- If traits include 'Creative' and 'Adventurous': 'How about a unique outdoor experience? Let’s explore options!'\n"
        "- If traits include 'Empathetic': 'I’m here to listen. How can I help?'\n\n"
        "Always end with some suggestions to continue the conversation, clearly listed under 'Suggestions:'."
    )
    return system_prompt

# Define a function to parse response and suggestions
def parse_response(bot_message):
    if "Suggestions:" in bot_message:
        response_parts = bot_message.split("Suggestions:")
        ai_response = response_parts[0].strip()
        suggestions = [
            suggestion.strip("- ").strip() for suggestion in response_parts[1].split("\n") if suggestion.strip()
        ]
    else:
        ai_response = bot_message
        suggestions = []  # Default to empty if no suggestions provided
    return ai_response, suggestions

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Extract the user input
        data = request.json
        error = validate_input(data, ['message'])
        if error:
            return error

        user_message = data.get('message')
        traits = data.get('traits', [])
        trait_values = data.get('trait_values', {})

        # Log the received traits and trait values
        print(f"Received traits: {traits}")
        print(f"Received trait values: {trait_values}")

        # Prepare the traits context for the system prompt
        traits_context = prepare_traits_context(trait_values)

        # Define the system prompt with traits
        system_prompt = prepare_system_prompt(traits_context)

        # Prepare messages for the AI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        # Log the updated system prompt for verification
        print(f"System prompt being sent to the model: {system_prompt}")

        # Log the messages being sent to the model
        print(f"Messages sent to the model: {messages}")

        # Call Groq API for response generation
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )

        # Extract the response
        bot_message = response.choices[0].message.content.strip()

        # Parse response and suggestions
        ai_response, suggestions = parse_response(bot_message)

        # Send the JSON response
        return jsonify({'response': ai_response, 'suggestions': suggestions})

    except Exception as e:
        return handle_error(e, 500)


@app.route('/api/feedback', methods=['OPTIONS', 'POST'])
def feedback():
    if request.method == 'OPTIONS':
        # Handle CORS preflight
        return '', 200

    if request.method == 'POST':
        try:
            # Extract and validate feedback data
            data = request.json
            error = validate_input(data, ['feedback'])
            if error:
                return error

            feedback_data = data.get('feedback')

            # Process the feedback (e.g., save to a database or log it)
            print(f"Feedback received: {feedback_data}")
            return jsonify({'message': 'Feedback received successfully!'}), 200

        except Exception as e:
            return handle_error(e, 500)


if __name__ == '__main__':
    app.run(debug=True)