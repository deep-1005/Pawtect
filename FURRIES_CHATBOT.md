# Furries 🐾 - AI Chatbot Assistant

## Overview
Furries is an intelligent chatbot assistant built into Pawtect to help citizens and shelters quickly access information and perform actions without navigating through the entire platform.

## Features

### 🔍 **Dog Lookup by PAW ID**
Users can instantly retrieve detailed information about any dog by providing their PAW ID.

**Example Queries:**
- "Show me PAW123"
- "Find dog with ID PAW456"
- "What is PAW789?"
- "Details for dog PAW001"

**Response Includes:**
- Dog name, breed, age, gender
- Current status (Ready for Adoption, Under Treatment, etc.)
- Health status
- Current shelter location
- Adoption availability

### 📊 **Rescue Statistics**
Get real-time statistics about Pawtect's impact.

**Example Queries:**
- "How many dogs have been rescued?"
- "Show me statistics"
- "Total animals"
- "How many adoptions?"

**Response Includes:**
- Total animals in system
- Successfully rescued count
- Adopted animals
- Ready for adoption count
- Animals under treatment
- Active shelters

### 🏠 **Shelter Information**
Find nearby shelters and their details.

**Example Queries:**
- "Show me nearby shelters"
- "Find shelters"
- "Shelters near me"
- "Where can I find a shelter?"

**Response Includes:**
- Shelter names and locations
- Contact information
- Current capacity
- Available space
- Up to 5 shelters listed

### 💰 **Donation Guidance**
Learn how to donate to the platform.

**Example Queries:**
- "I want to donate"
- "How can I contribute?"
- "Support shelters"
- "Make a donation"

**Response Provides:**
- Three donation options (Shelter, Platform, Sponsor)
- MetaMask crypto payment info
- Navigation to donation page

### 🐕 **Adoption Assistance**
Get help with the adoption process.

**Example Queries:**
- "I want to adopt a dog"
- "How do I adopt?"
- "Show available dogs"
- "Adoption process"

**Response Includes:**
- List of dogs ready for adoption
- Step-by-step adoption process
- Contact information
- Requirements

### ℹ️ **About Pawtect**
Learn about the platform and its mission.

**Example Queries:**
- "What is Pawtect?"
- "About Pawtect"
- "What do you offer?"
- "Tell me about this platform"

**Response Covers:**
- Platform mission
- Key features
- How it works
- User types (citizens, shelters, authorities, NGOs)

### ❓ **Help Commands**
Get a list of all available commands.

**Example Queries:**
- "Help"
- "What can you do?"
- "Commands"
- "Show me features"

## User Experience

### **Visual Design**
- **Floating Button:** Bottom-right corner with pulsing paw icon
- **Chat Interface:** Clean, modern design with bot and user message bubbles
- **Quick Actions:** Preset buttons for common queries
- **Typing Indicator:** Shows when Furries is processing
- **Rich Responses:** Displays structured data (dog cards, shelter lists, stats)

### **Accessibility**
- Only visible to **citizens** and **shelters** (not admins)
- Role-aware responses (shelters get additional context)
- Mobile-responsive design
- Keyboard shortcuts (Enter to send)

## Technical Details

### **Frontend Component** (`Furries.jsx`)
- React component with state management
- Message history tracking
- Typing indicator
- Quick action buttons
- Rich data rendering (dogs, shelters, stats)
- Animated entrance/exit

### **Backend API** (`chatbotController.js`)
- Natural language processing
- Pattern matching for queries
- Database queries (Animals, Shelters, Donations)
- Role-based responses
- Error handling

### **API Endpoint**
```
POST /api/chatbot
```

**Request Body:**
```json
{
  "message": "Show me PAW123",
  "userRole": "citizen"
}
```

**Response:**
```json
{
  "success": true,
  "response": "🐕 Found dog with PAW ID: PAW123...",
  "data": {
    "dog": { /* dog object */ }
  }
}
```

## Query Processing

### **Pattern Matching Algorithm**
1. **PAW ID Detection** (Highest Priority)
   - Regex patterns: `paw[-_\s]?id[:\s]+([a-z0-9]+)`
   - Direct ID: `PAW[0-9]+`
   - Flexible formatting

2. **Keyword Detection**
   - Statistics: "how many", "stats", "total"
   - Shelters: "shelter", "nearby", "near me"
   - Donations: "donate", "contribute", "support"
   - Adoption: "adopt", "adoption", "take home"
   - About: "what is pawtect", "about"

3. **Default Fallback**
   - Shows help message with available commands

## Integration

### **Dashboard Integration**
```jsx
// Only show for non-admin users
{userRole !== 'authority' && (
  <Furries 
    isOpen={showChatbot} 
    onClose={() => setShowChatbot(false)}
    userRole={userRole}
  />
)}
```

### **Floating Button**
- Fixed position: bottom-right
- Gradient background
- Pulsing notification badge
- Hover tooltip
- Smooth animations

## Future Enhancements

### **Planned Features**
- [ ] Voice input/output
- [ ] Multi-language support (Hindi, Regional languages)
- [ ] Image recognition (upload photo of dog)
- [ ] Geolocation-based shelter search
- [ ] WhatsApp integration
- [ ] Advanced NLP (GPT-powered)
- [ ] Conversation memory (context retention)
- [ ] Scheduled reminders (vaccination, checkups)
- [ ] Real-time notifications
- [ ] Export conversation history

### **ML Improvements**
- [ ] Intent classification model
- [ ] Entity extraction
- [ ] Sentiment analysis
- [ ] FAQ auto-learning
- [ ] Personalized recommendations

## Usage Examples

### **Scenario 1: Finding a Specific Dog**
**User:** "I saw a poster with PAW ID PAW042, tell me about this dog"

**Furries:** 
```
🐕 Found dog with PAW ID: PAW042

Name: Bruno
Breed: Labrador Mix
Age: 2 years
Gender: Male
Status: Ready for Adoption
Health: Fully Vaccinated

🏠 Currently at: Happy Paws Shelter, Bangalore

✨ This dog is available for adoption! Click the "Adopt Me" button on their profile.
```

### **Scenario 2: Quick Statistics**
**User:** "How many dogs have you rescued?"

**Furries:**
```
📊 Pawtect Rescue Statistics:

🐕 Total Animals: 127
💚 Successfully Rescued: 125
🏡 Adopted: 42
✨ Ready for Adoption: 38
🏥 Under Treatment: 35
🏠 Active Shelters: 8

Every statistic represents a life saved! 🐾
```

### **Scenario 3: Shelter Search**
**User:** "Show me shelters in my area"

**Furries:**
```
🏠 Here are 5 active shelters:

1. Happy Paws Shelter
   📍 Bangalore, Karnataka
   📞 9876543210
   🐕 Capacity: 15/50

2. Street Dogs Care
   📍 Mumbai, Maharashtra
   📞 9123456789
   🐕 Capacity: 32/40

[... more shelters ...]

💡 Visit the Shelters page for more details and directions!
```

## Benefits

### **For Citizens**
- ⚡ **Fast access** to information
- 🎯 **No navigation** required
- 📱 **Mobile-friendly** interface
- 🔍 **Quick PAW ID lookup**
- 💬 **Natural conversation**

### **For Shelters**
- 📊 **Quick stats** checking
- 🐕 **Instant dog lookups** by ID
- 👥 **Answer visitor queries**
- 📞 **Reduce phone calls**
- ⏱️ **Time-saving** tool

### **For Pawtect Platform**
- 📈 **Increased engagement**
- 💡 **Better UX**
- 📊 **Usage analytics**
- 🤖 **Reduced support burden**
- 🎉 **Modern appeal**

## Customization

### **Personality**
Furries is designed to be:
- 🐾 **Friendly & Warm**
- 💚 **Caring & Empathetic**
- 🎯 **Helpful & Informative**
- 🐕 **Dog-themed** (paw emojis, dog terminology)

### **Tone**
- Professional but approachable
- Encouraging for adoption/donations
- Compassionate about animal welfare
- Excited about success stories

## Support

### **Common Issues**

**Issue:** Chatbot not responding
- **Solution:** Check backend server is running
- **Solution:** Verify `/api/chatbot` endpoint is accessible

**Issue:** PAW ID not found
- **Solution:** Verify correct PAW ID format
- **Solution:** Check if dog exists in database

**Issue:** Button not showing
- **Solution:** Verify user is not logged in as admin
- **Solution:** Check localStorage for userRole

## Best Practices

### **For Users**
- Be specific with PAW IDs
- Use natural language
- Try quick action buttons
- Check spelling of PAW IDs

### **For Developers**
- Monitor chatbot logs
- Update response patterns regularly
- Add new query types as needed
- Test with real user queries
- Keep responses concise
- Use emojis for visual appeal

---

**Made with 💚 for Pawtect**  
Helping every paw find a home! 🐾
