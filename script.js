let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

// Speech Synthesis (Text-to-Speech)
function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1; // Normal speed
    text_speak.pitch = 1.2; // Slightly higher pitch for better clarity
    text_speak.volume = 1; // Full volume
    text_speak.lang = "en-GB"; // Using British English for a clearer voice
    window.speechSynthesis.speak(text_speak);
}

// Function to wish based on the time of day
function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning, Sir.");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon, Sir.");
    } else {
        speak("Good Evening, Sir.");
    }
}

// Speech Recognition (Voice input from user)
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    speak("Sorry, I couldn't understand you. Please try again.");
    voice.style.display = "none";
    btn.style.display = "flex";
};

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
}

// Start voice recognition on button click
btn.addEventListener("click", () => {
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
    content.innerText = "Listening...";
});

// Handle the user's voice command with natural responses
function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    const commands = [
        { keywords: ["hello", "hey"], response: "Hello! How can I assist you today?" },
        { keywords: ["who are you"], response: "I am CTRL, your brainy assistant, always here to help you out made by Vishal." },
        { keywords: ["how are you"], response: "I'm fine, thank you for asking! How about you?" },
        { keywords: ["who is the owner of you"], response: "Vishal is the owner of me." },
        { keywords: ["open youtube"], response: "Sure, opening YouTube...", action: () => window.open("https://youtube.com/", "_blank") },
        { keywords: ["open google"], response: "Opening Google for you...", action: () => window.open("https://google.com/", "_blank") },
        { keywords: ["open facebook"], response: "Sure, opening Facebook...", action: () => window.open("https://facebook.com/", "_blank") },
        { keywords: ["open instagram"], response: "Opening Instagram...", action: () => window.open("https://instagram.com/", "_blank") },
        { keywords: ["time"], response: () => `The current time is ${new Date().toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" })}` },
        { keywords: ["date"], response: () => `Today's date is ${new Date().toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}` },
        { keywords: ["what is your name"], response: "I am CTRL, your brainy assistant." },
        { keywords: ["tell me a joke"], response: "Why don’t skeletons fight each other? They don’t have the guts!" },
        { keywords: ["tell me a riddle"], response: "What has keys but can’t open locks? A piano!" },
        { keywords: ["what is artificial intelligence"], response: "Artificial Intelligence is the simulation of human intelligence in machines that are programmed to think, learn, and solve problems like humans." },
        { keywords: ["how many planets are there"], response: "There are 8 planets in the solar system." },
        { keywords: ["capital of"], response: (message) => {
            let country = message.split("of")[1].trim();
            return `The capital of ${country} is not available in my database right now. Please check manually.`;
        }},
        { keywords: ["what is your favorite color"], response: "I don't have a favorite color, but I think all colors are beautiful!" },
        { keywords: ["what is your favorite food"], response: "I don't eat, but I hear pizza is quite popular!" },
        { keywords: ["what is the theory of relativity"], response: "The theory of relativity, proposed by Albert Einstein, explains how space and time are linked for objects that are moving at a consistent speed in a straight line." },
        { keywords: ["first person on the moon"], response: "Neil Armstrong was the first person to walk on the moon on July 20th, 1969." },
        { keywords: ["tell me about yourself"], response: "I am CTRL, your brainy assistant, designed to help you with various tasks and provide information. I was created by Vishal." },
        { keywords: ["what is your purpose"], response: "My purpose is to assist you with tasks, provide information, and make your life easier!" },
        { keywords: ["open calculator"], response: "Opening Calculator...", action: () => window.open("calculator://") },
        { keywords: ["open whatsapp"], response: "Opening WhatsApp...", action: () => window.open("whatsapp://") },
        // Add more commands here...
    ];

    const foundCommand = commands.find(command => command.keywords.some(keyword => message.includes(keyword)));

    if (foundCommand) {
        if (typeof foundCommand.response === "function") {
            speak(foundCommand.response(message));
        } else {
            speak(foundCommand.response);
            foundCommand.action && foundCommand.action();
        }
    } else {
        speak("I could not find exactly what you asked, but here’s what I found on the internet...");
        window.open(`https://www.google.com/search?q=${message}`, "_blank");
    }
}

// Function to interact with OpenAI's API for ChatGPT
async function getChatGPTResponse(prompt) {
    const apiKey = 'YOUR_API_KEY';  // Replace with your OpenAI API key
    const endpoint = 'https://api.openai.com/v1/completions';

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",  // You can use "gpt-4" for a more advanced model
            messages: [
                { role: "system", content: "You are a helpful assistant, with a brain-like intuition." },
                { role: "user", content: prompt }
            ],
            max_tokens: 150,
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Event listener for form submission to send input to ChatGPT and display response
document.getElementById('submitBtn').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;
    if (userInput) {
        const response = await getChatGPTResponse(userInput);
        document.getElementById('chatbox').innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
        document.getElementById('chatbox').innerHTML += `<p><strong>ChatGPT:</strong> ${response}</p>`;
        speak(response);  // Let the assistant speak the response as well
        document.getElementById('userInput').value = '';  // Clear input field
    }
});
