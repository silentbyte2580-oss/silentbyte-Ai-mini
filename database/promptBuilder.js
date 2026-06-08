const { 
    userPrompt 
}   = require('./prompt/userPrompt.js');
const { 
    responseController 
}   = require('./prompt/responseController.js');
const { 
    aiBehavior 
}   = require('./prompt/aiBehavior.js');
const { 
    memoryPrompt 
} = require('./prompt/memoryPrompt.js');
const { 
    imagePrompt 
}  = require('./prompt/imagePrompt.js');
const { 
    safetyPrompt 
} = require('./prompt/safetyPrompt.js');

/**
 * Combines all prompt modules into one master training prompt.
 * Order matters: identity → safety → user tone → memory → image rules
 */
const buildMasterPrompt = () => `
${aiBehavior}

${safetyPrompt}

${userPrompt}

${responseController}

${memoryPrompt}

${imagePrompt}
`.trim();

module.exports = { buildMasterPrompt };