window.CONNECTION_GUIDE = {
  "version": "Connections review 2026-11-03",
  "steps": [
    {
      "id": "contacts",
      "title": "Star Citizen: add the person you met",
      "where": "Star Citizen main menu, Friends bar on the right.",
      "steps": [
        "Agree on the correct RSI handles. In the Star Citizen main menu, use the Friends bar on the right to add the other player. RSI states this bar is available after you have entered the Persistent Universe at least once.",
        "Have the other player check and accept the contact invitation. Confirm the correct person appears in your friends list. A tablet callsign can differ from their RSI handle.",
        "If already in the game together, use the Personal Inner Thought interaction with the player or mobiGlas Server player list to add them. This changes game contacts, not tablet membership."
      ],
      "result": "You can find each other in your contacts.",
      "help": "A wrong handle or an unaccepted contact invitation prevents this step. Confirm both with the other player before proceeding. This guide does not press game controls for you.",
      "source": "https://support.robertsspaceindustries.com/hc/en-us/articles/360008166874-Playing-with-Friends"
    },
    {
      "id": "party",
      "title": "Star Citizen: form your party",
      "where": "Star Citizen, mobiGlas > Commlink.",
      "steps": [
        "At the Star Citizen main menu, select your online friend in the right-side Friends list and use the offered join option for their game session. If unavailable, confirm their online status and whether their session can accept another player.",
        "Once in game, open Commlink with your assigned control, select the friend from contacts and send the game-party invitation. The invited player accepts it.",
        "Check the in-game party roster for both players. Joining the same session and accepting a game-party invitation are separate checks."
      ],
      "result": "The game shows both players in the party. A tablet party is a separate group.",
      "help": "Confirm the invitation came from the correct player. If it did not arrive, check the game party and contact lists before trying again.",
      "source": "https://support.robertsspaceindustries.com/hc/en-us/articles/360008166874-Playing-with-Friends"
    },
    {
      "id": "server",
      "title": "Discord: join the same server",
      "where": "Discord, the server your group agrees to use.",
      "steps": [
        "Obtain an invite to the Discord server your group uses. For tablet-managed voice, use OPEN INVITE in the tablet’s GUIDED SETUP when available; it must be the server configured for that integration.",
        "In Discord on PC, select the plus button near the bottom of the far-left server list, choose Join a Server, paste the invite and select Join Server. Alternatively open the invite directly, review the displayed settings and accept it.",
        "Finish any entry requirements shown by that server. Check its icon in the far-left server list and select it. Confirm that your group is using this same server."
      ],
      "result": "Both players can open the same Discord server. Already there? Mark this step done.",
      "help": "Ask the server owner for a working invite if yours is expired or unavailable. Do not share credentials. For tablet-managed voice, use the server shown by the tablet’s guided setup.",
      "source": "https://support.discord.com/hc/en-us/articles/360034842871-How-do-I-join-a-Server"
    },
    {
      "id": "voice",
      "title": "Discord: join the same voice channel",
      "where": "Discord, inside the agreed server’s channel list.",
      "steps": [
        "In Discord, select the agreed server’s icon in the far-left column. In its channel list just to the right, select the agreed voice channel marked with a speaker icon.",
        "Confirm your name and the intended people appear in that channel. A lock means you need that server’s permission; ask its administrator rather than changing tablet roles.",
        "Take turns speaking and confirm both people hear each other. Check Discord’s mute/deafen indicators if needed. Do not change unrelated recording or Windows audio routing."
      ],
      "result": "Both players are in the channel and have confirmed two-way voice.",
      "help": "A locked channel requires permission from the server’s administrators. If you cannot hear each other, check Discord mute/deafen indicators and the selected voice devices; do not change unrelated audio routing.",
      "source": "https://support.discord.com/hc/en-us/articles/19583625604887-Voice-Channels-FAQs"
    }
  ],
  "tablet": [
    [
      "Open the tablet’s party setup",
      "Open Social Tools, select CHAT in the top bar, then party under CHANNELS on the left. Complete the CODE → JOIN procedure below if needed. In PARTY OPS select GUIDED SETUP beside the voice controls."
    ],
    [
      "Check your tablet identity",
      "In the setup, check your callsign and RSI handle. Save a field only if you need to change it."
    ],
    [
      "Join the tablet party",
      "Use JOIN with the code from your tablet party leader. If you are forming the group and have no party yet, use CREATE PARTY and share the party code. Do not create a second group just because game-party membership is already present."
    ],
    [
      "Link Discord if required",
      "Select LINK DISCORD if shown. Review Discord’s authorization and finish linking the intended account. Return and check for Discord linked. If linking fails, use the reported error; do not create a replacement tablet account."
    ],
    [
      "Join the configured server",
      "Use OPEN INVITE if the setup offers it, then finish joining in Discord. If no invite is saved, ask the commander or site operator. Your own Discord server is not automatically the configured server."
    ],
    [
      "Connect yourself to voice",
      "In that Discord server, select an accessible voice channel. The tablet’s move request cannot connect an offline voice client."
    ],
    [
      "Request the party channel",
      "Back in the tablet’s Party voice controls, select JOIN PARTY VOICE once and wait for its result."
    ],
    [
      "Check the real result",
      "Look in Discord for your actual channel and the intended party members, then confirm two-way speech. OPEN IN DISCORD opens a channel link when available; opening a link alone is not proof of connection."
    ]
  ],
  "roleNotes": {
    "org-leader": "Choose who will form the game party. Your organization rank does not automatically make you a Discord server administrator or put every member in a game party.",
    "squadron-leader": "Agree which group your squadron is joining. Squadron leadership does not grant Discord channel permissions.",
    "flight-lead": "Use the game party and Discord channel agreed for your flight. Your tablet flight panel does not connect those pilots for you.",
    "element-lead": "Meet the pilots assigned to your element in the agreed game party and voice channel. No separate element voice channel is promised.",
    "wingman": "Join the game party and voice channel your group agrees to use. Check the actual group before discussing an operation.",
    "recruit": "You can arrange a game party and accessible Discord voice without treating a pending org application as approved membership.",
    "battle-captain": "Confirm the operation’s group with the organization leader. Delegated linked-party command does not itself connect you to game or Discord voice, or change party ownership.",
    "report-manager": "Reviewing reports does not require you to join game or voice. Use these steps only when participating as a player. Keep report contents out of shared voice channels.",
    "party-leader": "Agree who sends the game invitation and share the tablet party code if using tablet voice. Tablet leadership does not create the Star Citizen party automatically.",
    "party-member": "Ask your group leader which game party, tablet party and Discord channel to use. They are separate results.",
    "app-admin": "App administration does not require a game or voice connection. These are optional player steps, not prerequisites for reviewing the admin inbox. App-admin access does not grant Discord server administration."
  },
  "trouble": [
    [
      "Cannot find the player in game",
      "Check the RSI handle with the player and use the game contact list. A matching tablet callsign is not proof of game friendship."
    ],
    [
      "Game party is missing",
      "Return to the game-party step and confirm the invitation and acceptance. Joining the tablet party does not substitute for this."
    ],
    [
      "Discord channel is locked",
      "Ask a Discord server administrator for the appropriate access. Selecting a tutorial role cannot grant access."
    ],
    [
      "Discord party voice is not switched on",
      "The tablet integration is unavailable on this site. Use the ordinary Discord connection path, or ask the site operator to configure the service."
    ],
    [
      "Linking fails",
      "Keep the displayed error and ask the site operator to check the account-link service. Do not create a duplicate account or repeatedly authorize unknown accounts."
    ],
    [
      "Not in a party",
      "Join the intended tablet party before requesting its Discord voice channel."
    ],
    [
      "Not in the server",
      "Check that the linked Discord account joined the specific server configured for tablet party voice."
    ],
    [
      "Not connected to voice",
      "Join an accessible voice channel in the configured Discord server yourself, then request JOIN PARTY VOICE."
    ],
    [
      "Discord refused the move",
      "Ask the server/site administrator to check the bot’s Move Members permission and role/channel access. Do not change your role to bypass permissions."
    ],
    [
      "No response or still checking",
      "Keep the visible error or status and contact the site operator. No response is not success."
    ],
    [
      "You joined but cannot hear each other",
      "Check the actual Discord channel, mute/deafen state and selected input/output devices. Confirm speech in both directions; a linked badge alone proves neither."
    ]
  ],
  "sources": [
    {
      "title": "RSI: Playing with Friends",
      "url": "https://support.robertsspaceindustries.com/hc/en-us/articles/360008166874-Playing-with-Friends"
    },
    {
      "title": "Discord: Voice Channels FAQs",
      "url": "https://support.discord.com/hc/en-us/articles/19583625604887-Voice-Channels-FAQs"
    },
    {
      "title": "Discord: How do I join a Server?",
      "url": "https://support.discord.com/hc/en-us/articles/360034842871-How-do-I-join-a-Server"
    }
  ]
};
