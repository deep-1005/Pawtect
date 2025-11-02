const Animal = require('../models/Animal');
const Shelter = require('../models/Shelter');
const Donation = require('../models/Donation');

/**
 * Process chatbot queries with natural language understanding
 */
const processQuery = async (req, res) => {
  try {
    const { message, userRole } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const query = message.toLowerCase().trim();
    let response = '';
    let data = null;

    // PAW ID Lookup (highest priority) - Matches PAW-XXXXXXXX-XXXX format
    const pawIdMatch = message.match(/\b(PAW-[A-Z0-9]+-[A-Z0-9]+)\b/i) || 
                       message.match(/paw[-_\s]?id[:\s]+(PAW-[A-Z0-9]+-[A-Z0-9]+)/i) ||
                       message.match(/id[:\s]+(PAW-[A-Z0-9]+-[A-Z0-9]+)/i);
    
    if (pawIdMatch) {
      const pawId = pawIdMatch[1].toUpperCase();
      const result = await handlePawIdQuery(pawId);
      return res.json(result);
    }

    // Rescue Statistics
    if (query.includes('how many') && (query.includes('rescued') || query.includes('dogs') || query.includes('animals'))) {
      const result = await handleRescueStats();
      return res.json(result);
    }

    // Statistics queries
    if (query.includes('stats') || query.includes('statistics') || query.includes('total')) {
      const result = await handleRescueStats();
      return res.json(result);
    }

    // Shelter queries
    if (query.includes('shelter') || query.includes('nearby') || query.includes('near me')) {
      const result = await handleShelterQuery(query);
      return res.json(result);
    }

    // Donation queries
    if (query.includes('donate') || query.includes('donation') || query.includes('contribute') || query.includes('support financially')) {
      const result = handleDonationQuery(userRole);
      return res.json(result);
    }

    // Adoption queries
    if (query.includes('adopt') || query.includes('adoption') || query.includes('take home')) {
      const result = await handleAdoptionQuery();
      return res.json(result);
    }

    // About Pawtect
    if (query.includes('what is pawtect') || query.includes('about pawtect') || query.includes('who are you') || query.includes('what do you do')) {
      const result = handleAboutPawtect();
      return res.json(result);
    }

    // Available dogs
    if (query.includes('available') || query.includes('ready for adoption')) {
      const result = await handleAvailableDogsQuery();
      return res.json(result);
    }

    // Help/Commands
    if (query.includes('help') || query.includes('what can you do') || query.includes('commands')) {
      const result = handleHelpQuery(userRole);
      return res.json(result);
    }

    // Default response
    return res.json({
      success: true,
      response: `I'm not sure how to help with that. Here are some things I can do:\n\n• Look up dogs by PAW ID (e.g., "PAW123")\n• Show rescue statistics\n• Find nearby shelters\n• Guide you through donations\n• Help you adopt a dog\n• Tell you about Pawtect\n\nWhat would you like to know?`
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
      response: 'Sorry, I encountered an error. Please try again in a moment.'
    });
  }
};

/**
 * Handle PAW ID lookup
 */
async function handlePawIdQuery(pawId) {
  try {
    const dog = await Animal.findOne({ paw_id: pawId })
      .populate('shelter', 'name contactInfo address');

    if (!dog) {
      return {
        success: true,
        response: `I couldn't find a dog with PAW ID "${pawId}". Please check the ID and try again.\n\n💡 Tip: PAW IDs look like "PAW-MHGZYECW-7QHR" (format: PAW-XXXXXXXX-XXXX)`
      };
    }

    const shelterInfo = dog.shelter 
      ? `\n🏠 Currently at: ${dog.shelter.name}, ${dog.shelter.address?.city || 'Location not specified'}`
      : '';

    return {
      success: true,
      response: `🐕 Found dog with PAW ID: ${pawId}\n\n` +
                `Name: ${dog.name || 'Unnamed'}\n` +
                `Breed: ${dog.breed || dog.type || 'Mixed'}\n` +
                `Age: ${dog.age || 'Unknown'}\n` +
                `Gender: ${dog.gender || 'Unknown'}\n` +
                `Status: ${dog.status}\n` +
                `Health: ${dog.health_status || 'Not specified'}` +
                shelterInfo +
                (dog.status === 'Ready for Adoption' 
                  ? '\n\n✨ This dog is available for adoption! Click the "Adopt Me" button on their profile.'
                  : ''),
      data: { dog }
    };
  } catch (error) {
    console.error('PAW ID query error:', error);
    return {
      success: false,
      response: 'Sorry, I had trouble looking up that PAW ID. Please try again.'
    };
  }
}

/**
 * Handle rescue statistics
 */
async function handleRescueStats() {
  try {
    const totalDogs = await Animal.countDocuments();
    const rescued = await Animal.countDocuments({ status: { $ne: 'Deceased' } });
    const adopted = await Animal.countDocuments({ status: 'Adopted' });
    const readyForAdoption = await Animal.countDocuments({ status: 'Ready for Adoption' });
    const inTreatment = await Animal.countDocuments({ status: 'Under Treatment' });
    const totalShelters = await Shelter.countDocuments({ isActive: true });

    return {
      success: true,
      response: `📊 Pawtect Rescue Statistics:\n\n` +
                `🐕 Total Animals: ${totalDogs}\n` +
                `💚 Successfully Rescued: ${rescued}\n` +
                `🏡 Adopted: ${adopted}\n` +
                `✨ Ready for Adoption: ${readyForAdoption}\n` +
                `🏥 Under Treatment: ${inTreatment}\n` +
                `🏠 Active Shelters: ${totalShelters}\n\n` +
                `Every statistic represents a life saved! 🐾`,
      data: {
        stats: {
          'Total Animals': totalDogs,
          'Rescued': rescued,
          'Adopted': adopted,
          'Available': readyForAdoption,
          'In Treatment': inTreatment,
          'Shelters': totalShelters
        }
      }
    };
  } catch (error) {
    console.error('Stats query error:', error);
    return {
      success: false,
      response: 'Sorry, I had trouble fetching the statistics. Please try again.'
    };
  }
}

/**
 * Handle shelter queries
 */
async function handleShelterQuery(query) {
  try {
    // For now, get all active shelters (can be enhanced with location-based search)
    const shelters = await Shelter.find({ isActive: true })
      .select('name address contactInfo capacity')
      .limit(5);

    if (shelters.length === 0) {
      return {
        success: true,
        response: 'No shelters are currently registered in the system. Check back soon!'
      };
    }

    let response = `🏠 Here are ${shelters.length} active shelters:\n\n`;
    
    shelters.forEach((shelter, idx) => {
      response += `${idx + 1}. ${shelter.name}\n`;
      response += `   📍 ${shelter.address?.city || 'Location not specified'}, ${shelter.address?.state || ''}\n`;
      response += `   📞 ${shelter.contactInfo?.phone || 'N/A'}\n`;
      response += `   🐕 Capacity: ${shelter.capacity?.current || 0}/${shelter.capacity?.total || 'N/A'}\n\n`;
    });

    response += `💡 Visit the Shelters page for more details and directions!`;

    return {
      success: true,
      response,
      data: { shelters }
    };
  } catch (error) {
    console.error('Shelter query error:', error);
    return {
      success: false,
      response: 'Sorry, I had trouble finding shelters. Please try again.'
    };
  }
}

/**
 * Handle donation queries
 */
function handleDonationQuery(userRole) {
  return {
    success: true,
    response: `💰 Thank you for wanting to support our cause!\n\n` +
              `You can donate in three ways:\n\n` +
              `1. 🏠 Donate to Shelters - Support a specific shelter\n` +
              `2. 💚 Support Pawtect - Help our platform grow\n` +
              `3. 🐕 Sponsor a Dog - Directly support a rescued animal\n\n` +
              `We accept crypto payments via MetaMask! 🦊\n\n` +
              `Click the "Support Us" button in the top menu to donate now!`
  };
}

/**
 * Handle adoption queries
 */
async function handleAdoptionQuery() {
  try {
    const availableDogs = await Animal.find({ status: 'Ready for Adoption' })
      .limit(5)
      .select('name paw_id breed type age photos');

    if (availableDogs.length === 0) {
      return {
        success: true,
        response: `Currently, there are no dogs available for adoption. Check back soon, or contact a shelter directly for more information! 🐾`
      };
    }

    let response = `🐕 Great! We have ${availableDogs.length} dogs ready for adoption:\n\n`;
    
    availableDogs.forEach((dog, idx) => {
      response += `${idx + 1}. ${dog.name || 'Unnamed'} (${dog.paw_id})\n`;
      response += `   ${dog.breed || dog.type || 'Mixed breed'}, ${dog.age || 'Age unknown'}\n\n`;
    });

    response += `💡 To adopt:\n` +
                `1. Visit the Dashboard\n` +
                `2. Find the dog you like\n` +
                `3. Click "Adopt Me" button\n` +
                `4. Fill out the adoption form\n\n` +
                `We'll connect you with the shelter! 🏡`;

    return {
      success: true,
      response
    };
  } catch (error) {
    console.error('Adoption query error:', error);
    return {
      success: false,
      response: 'Sorry, I had trouble finding available dogs. Please try again.'
    };
  }
}

/**
 * Handle available dogs query
 */
async function handleAvailableDogsQuery() {
  return await handleAdoptionQuery();
}

/**
 * About Pawtect
 */
function handleAboutPawtect() {
  return {
    success: true,
    response: `🐾 About Pawtect\n\n` +
              `Pawtect is a comprehensive animal rescue and welfare platform connecting:\n\n` +
              `• 👥 Citizens who care about animals\n` +
              `• 🏠 Shelters providing care\n` +
              `• 🚨 Authorities handling cruelty cases\n` +
              `• 💚 NGOs working for animal welfare\n\n` +
              `What we offer:\n\n` +
              `✅ Report & rescue street animals\n` +
              `✅ Track rescued dogs via PAW IDs\n` +
              `✅ Find & support shelters\n` +
              `✅ Adopt rescued animals\n` +
              `✅ Report animal cruelty\n` +
              `✅ Donate via crypto (MetaMask)\n` +
              `✅ QR code sharing for dogs\n\n` +
              `Our mission: Give every street animal a chance at a better life! 🐕💚`
  };
}

/**
 * Help query
 */
function handleHelpQuery(userRole) {
  const commonCommands = `🤖 Hi! I'm Furries, your Pawtect assistant!\n\n` +
                        `Here's what I can help you with:\n\n` +
                        `🔍 Dog Lookup:\n` +
                        `• "Show me PAW123"\n` +
                        `• "Find dog with ID PAW456"\n\n` +
                        `📊 Statistics:\n` +
                        `• "How many dogs rescued?"\n` +
                        `• "Show stats"\n\n` +
                        `🏠 Shelters:\n` +
                        `• "Find nearby shelters"\n` +
                        `• "Show me shelters"\n\n` +
                        `💰 Donations:\n` +
                        `• "I want to donate"\n` +
                        `• "How can I contribute?"\n\n` +
                        `🐕 Adoption:\n` +
                        `• "I want to adopt"\n` +
                        `• "Show available dogs"\n\n` +
                        `ℹ️ Information:\n` +
                        `• "What is Pawtect?"\n` +
                        `• "What do you offer?"\n\n`;

  const shelterSpecific = userRole === 'authority' 
    ? `🏠 As a shelter, you can also ask me to quickly look up dogs in your care by their PAW ID!`
    : '';

  return {
    success: true,
    response: commonCommands + shelterSpecific + `\nJust type your question naturally! 🐾`
  };
}

// Export the main function
module.exports = { processQuery };
