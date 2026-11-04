window.CONNECTION_GUIDE = {
  "version": "Connections source review 2026-11-04",
  "steps": [
    {
      "id": "contacts",
      "title": "Star Citizen: add the person you met",
      "where": "Star Citizen main menu, Friends bar on the right.",
      "steps": [
        "Ask the other player for their exact RSI handle. A tablet callsign can be different. RSI identifies the Friends panel on the right of the game main menu, available after first entering the Persistent Universe.",
        "CURRENT GAME CONTROL NOT VERIFIED: the final add-contact field/button and the recipient’s acceptance control have not been verified in the current LIVE build. The official article’s illustration labels ADD FRIENDS +, but that image is from Alpha 4.9. Do not treat that old picture as a current step.",
        "Stop this optional game-contact procedure at that point if the controls are unclear. Continue with tablet or Discord setup independently. Game friendship is confirmed only when the correct handle appears in each player’s contacts."
      ],
      "result": "You can find each other in your contacts.",
      "help": "Remaining evidence needed: the current LIVE contact-add field/button and contact-request acceptance screen. No guessed action is supplied. Tablet membership and Discord voice do not depend on completing this optional game step.",
      "source": "https://support.robertsspaceindustries.com/hc/en-us/articles/360008166874-Playing-with-Friends"
    },
    {
      "id": "party",
      "title": "Star Citizen: form your party",
      "where": "Star Citizen, mobiGlas > Commlink.",
      "steps": [
        "CURRENT GAME CONTROL NOT VERIFIED: after both players are contacts, the exact current main-menu join-session action is not established here. Do not infer a button from this guide. Joining one server and joining a party are separate results.",
        "Once in game, RSI documents F11 as the default shortcut to Commlink in mobiGlas. Read Find your own game binding in this guide if your controls differ. Select the intended friend in Commlink. The current invitation button label and acceptance control still need in-game verification; this guide does not claim that step is complete.",
        "Check the in-game party roster for both players. Joining the same session and accepting a game-party invitation are separate checks."
      ],
      "result": "The game shows both players in the party. A tablet party is a separate group.",
      "help": "Remaining evidence needed: the current LIVE join-session menu, Commlink party-invite action, and recipient acceptance control. Until those are verified, game-party setup remains incomplete. Continue the independent tablet or Discord procedure if that is your task.",
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
      "help": "For mute, deafen and device inspection, use the Discord audio check section in this guide. A locked channel requires permission from that server’s administrator.",
      "source": "https://support.discord.com/hc/en-us/articles/19583625604887-Voice-Channels-FAQs"
    }
  ],
  "tablet": [
    [
      "Open the tablet’s party setup",
      "Open Social Tools, select CHAT in the top bar, then party under CHANNELS on the left. Use Join a tablet party — complete procedure in this guide if needed. In PARTY OPS select GUIDED SETUP beside the voice controls."
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
      "Open Discord audio check using the button here for the exact microphone, headphones and User Settings route. A linked badge alone does not confirm speech in either direction."
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
    },
    {
      "title": "Discord: Sign-Up and Registration Guide",
      "url": "https://support.discord.com/hc/en-us/articles/31676852332439-Discord-Sign-Up-and-Registration-Guide"
    },
    {
      "title": "Discord: Voice and Video Troubleshooting Guide",
      "url": "https://support.discord.com/hc/en-us/articles/360045138471-Discord-Voice-and-Video-Troubleshooting-Guide"
    },
    {
      "title": "Discord: Voice, Video and Streaming Guide",
      "url": "https://support.discord.com/hc/en-us/articles/33030151293079-Discord-Voice-Video-Streaming-Guide"
    },
    {
      "title": "RSI: Options and Advanced Controls Customization",
      "url": "https://support.robertsspaceindustries.com/hc/en-us/articles/360000183328-Create-export-and-import-custom-profiles"
    }
  ],
  "account": [
    "On your PC, open https://discord.com/login in Chrome. Already have an account? Sign in there. For a new account, select Register below the Log In button. The browser version does not require installing the Discord app; the optional desktop download is at https://discord.com/download.",
    "In Create an account, enter your Email, Display Name if requested, Username, Password and Date of Birth (Month, Day, Year) in the labeled fields. Review the displayed terms. When you choose to create the account, select Create Account below the fields. Complete any verification Discord presents yourself.",
    "Check that Discord opens to your account and shows your profile in the lower-left area. Complete any email-verification prompt. If Email is already registered appears, return to Log In and recover the existing account instead of creating another.",
    "Return to this guide and continue with stage 1, Discord: join the same server. Use this same Discord account when signing into the tablet. Creating the Discord account alone does not join your group’s server."
  ],
  "audio": [
    "In Discord on PC, look beside your profile at the bottom left. The microphone icon controls Mute; the headphones icon controls Deafen. A crossed-out microphone prevents your speech; a crossed-out headphones icon prevents hearing others. Only switch these off when you are ready to be heard.",
    "Select the User Settings cogwheel beside those controls at the bottom left. Select Voice & Video in the left sidebar, then its Voice tab. Read Input Device and Output Device: they should name the microphone and headphones you intend Discord to use.",
    "In that Voice tab, inspect Input Mode. If Push to Talk is selected, read its displayed shortcut and hold that control when speaking. Preserve a deliberate push-to-talk choice; do not reset settings to troubleshoot.",
    "Return to the agreed voice channel and take turns speaking. Confirm that each person hears the other. If your microphone or headphones are absent from the device list, or their names are unclear, stop changing settings and ask the person who configured that equipment. If only this channel is blocked or you are server-muted/deafened, ask its server owner to check Connect and Speak permissions and remove the restriction. Keep two-way voice unconfirmed until it works; do not reset Windows, recording, mixer or headset settings."
  ],
  "bindings": [
    "In Star Citizen, use OPTIONS at the bottom left of the main menu, then KEYBINDINGS along the top. In the lower-right peripheral selector, choose Keyboard / Mouse to inspect keyboard controls.",
    "Select ADVANCED CONTROLS CUSTOMIZATION at the bottom left to inspect the action list and assigned keys for your selected device. Do not double-click an assignment, reset controls or import another profile merely to inspect it.",
    "RSI documents F11 as the default Commlink shortcut; it is in the keyboard’s top function-key row. A custom profile may differ. BLOCKED AT ACTION LOOKUP: the current category/action label for that shortcut has not been verified. If your profile changes it and you cannot identify it, stop here. A current KEYBINDINGS action-list view is needed before this guide can name the exact customized-binding lookup."
  ]
};
